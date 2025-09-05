export const SET_JP_WORD_TYPE = "systemSettings/SET_WORD_TYPE";
export const SET_PLAYBACK_OPTIONS = "systemSettings/SET_PLAYBACK_OPTIONS";
export const SET_PROFICIENCY_FILTER = "systemSettings/SET_PROFICIENCY_FILTER";
export const SET_PLAYBACK_SPEED = "systemSettings/SET_PLAYBACK_SPEED";
export const SET_PLAYBACK_CONTENT = "systemSettings/SET_PLAYBACK_CONTENT";
export const SET_AUTO_PROCEED = "systemSettings/SET_AUTO_PROCEED";
export const SET_GAME_SOUND_EFFECTS = "systemSettings/SET_GAME_SOUND_EFFECTS";

export const SET_START_QUESTION_INDEX =
  "systemSettings/SET_START_QUESTION_INDEX"; // New action type
export const SET_WORD_RANGE_COUNT = "systemSettings/SET_WORD_RANGE_COUNT"; // New action type
export const SET_SORT_ORDER = "systemSettings/SET_SORT_ORDER";

// Anki Algorithm Settings Actions
export const SET_LEARNING_STEPS = "systemSettings/SET_LEARNING_STEPS";
export const SET_GRADUATING_INTERVAL = "systemSettings/SET_GRADUATING_INTERVAL";
export const SET_LAPSE_INTERVAL = "systemSettings/SET_LAPSE_INTERVAL";

// Reading Page Settings Actions
export const SET_READING_STUDY_MODE = "systemSettings/SET_READING_STUDY_MODE";
export const SET_READING_RECORD_WORD = "systemSettings/SET_READING_RECORD_WORD";
export const SET_READING_RECORD_SENTENCE =
  "systemSettings/SET_READING_RECORD_SENTENCE";
export const SET_READING_PLAY_BEEP = "systemSettings/SET_READING_PLAY_BEEP";
export const SET_READING_WORD_RECORD_TIME =
  "systemSettings/SET_READING_WORD_RECORD_TIME";
export const SET_READING_SENTENCE_RECORD_TIME =
  "systemSettings/SET_READING_SENTENCE_RECORD_TIME";
export const SET_READING_PLAYBACK_REPEAT_COUNT =
  "systemSettings/SET_READING_PLAYBACK_REPEAT_COUNT";

// Fill-in difficulty settings
export const SET_FILLIN_DIFFICULTY = "systemSettings/SET_FILLIN_DIFFICULTY"; // 'easy' | 'normal' | 'hard' | 'adaptive'
export const UPDATE_FILLIN_ADAPTIVE_STATS =
  "systemSettings/UPDATE_FILLIN_ADAPTIVE_STATS"; // { correct: boolean }
export const RESET_FILLIN_ADAPTIVE_STATS =
  "systemSettings/RESET_FILLIN_ADAPTIVE_STATS";

// Options source strategy actions
export const SET_OPTIONS_STRATEGY = "systemSettings/SET_OPTIONS_STRATEGY";
export const SET_MIXED_STRATEGY_LOCAL_RATIO =
  "systemSettings/SET_MIXED_STRATEGY_LOCAL_RATIO";

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

export const setGameSoundEffects = (enabled) => ({
  type: SET_GAME_SOUND_EFFECTS,
  payload: enabled,
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

// Reading Page Settings Action Creators
export const setReadingStudyMode = (mode) => ({
  type: SET_READING_STUDY_MODE,
  payload: mode,
});

export const setReadingRecordWord = (value) => ({
  type: SET_READING_RECORD_WORD,
  payload: value,
});

export const setReadingRecordSentence = (value) => ({
  type: SET_READING_RECORD_SENTENCE,
  payload: value,
});

export const setReadingPlayBeep = (value) => ({
  type: SET_READING_PLAY_BEEP,
  payload: value,
});

export const setReadingWordRecordTime = (time) => ({
  type: SET_READING_WORD_RECORD_TIME,
  payload: time,
});

export const setReadingSentenceRecordTime = (time) => ({
  type: SET_READING_SENTENCE_RECORD_TIME,
  payload: time,
});

export const setReadingPlaybackRepeatCount = (count) => ({
  type: SET_READING_PLAYBACK_REPEAT_COUNT,
  payload: count,
});

// Fill-in difficulty actions
export const setFillInDifficulty = (mode) => ({
  type: SET_FILLIN_DIFFICULTY,
  payload: mode,
});

export const updateFillInAdaptiveStats = (correct) => ({
  type: UPDATE_FILLIN_ADAPTIVE_STATS,
  payload: { correct },
});

export const resetFillInAdaptiveStats = () => ({
  type: RESET_FILLIN_ADAPTIVE_STATS,
});

// Options source strategy action creators
export const setOptionsStrategy = (strategy) => ({
  type: SET_OPTIONS_STRATEGY,
  payload: strategy,
});

export const setMixedStrategyLocalRatio = (ratio) => ({
  type: SET_MIXED_STRATEGY_LOCAL_RATIO,
  payload: ratio,
});
