import { SET_RATE, SET_PLAYBACK_OPTIONS, SET_PROFICIENCY_FILTER } from "./actions";

export const initialState = {
  rate: 1.0,
  playbackOptions: {
    jp: true,
    ch: true,
    jpEx: false,
    chEx: false,
    autoNext: true,
  },
  proficiencyFilter: {
    1: true,
    2: true,
    3: true,
  },
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_RATE:
      return {
        ...state,
        rate: action.payload,
      };
    case SET_PLAYBACK_OPTIONS:
      return {
        ...state,
        playbackOptions: action.payload,
      };
    case SET_PROFICIENCY_FILTER:
      return {
        ...state,
        proficiencyFilter: action.payload,
      };
    default:
      return state;
  }
}

export default reducer;