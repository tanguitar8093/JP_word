import {
  SET_PLAYBACK_OPTIONS,
  SET_PROFICIENCY_FILTER,
  SET_PLAYBACK_SPEED,
  SET_PLAYBACK_CONTENT,
  SET_AUTO_PROCEED,
  SET_START_QUESTION_INDEX, // New import
  SET_WORD_RANGE_COUNT,     // New import
  SET_SORT_ORDER,
} from "./actions";

export const initialState = {
  playbackOptions: {
    jp: true,
    ch: true,
    jpEx: false,
    chEx: false,
  },
  proficiencyFilter: {
    1: true,
    2: true,
    3: true,
  },
  playbackSpeed: 1.0,
  playbackContent: "jp",
  autoProceed: true,
  startQuestionIndex: 1, // New state variable, default to 1 (data index 0)
  wordRangeCount: 9999,   // New state variable, default to 9999
  sortOrder: 'none',
};

function reducer(state = initialState, action) {

  // The state passed to the reducer is already the fully merged state from AppContext
  const currentWorkingState = state; // Use the state directly

  switch (action.type) {
    case SET_PLAYBACK_OPTIONS:
      return {
        ...currentWorkingState,
        playbackOptions: action.payload,
      };
    case SET_PROFICIENCY_FILTER:
      return {
        ...state,
        proficiencyFilter: action.payload,
      };
    case SET_PLAYBACK_SPEED:
      return {
        ...state,
        playbackSpeed: action.payload,
      };
    case SET_PLAYBACK_CONTENT:
      return {
        ...state,
        playbackContent: action.payload,
      };
    case SET_AUTO_PROCEED:
      return {
        ...state,
        autoProceed: action.payload,
      };
    case SET_START_QUESTION_INDEX:
      return {
        ...state,
        startQuestionIndex: action.payload,
      };
    case SET_WORD_RANGE_COUNT:
      return {
        ...state,
        wordRangeCount: action.payload,
      };
    case SET_SORT_ORDER:
      return {
        ...state,
        sortOrder: action.payload,
      };
    default:
      return state;
  }
}

export default reducer;
