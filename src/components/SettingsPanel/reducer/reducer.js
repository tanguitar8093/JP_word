import {
  SET_PLAYBACK_OPTIONS,
  SET_PROFICIENCY_FILTER,
  SET_PLAYBACK_SPEED,
  SET_PLAYBACK_CONTENT,
  SET_AUTO_PROCEED,
  SET_GAME_SOUND_EFFECTS,
  SET_START_QUESTION_INDEX,
  SET_WORD_RANGE_COUNT,
  SET_SORT_ORDER,
  SET_LEARNING_STEPS,
  SET_GRADUATING_INTERVAL,
  SET_LAPSE_INTERVAL,
  SET_JP_WORD_TYPE,
  SET_READING_STUDY_MODE,
  SET_READING_RECORD_WORD,
  SET_READING_RECORD_SENTENCE,
  SET_READING_PLAY_BEEP,
  SET_READING_WORD_RECORD_TIME,
  SET_READING_SENTENCE_RECORD_TIME,
  SET_READING_PLAYBACK_REPEAT_COUNT,
  SET_FILLIN_DIFFICULTY,
  UPDATE_FILLIN_ADAPTIVE_STATS,
  RESET_FILLIN_ADAPTIVE_STATS,
} from "./actions";

export const initialState = {
  wordType: "jp_context", // jp_word, kanji_jp_word, jp_context
  playbackOptions: {
    jp: true,
    ch: false,
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
  autoProceed: false,
  gameSoundEffects: true,
  startQuestionIndex: 1, //(data index 0)
  wordRangeCount: 9999,
  sortOrder: "none",

  // Anki Algorithm Settings
  learningSteps: [1 * 60 * 1000, 10 * 60 * 1000], // 1 minute, 10 minutes in milliseconds
  graduatingInterval: 1, // 1 day
  lapseInterval: 1 * 60 * 1000, // 1 minute in milliseconds

  // Reading page specific settings
  readingStudyMode: "auto", // 'manual' or 'auto'
  readingRecordWord: true,
  readingRecordSentence: true,
  readingPlayBeep: true,
  readingWordRecordTime: 2, // in seconds
  readingSentenceRecordTime: 3.5, // in seconds
  readingPlaybackRepeatCount: 1,

  // Fill-in spelling difficulty settings
  fillInDifficulty: "normal", // 'easy' | 'normal' | 'hard' | 'adaptive'
  fillInAdaptive: {
    windowSize: 12, // last N questions
    history: [], // boolean array
  },
};

function reducer(state = initialState, action) {
  // The state passed to the reducer is already the fully merged state from AppContext
  const currentWorkingState = state; // Use the state directly

  switch (action.type) {
    case SET_JP_WORD_TYPE:
      return {
        ...state,
        wordType: action.payload,
      };
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
    case SET_GAME_SOUND_EFFECTS:
      return {
        ...state,
        gameSoundEffects: action.payload,
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

    // Reading page specific settings
    case SET_READING_STUDY_MODE:
      return { ...state, readingStudyMode: action.payload };
    case SET_READING_RECORD_WORD:
      return { ...state, readingRecordWord: action.payload };
    case SET_READING_RECORD_SENTENCE:
      return { ...state, readingRecordSentence: action.payload };
    case SET_READING_PLAY_BEEP:
      return { ...state, readingPlayBeep: action.payload };
    case SET_READING_WORD_RECORD_TIME:
      return { ...state, readingWordRecordTime: action.payload };
    case SET_READING_SENTENCE_RECORD_TIME:
      return { ...state, readingSentenceRecordTime: action.payload };

    case SET_READING_PLAYBACK_REPEAT_COUNT:
      return { ...state, readingPlaybackRepeatCount: action.payload };

    // Fill-in spelling difficulty settings
    case SET_FILLIN_DIFFICULTY:
      return { ...state, fillInDifficulty: action.payload };
    case UPDATE_FILLIN_ADAPTIVE_STATS: {
      const { correct } = action.payload;
      const history = [...(state.fillInAdaptive?.history || [])];
      history.push(!!correct);
      const windowSize = state.fillInAdaptive?.windowSize || 12;
      while (history.length > windowSize) history.shift();
      return { ...state, fillInAdaptive: { ...state.fillInAdaptive, history } };
    }
    case RESET_FILLIN_ADAPTIVE_STATS:
      return {
        ...state,
        fillInAdaptive: { ...state.fillInAdaptive, history: [] },
      };

    default:
      return state;
  }
}

export default reducer;
