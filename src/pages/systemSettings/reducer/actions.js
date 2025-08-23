export const SET_RATE = "systemSettings/SET_RATE";
export const SET_PLAYBACK_OPTIONS = "systemSettings/SET_PLAYBACK_OPTIONS";
export const SET_PROFICIENCY_FILTER = "systemSettings/SET_PROFICIENCY_FILTER";

export const setRate = (rate) => ({
  type: SET_RATE,
  payload: rate,
});

export const setPlaybackOptions = (options) => ({
  type: SET_PLAYBACK_OPTIONS,
  payload: options,
});

export const setProficiencyFilter = (filter) => ({
  type: SET_PROFICIENCY_FILTER,
  payload: filter,
});