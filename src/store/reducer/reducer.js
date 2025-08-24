
import { SET_CURRENT_NOTEBOOK, GET_NOTEBOOKS, UPDATE_WORD_IN_NOTEBOOK, UPDATE_PENDING_PROFICIENCY, CLEAR_PENDING_PROFICIENCY_UPDATES } from './actions';

const initialState = {
  notebooks: [],
  currentNotebookId: null,
  pendingProficiencyUpdates: {}, // Initialize here as well for clarity, though AppContext sets it
}; // Placeholder initial state

function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_NOTEBOOKS:
        console.log("Reducer: GET_NOTEBOOKS - Payload:", action.payload);
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
      console.log("Reducer: UPDATE_WORD_IN_NOTEBOOK - Payload:", action.payload);
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
      console.log("Reducer: UPDATE_WORD_IN_NOTEBOOK - New Notebooks:", newNotebooks);
      return { ...state, notebooks: newNotebooks };
    case UPDATE_PENDING_PROFICIENCY:
      const { wordId: pendingWordId, proficiency: pendingProficiency } = action.payload;
      return {
        ...state,
        pendingProficiencyUpdates: {
          ...state.pendingProficiencyUpdates,
          [pendingWordId]: pendingProficiency,
        },
      };
    case CLEAR_PENDING_PROFICIENCY_UPDATES:
      return {
        ...state,
        pendingProficiencyUpdates: {}, // Clear the pending updates
      };
    default:
      return state;
  }
}

export default reducer;
