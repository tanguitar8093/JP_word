import { v4 as uuidv4 } from "uuid";

const NOTEBOOK_STORAGE_KEY = "notebooks";
const CURRENT_NOTEBOOK_ID_KEY = "currentNotebookId";

// Normalize a word's study counter to the canonical field 'studied'
const _normalizeStudy = (word) => {
  if (!word || typeof word !== "object") return word;
  const base = word.studied ?? 0;
  const n = Number(base);
  const v = Number.isFinite(n) && n >= 0 ? n : 0;
  return { ...word, studied: v };
};

// Private method to get notebooks from localStorage
const _getNotebooksFromStorage = () => {
  try {
    const notebooks = localStorage.getItem(NOTEBOOK_STORAGE_KEY);
    return notebooks ? JSON.parse(notebooks) : {};
  } catch (error) {
    console.error("Error reading from localStorage", error);
    return {};
  }
};

// Private method to save notebooks to localStorage
const _saveNotebooksToStorage = (notebooks) => {
  try {
    localStorage.setItem(NOTEBOOK_STORAGE_KEY, JSON.stringify(notebooks));
  } catch (error) {
    console.error("notebookService: Error saving to localStorage", error);
  }
};

// Migration: ensure all words have a numeric 'studied' (remove legacy fields)
const _migrateStudyFields = (notebooks) => {
  let changed = false;
  for (const id of Object.keys(notebooks)) {
    const nb = notebooks[id];
    if (!nb || !Array.isArray(nb.context)) continue;
    const newCtx = nb.context.map((w) => _normalizeStudy(w));
    // Also ensure ids exist
    const ensured = _ensureContextIds(newCtx);
    // Detect changes roughly
    if (ensured !== nb.context) {
      notebooks[id] = { ...nb, context: ensured };
      changed = true;
    }
  }
  if (changed) _saveNotebooksToStorage(notebooks);
};

// Private method for validating the context structure
const _validateContext = (context) => {
  if (!Array.isArray(context)) {
    throw new Error("Context must be an array.");
  }

  for (const word of context) {
    // Allow empty objects for new notebooks
    if (Object.keys(word).length === 0) continue;

    const requiredKeys = [
      "jp_word",
      "kanji_jp_word",
      "ch_word",
      "jp_ex_statement",
      "ch_ex_statement",
      "type",
      "options",
      "jp_ex_statement_context",
      "proficiency",
    ];
    for (const key of requiredKeys) {
      if (!(key in word)) {
        throw new Error(`Invalid word object: missing key \"${key}\".`);
      }
    }
    if (
      !Array.isArray(word.options) ||
      !Array.isArray(word.jp_ex_statement_context)
    ) {
      throw new Error('Invalid word object: "options" must be an array.');
    }
  }
  return true;
};

// Private method to ensure all words in a context have an ID
const _ensureContextIds = (context) => {
  if (!Array.isArray(context)) return [];
  return context.map((word) => {
    // also check for empty object
    let newWord = { ...word };
    if (!newWord.id && Object.keys(newWord).length > 0) {
      newWord.id = uuidv4();
    }
    // Normalize study counter to canonical 'studied'
    if (Object.keys(newWord).length > 0) {
      const base = newWord.studied ?? 0;
      const n = Number(base);
      const v = Number.isFinite(n) && n >= 0 ? n : 0;
      newWord.studied = v;
    }
    return newWord;
  });
};

