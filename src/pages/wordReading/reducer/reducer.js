import { START_SESSION, ANSWER_CARD, NEXT_CARD } from './actions';

export const initialState = {
  cards: [],
  queue: [],
  currentCard: null,
  sessionState: 'ready', // ready, active, finished
};

const sortCards = (cards, sortOrder) => {
  let sortedCards = [...cards];

  if (sortOrder === 'random') {
    for (let i = sortedCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [sortedCards[i], sortedCards[j]] = [sortedCards[j], sortedCards[i]];
    }
  } else if (sortOrder === 'aiueo') {
    sortedCards.sort((a, b) => a.jp_word.localeCompare(b.jp_word, 'ja'));
  } else if (sortOrder === 'none') {
    // Do nothing
  }
  return sortedCards;
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case START_SESSION:
      const { cards, sortOrder } = action.payload; // Destructure payload
      const sortedCards = sortCards(cards, sortOrder); // Apply sorting
      return {
        ...state,
        cards: sortedCards, // Use sorted cards
        queue: sortedCards, // Use sorted cards
        currentCard: sortedCards[0] || null,
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
