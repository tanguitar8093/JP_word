import {
  SET_PLAYBACK_OPTIONS,
  SET_PROFICIENCY_FILTER,
  SET_PLAYBACK_SPEED,
  SET_PLAYBACK_CONTENT,
  SET_AUTO_PROCEED,
  SET_START_QUESTION_INDEX, // New import
  SET_WORD_RANGE_COUNT,     // New import
  SET_SORT_ORDER,
  // New Anki Algorithm Settings Actions
  SET_LEARNING_STEPS,
  SET_GRADUATING_INTERVAL,
  SET_LAPSE_INTERVAL,
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

  // Anki Algorithm Settings
  learningSteps: [1 * 60 * 1000, 10 * 60 * 1000], // 1 minute, 10 minutes in milliseconds
  graduatingInterval: 1, // 1 day
  lapseInterval: 1 * 60 * 1000, // 1 minute in milliseconds
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
    // Anki Algorithm Settings Actions
    case SET_LEARNING_STEPS:
      return { ...state, learningSteps: action.payload };
    case SET_GRADUATING_INTERVAL:
      return { ...state, graduatingInterval: action.payload };
    case SET_LAPSE_INTERVAL:
      return { ...state, lapseInterval: action.payload };
    default:
      return state;
  }
}

export default reducer;
