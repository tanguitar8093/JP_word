
import { SET_CURRENT_NOTEBOOK, GET_NOTEBOOKS } from './actions';

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
    default:
      return state;
  }
}

export default reducer;
