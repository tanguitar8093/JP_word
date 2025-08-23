export const SET_PLAYBACK_OPTIONS = "systemSettings/SET_PLAYBACK_OPTIONS";
export const SET_PROFICIENCY_FILTER = "systemSettings/SET_PROFICIENCY_FILTER";
export const SET_PLAYBACK_SPEED = "systemSettings/SET_PLAYBACK_SPEED";
export const SET_PLAYBACK_CONTENT = "systemSettings/SET_PLAYBACK_CONTENT";
export const SET_AUTO_PROCEED = "systemSettings/SET_AUTO_PROCEED";
export const SET_QUIZ_SCOPE = "systemSettings/SET_QUIZ_SCOPE";

export const setPlaybackOptions = (options) => ({
  type: SET_PLAYBACK_OPTIONS,
  payload: options,
});

export const setProficiencyFilter = (filter) => ({
  type: SET_PROFICIENCY_FILTER,
  payload: filter,
});

export const setPlaybackSpeed = (speed) => ({
  type: SET_PLAYBACK_SPEED,
  payload: speed,
});

export const setPlaybackContent = (content) => ({
  type: SET_PLAYBACK_CONTENT,
  payload: content,
});

export const setAutoProceed = (autoProceed) => ({
  type: SET_AUTO_PROCEED,
  payload: autoProceed,
});

export const setQuizScope = (scope) => ({
  type: SET_QUIZ_SCOPE,
  payload: scope,
});
