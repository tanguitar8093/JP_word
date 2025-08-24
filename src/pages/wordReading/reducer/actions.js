export const START_SESSION = 'wordReading/START_SESSION';
export const ANSWER_CARD = 'wordReading/ANSWER_CARD';
export const NEXT_CARD = 'wordReading/NEXT_CARD';
export const UPDATE_CARD = 'wordReading/UPDATE_CARD';
export const UPDATE_SESSION_QUEUE = 'wordReading/UPDATE_SESSION_QUEUE'; // New action type

export const startSession = (cards, sortOrder) => ({
  type: START_SESSION,
  payload: { cards, sortOrder },
});

export const answerCard = (cardId, rating, systemSettings) => ({
  type: ANSWER_CARD,
  payload: { cardId, rating, systemSettings },
});

export const nextCard = () => ({
  type: NEXT_CARD,
});

export const updateCard = (card) => ({
  type: UPDATE_CARD,
  payload: card,
});

export const updateSessionQueue = (newQueue) => ({
  type: UPDATE_SESSION_QUEUE,
  payload: newQueue,
});