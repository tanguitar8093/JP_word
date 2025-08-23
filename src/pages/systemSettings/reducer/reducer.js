import {
  SET_PLAYBACK_OPTIONS,
  SET_PROFICIENCY_FILTER,
  SET_PLAYBACK_SPEED,
  SET_PLAYBACK_CONTENT,
  SET_AUTO_PROCEED,
  SET_QUIZ_SCOPE,
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
  quizScope: "all",
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_PLAYBACK_OPTIONS:
      console.log('SET_PLAYBACK_OPTIONS payload:', action.payload);
      return {
        ...state,
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
    case SET_QUIZ_SCOPE:
      return {
        ...state,
        quizScope: action.payload,
      };
    default:
      return state;
  }
}

export default reducer;