// Public methods
const notebookService = {
  init: () => {
    const notebooks = _getNotebooksFromStorage();
    if (Object.keys(notebooks).length === 0) {
      const id = uuidv4();
      const initialNotebook = {
        [id]: {
          id,
          name: "Hello JP word",
          word_test: {},
          context: [
            {
              id: uuidv4(),
              jp_word: "こんにちは",
              kanji_jp_word: "今日は",
              ch_word: "你好",
              jp_ex_statement: "こんにちは、良い一日を！",
              ch_ex_statement: "你好，祝你有美好的一天！",
              type: "greeting",
              options: ["a", "b", "c"],
              proficiency: 3,
              jp_context: [
                { kanji: "今日", hiragana: "こんにち" },
                { kanji: "", hiragana: "は" },
              ],
              jp_ex_statement_context: [
                { kanji: "今日", hiragana: "こんにち" },
                { kanji: "", hiragana: "は" },
                { kanji: "良", hiragana: "よ" },
                { kanji: "い", hiragana: "い" },
                { kanji: "一日", hiragana: "いちにち" },
                { kanji: "", hiragana: "を" },
                { kanji: "", hiragana: "！" },
              ],
              studied: 0,
            },
          ],
        },
      };
      _saveNotebooksToStorage(initialNotebook);
      return;
    }
    // Run migration for existing data
    try {
      _migrateStudyFields(notebooks);
    } catch (e) {
      console.warn("notebookService: migration skipped", e);
    }
  },
  initCurrentNotebook: () => {
    const notebooks = _getNotebooksFromStorage();
    const currentNotebookId = localStorage.getItem(CURRENT_NOTEBOOK_ID_KEY);

    if (!currentNotebookId || !notebooks[currentNotebookId]) {
      const firstNotebookId = Object.keys(notebooks)[0];
      if (firstNotebookId) {
        localStorage.setItem(CURRENT_NOTEBOOK_ID_KEY, firstNotebookId);
      }
    }
  },

  getCurrentNotebookId: () => {
    return localStorage.getItem(CURRENT_NOTEBOOK_ID_KEY);
  },

  setCurrentNotebookId: (id) => {
    localStorage.setItem(CURRENT_NOTEBOOK_ID_KEY, id);
  },

  getNotebooks: () => {
    const notebooks = _getNotebooksFromStorage();
    return Object.values(notebooks);
  },

  getNotebook: (id) => {
    const notebooks = _getNotebooksFromStorage();
    return notebooks[id];
  },

  createNotebook: (name) => {
    if (!name || name.length > 20) {
      throw new Error(
        "Notebook name cannot be empty and must be 20 characters or less."
      );
    }
    const notebooks = _getNotebooksFromStorage();
    const id = uuidv4();
    notebooks[id] = {
      id,
      name,
      word_test: {},
      context: [{}],
    };
    _saveNotebooksToStorage(notebooks);
    return notebooks[id];
  },

  updateNotebook: (id, { name, context, word_test }) => {
    const notebooks = _getNotebooksFromStorage();
    if (!notebooks[id]) {
      throw new Error("Notebook not found.");
    }

    if (name) {
      if (name.length > 20) {
        throw new Error("Notebook name must be 20 characters or less.");
      }
      notebooks[id].name = name;
    }

    if (context) {
      _validateContext(context);
      notebooks[id].context = _ensureContextIds(context);
    }

    // Allow updating top-level word_test store for WordTest progress/state
    if (word_test !== undefined) {
      // Accept null to clear, object to set/merge
      if (word_test === null) {
        notebooks[id].word_test = {};
      } else if (typeof word_test === "object") {
        notebooks[id].word_test = { ...word_test };
      } else {
        console.warn(
          "notebookService.updateNotebook: ignored invalid word_test value"
        );
      }
    }

    _saveNotebooksToStorage(notebooks);
    return notebooks[id];
  },

  deleteNotebook: (id) => {
    const notebooks = _getNotebooksFromStorage();
    if (!notebooks[id]) {
      throw new Error("Notebook not found.");
    }
    delete notebooks[id];
    _saveNotebooksToStorage(notebooks);
  },

  deleteWordsFromNotebook: (notebookId, wordIds) => {
    const notebooks = _getNotebooksFromStorage();
    if (!notebooks[notebookId]) {
      throw new Error("Notebook not found.");
    }
    if (!Array.isArray(wordIds)) {
      throw new Error("wordIds must be an array.");
    }

    notebooks[notebookId].context = notebooks[notebookId].context.filter(
      (word) => !wordIds.includes(word.id)
    );

    _saveNotebooksToStorage(notebooks);
    return notebooks[notebookId];
  },

  updateWordInNotebook: (notebookId, wordId, updates) => {
    const notebooks = _getNotebooksFromStorage();
    if (!notebooks[notebookId]) {
      throw new Error("Notebook not found.");
    }

    const wordIndex = notebooks[notebookId].context.findIndex(
      (word) => word.id === wordId
    );
    if (wordIndex === -1) {
      throw new Error("Word not found in the notebook.");
    }

    const oldWord = notebooks[notebookId].context[wordIndex];
    notebooks[notebookId].context[wordIndex] = {
      ...oldWord,
      ...updates,
    };
    _saveNotebooksToStorage(notebooks);
    return notebooks[notebookId].context[wordIndex];
  },

  mergeNotebooks: ({ primaryNotebookId, sourceNotebookIds }) => {
    const notebooks = _getNotebooksFromStorage();

    const primaryNotebook = notebooks[primaryNotebookId];
    if (!primaryNotebook) {
      throw new Error("Primary notebook not found.");
    }

    const sourceNotebooks = sourceNotebookIds
      .map((id) => notebooks[id])
      .filter(Boolean);
    if (sourceNotebooks.length !== sourceNotebookIds.length) {
      throw new Error("One or more source notebooks not found.");
    }

    // --- De-duplication Logic ---
    // The following block prevents duplicate words from being added during a merge.
    // It uses a Map with a composite key of (`jp_word|kanji_jp_word`) to uniquely identify a word.
    // This ensures that words with the same hiragana but different kanji (e.g., 石 vs 医師) are treated as distinct entries.
    // The words from the primary notebook are always kept in case of conflict.
    const mergedContextMap = new Map();
    const getWordKey = (word) => `${word.jp_word}|${word.kanji_jp_word || ""}`;

    // Add words from the primary notebook first
    primaryNotebook.context.forEach((word) => {
      if (word.jp_word) {
        // Ensure word is not empty
        const key = getWordKey(word);
        mergedContextMap.set(key, word);
      }
    });

    // Add words from source notebooks if they don't already exist
    sourceNotebooks.forEach((notebook) => {
      notebook.context.forEach((word) => {
        if (word.jp_word) {
          const key = getWordKey(word);
          if (!mergedContextMap.has(key)) {
            mergedContextMap.set(key, word);
          }
        }
      });
    });

    const mergedContext = Array.from(mergedContextMap.values());

    // Update the primary notebook
    notebooks[primaryNotebookId].context = _ensureContextIds(mergedContext);

    // Delete the source notebooks
    sourceNotebookIds.forEach((id) => {
      delete notebooks[id];
    });

    _saveNotebooksToStorage(notebooks);
    return Object.values(notebooks); // Return the new list of all notebooks
  },

  importWordsIntoNotebook: (notebookId, wordsToImport) => {
    const notebooks = _getNotebooksFromStorage();
    const targetNotebook = notebooks[notebookId];

    if (!targetNotebook) {
      throw new Error("Target notebook not found.");
    }

    _validateContext(wordsToImport); // Validate the incoming words

    // --- De-duplication Logic ---
    // The following block prevents duplicate words from being added.
    // It uses a Map with a composite key of (`jp_word|kanji_jp_word`) to uniquely identify a word.
    // This ensures that words with the same hiragana but different kanji (e.g., 石 vs 医師) are treated as distinct entries.
    const contextMap = new Map();
    const getWordKey = (word) => `${word.jp_word}|${word.kanji_jp_word || ""}`;

    // Add existing words to the map
    targetNotebook.context.forEach((word) => {
      if (word.jp_word) {
        const key = getWordKey(word);
        contextMap.set(key, word);
      }
    });

    // Add new words from the import if they don't already exist
    wordsToImport.forEach((word) => {
      if (word.jp_word) {
        const key = getWordKey(word);
        if (!contextMap.has(key)) {
          contextMap.set(key, word);
        }
      }
    });

    const newContext = Array.from(contextMap.values());

    // Update the notebook with the new merged context
    notebooks[notebookId].context = _ensureContextIds(newContext);
    _saveNotebooksToStorage(notebooks);

    return notebooks[notebookId];
  },

  importNotebook: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target.result);
          if (!json.name || !json.context) {
            return reject(
              new Error(
                "Invalid JSON format. It must have 'name' and 'context' properties."
              )
            );
          }
          const newNotebook = notebookService.createNotebook(json.name);
          const updatedNotebook = notebookService.updateNotebook(
            newNotebook.id,
            { context: json.context, word_test: json.word_test || {} }
          );
          resolve(updatedNotebook);
        } catch (error) {
          reject(new Error(`Failed to import notebook: ${error.message}`));
        }
      };
      reader.onerror = (error) => {
        reject(new Error("Failed to read file."));
      };
      reader.readAsText(file);
    });
  },

  // Convenience helper dedicated to updating only the top-level word_test field
  updateNotebookWordTest: (id, wordTestData) => {
    const notebooks = _getNotebooksFromStorage();
    if (!notebooks[id]) {
      throw new Error("Notebook not found.");
    }
    const data = wordTestData === null ? {} : wordTestData;
    notebooks[id].word_test = { ...data };
    _saveNotebooksToStorage(notebooks);
    return notebooks[id].word_test;
  },
};

export default notebookService;
