
export const SET_CURRENT_NOTEBOOK = 'shared/SET_CURRENT_NOTEBOOK';
export const GET_NOTEBOOKS = 'shared/GET_NOTEBOOKS';

export const setCurrentNotebook = (notebookId) => ({
  type: SET_CURRENT_NOTEBOOK,
  payload: notebookId,
});

export const getNotebooks = (notebooks) => ({
    type: GET_NOTEBOOKS,
    payload: notebooks,
});
