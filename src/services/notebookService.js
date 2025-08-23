
import { v4 as uuidv4 } from 'uuid';

const NOTEBOOK_STORAGE_KEY = 'notebooks';
const CURRENT_NOTEBOOK_ID_KEY = 'currentNotebookId';

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
    console.error("Error saving to localStorage", error);
  }
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
            'jp_word', 'kanji_jp_word', 'ch_word', 
            'jp_ex_statement', 'ch_ex_statement', 'type', 'options'
        ];
        for (const key of requiredKeys) {
            if (!(key in word)) {
                throw new Error(`Invalid word object: missing key \"${key}\".`);
            }
        }
        if (!Array.isArray(word.options)) {
            throw new Error('Invalid word object: "options" must be an array.');
        }
    }
    return true;
};


// Private method to ensure all words in a context have an ID
const _ensureContextIds = (context) => {
  if (!Array.isArray(context)) return [];
  return context.map(word => {
    // also check for empty object
    if (!word.id && Object.keys(word).length > 0) {
      return { ...word, id: uuidv4() };
    }
    return word;
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
          context: [{
            id: uuidv4(),
            jp_word: "こんにちは",
            kanji_jp_word: "今日は",
            ch_word: "你好",
            jp_ex_statement: "こんにちは、良い一日を！",
            ch_ex_statement: "你好，祝你有美好的一天！",
            type: "greeting",
            options: ["a", "b", "c"],
          }]
        }
      };
      _saveNotebooksToStorage(initialNotebook);
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
      throw new Error("Notebook name cannot be empty and must be 20 characters or less.");
    }
    const notebooks = _getNotebooksFromStorage();
    const id = uuidv4();
    notebooks[id] = {
      id,
      name,
      context: [{}],
    };
    _saveNotebooksToStorage(notebooks);
    return notebooks[id];
  },

  updateNotebook: (id, { name, context }) => {
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
      word => !wordIds.includes(word.id)
    );

    _saveNotebooksToStorage(notebooks);
    return notebooks[notebookId];
  },

  updateWordInNotebook: (notebookId, wordId, updates) => {
    const notebooks = _getNotebooksFromStorage();
    if (!notebooks[notebookId]) {
      throw new Error("Notebook not found.");
    }

    const wordIndex = notebooks[notebookId].context.findIndex(word => word.id === wordId);
    if (wordIndex === -1) {
      throw new Error("Word not found in the notebook.");
    }

    notebooks[notebookId].context[wordIndex] = {
      ...notebooks[notebookId].context[wordIndex],
      ...updates,
    };

    _saveNotebooksToStorage(notebooks);
    return notebooks[notebookId].context[wordIndex];
  },
  
  importNotebook: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target.result);
          if (!json.name || !json.context) {
            return reject(new Error("Invalid JSON format. It must have 'name' and 'context' properties."));
          }
          const newNotebook = notebookService.createNotebook(json.name);
          const updatedNotebook = notebookService.updateNotebook(newNotebook.id, { context: json.context });
          resolve(updatedNotebook);
        } catch (error) {
          reject(new Error(`Failed to import notebook: ${error.message}`))
        }
      };
      reader.onerror = (error) => {
        reject(new Error("Failed to read file."));
      };
      reader.readAsText(file);
    });
  }
};

export default notebookService;
