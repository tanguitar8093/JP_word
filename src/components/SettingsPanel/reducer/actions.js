export const SET_JP_WORD_TYPE = "systemSettings/SET_WORD_TYPE";
export const SET_PLAYBACK_OPTIONS = "systemSettings/SET_PLAYBACK_OPTIONS";
export const SET_PROFICIENCY_FILTER = "systemSettings/SET_PROFICIENCY_FILTER";
export const SET_PLAYBACK_SPEED = "systemSettings/SET_PLAYBACK_SPEED";
export const SET_PLAYBACK_CONTENT = "systemSettings/SET_PLAYBACK_CONTENT";
export const SET_AUTO_PROCEED = "systemSettings/SET_AUTO_PROCEED";

export const SET_START_QUESTION_INDEX =
  "systemSettings/SET_START_QUESTION_INDEX"; // New action type
export const SET_WORD_RANGE_COUNT = "systemSettings/SET_WORD_RANGE_COUNT"; // New action type
export const SET_SORT_ORDER = "systemSettings/SET_SORT_ORDER";

// Anki Algorithm Settings Actions
export const SET_LEARNING_STEPS = "systemSettings/SET_LEARNING_STEPS";
export const SET_GRADUATING_INTERVAL = "systemSettings/SET_GRADUATING_INTERVAL";
export const SET_LAPSE_INTERVAL = "systemSettings/SET_LAPSE_INTERVAL";

export const setWordType = (wordType) => ({
  type: SET_JP_WORD_TYPE,
  payload: wordType,
});

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

export const setStartQuestionIndex = (index) => ({
  type: SET_START_QUESTION_INDEX,
  payload: index,
});

export const setWordRangeCount = (count) => ({
  type: SET_WORD_RANGE_COUNT,
  payload: count,
});

export const setSortOrder = (order) => ({
  type: SET_SORT_ORDER,
  payload: order,
});

// Anki Algorithm Settings Action Creators
export const setLearningSteps = (steps) => ({
  type: SET_LEARNING_STEPS,
  payload: steps,
});

export const setGraduatingInterval = (interval) => ({
  type: SET_GRADUATING_INTERVAL,
  payload: interval,
});

export const setLapseInterval = (interval) => ({
  type: SET_LAPSE_INTERVAL,
  payload: interval,
});
