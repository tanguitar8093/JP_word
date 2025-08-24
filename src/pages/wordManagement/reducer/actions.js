
// Placeholder action type
// Action Types
export const SET_CURRENT_WORD = "wordManagement/SET_CURRENT_WORD";
export const UPDATE_WORD_STATUS = "wordManagement/UPDATE_WORD_STATUS";
export const SET_WORD_FILTER = "wordManagement/SET_WORD_FILTER";
export const UPDATE_WORD_PROFICIENCY = "wordManagement/UPDATE_WORD_PROFICIENCY";

// Action Creators
export const setCurrentWord = (word) => ({
  type: SET_CURRENT_WORD,
  payload: word,
});

export const updateWordStatus = (wordId, changes) => ({
  type: UPDATE_WORD_STATUS,
  payload: { wordId, changes },
});

export const setWordFilter = (filter) => ({
  type: SET_WORD_FILTER,
  payload: filter,
});

export const updateWordProficiency = (wordId, rating) => ({
  type: UPDATE_WORD_PROFICIENCY,
  payload: { wordId, rating },
});
