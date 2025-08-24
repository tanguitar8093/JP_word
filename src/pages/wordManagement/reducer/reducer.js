
import {
  SET_CURRENT_WORD,
  UPDATE_WORD_STATUS,
  SET_WORD_FILTER,
  UPDATE_WORD_PROFICIENCY,
} from './actions';

const ONE_MINUTE_MS = 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const INITIAL_EASE_FACTOR = 2.5;

const initialState = {
  currentWord: null,
  filter: {
    proficiency: 0,
    status: 'all',
  },
};

function calculateNextState(card, rating) {
  const updatedCard = { ...card };
  updatedCard.reps += 1;
  const now = Date.now();

  if (card.status === 'learning' || card.status === 'new') {
    switch (rating) {
      case 'again': {
        updatedCard.learningStep = 1;
        updatedCard.due = now + ONE_MINUTE_MS;
        updatedCard.status = 'learning';
        break;
      }
      case 'good': {
        if (updatedCard.learningStep < 2) {
          updatedCard.due = now + 10 * ONE_MINUTE_MS;
          updatedCard.learningStep += 1;
          updatedCard.status = 'learning';
        } else {
          updatedCard.status = 'review';
          updatedCard.interval = 1;
          updatedCard.due = now + ONE_DAY_MS;
        }
        break;
      }
      case 'easy': {
        updatedCard.status = 'review';
        updatedCard.interval = 4;
        updatedCard.due = now + 4 * ONE_DAY_MS;
        break;
      }
      default:
        break;
    }
  } else if (card.status === 'review') {
    switch (rating) {
      case 'again': {
        updatedCard.lapses += 1;
        updatedCard.easeFactor = Math.max(1.3, card.easeFactor - 0.2);
        updatedCard.status = 'learning';
        updatedCard.learningStep = 1;
        updatedCard.interval = 0;
        updatedCard.due = now + ONE_MINUTE_MS;
        break;
      }
      case 'good': {
        updatedCard.interval = Math.ceil(card.interval * card.easeFactor);
        updatedCard.due = now + updatedCard.interval * ONE_DAY_MS;
        break;
      }
      case 'easy': {
        updatedCard.easeFactor = card.easeFactor + 0.15;
        updatedCard.interval = Math.ceil(card.interval * updatedCard.easeFactor * 1.3);
        updatedCard.due = now + updatedCard.interval * ONE_DAY_MS;
        break;
      }
      default:
        break;
    }
  }

  return updatedCard;
}

function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_CURRENT_WORD:
      return {
        ...state,
        currentWord: action.payload,
      };

    case SET_WORD_FILTER:
      return {
        ...state,
        filter: {
          ...state.filter,
          ...action.payload,
        },
      };

    case UPDATE_WORD_STATUS:
      return {
        ...state,
        currentWord: action.payload.wordId === state.currentWord?.id
          ? { ...state.currentWord, ...action.payload.changes }
          : state.currentWord,
      };

    case UPDATE_WORD_PROFICIENCY:
      const { wordId, rating } = action.payload;
      if (!state.currentWord || state.currentWord.id !== wordId) {
        return state;
      }

      const updatedWord = calculateNextState(state.currentWord, rating);
      return {
        ...state,
        currentWord: updatedWord,
      };

    default:
      return state;
  }
}

export default reducer;
