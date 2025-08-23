
import { SET_CURRENT_NOTEBOOK, GET_NOTEBOOKS, UPDATE_WORD_IN_NOTEBOOK } from './actions';

const initialState = {
  notebooks: [],
  currentNotebookId: null,
}; // Placeholder initial state

function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_NOTEBOOKS:
        return {
            ...state,
            notebooks: action.payload,
        };
    case SET_CURRENT_NOTEBOOK:
      return {
        ...state,
        currentNotebookId: action.payload,
      };
    case UPDATE_WORD_IN_NOTEBOOK:
      const { notebookId, wordId, updates } = action.payload;
      const newNotebooks = state.notebooks.map(notebook => {
        if (notebook.id === notebookId) {
          const newContext = notebook.context.map(word => {
            if (word.id === wordId) {
              return { ...word, ...updates };
            }
            return word;
          });
          return { ...notebook, context: newContext };
        }
        return notebook;
      });
      return { ...state, notebooks: newNotebooks };
    default:
      return state;
  }
}

export default reducer;
