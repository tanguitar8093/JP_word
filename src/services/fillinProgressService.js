const STORAGE_KEY = "JPW_FillinProgress";

const safeParse = (str) => {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
};

const fillinProgressService = {
  hasProgress: () => {
    try {
      return !!localStorage.getItem(STORAGE_KEY);
    } catch {
      return false;
    }
  },
  loadProgress: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? safeParse(raw) : null;
    } catch {
      return null;
    }
  },
  saveProgress: ({
    notebookId,
    questionIds,
    currentIndex,
    results,
    sortOrder,
    schemaVersion = 1,
  }) => {
    try {
      const data = {
        notebookId,
        questionIds,
        currentIndex,
        results,
        sortOrder,
        savedAt: Date.now(),
        schemaVersion,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      // noop
    }
  },
  clearProgress: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // noop
    }
  },
};

export default fillinProgressService;
