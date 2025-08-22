export const SET_RATE = "systemSettings/SET_RATE";
export const SET_PLAYBACK_OPTIONS = "systemSettings/SET_PLAYBACK_OPTIONS";

export const setRate = (rate) => ({
  type: SET_RATE,
  payload: rate,
});

export const setPlaybackOptions = (options) => ({
  type: SET_PLAYBACK_OPTIONS,
  payload: options,
});