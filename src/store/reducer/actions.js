
export const SET_CURRENT_NOTEBOOK = 'shared/SET_CURRENT_NOTEBOOK';
export const GET_NOTEBOOKS = 'shared/GET_NOTEBOOKS';
export const UPDATE_WORD_IN_NOTEBOOK = 'shared/UPDATE_WORD_IN_NOTEBOOK';

export const setCurrentNotebook = (notebookId) => ({
  type: SET_CURRENT_NOTEBOOK,
  payload: notebookId,
});

export const getNotebooks = (notebooks) => ({
    type: GET_NOTEBOOKS,
    payload: notebooks,
});

export const updateWordInNotebook = (notebookId, wordId, updates) => ({
  type: UPDATE_WORD_IN_NOTEBOOK,
  payload: { notebookId, wordId, updates },
});
