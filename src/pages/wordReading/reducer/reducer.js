import { START_SESSION, ANSWER_CARD, NEXT_CARD } from './actions';

export const initialState = {
  cards: [],
  queue: [],
  currentCard: null,
  sessionState: 'ready', // ready, active, finished
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case START_SESSION:
      const cards = action.payload;
      return {
        ...state,
        cards: cards,
        queue: cards,
        currentCard: cards[0] || null,
        sessionState: 'active',
      };
    case ANSWER_CARD:
      // For now, just log the answer.
      // Later, I'll update card proficiency and schedule it.
      console.log(`Card ${action.payload.cardId} answered with ${action.payload.rating}`);
      return state;
    case NEXT_CARD:
      const newQueue = state.queue.slice(1);
      return {
        ...state,
        queue: newQueue,
        currentCard: newQueue[0] || null,
        sessionState: newQueue.length === 0 ? 'finished' : state.sessionState,
      };
    default:
      return state;
  }
}

export default reducer;
