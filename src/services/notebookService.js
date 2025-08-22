
import { v4 as uuidv4 } from 'uuid';

const NOTEBOOK_STORAGE_KEY = 'notebooks';

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

// Private method to ensure all words in a context have an ID
const _ensureContextIds = (context) => {
  if (!Array.isArray(context)) return [];
  return context.map(word => {
    if (!word.id) {
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
            "id": uuidv4(),
            "jp": "こんにちは",
            "pronunciation": "konnichiwa",
            "en": "Hello",
            "zh": "你好",
            "sentence": "こんにちは、良い一日を！",
            "sentenceEn": "Hello, have a nice day!",
            "sentenceZh": "你好，祝你有美好的一天！"
          }]
        }
      };
      _saveNotebooksToStorage(initialNotebook);
    }
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
          reject(new Error("Failed to parse JSON file."));
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
