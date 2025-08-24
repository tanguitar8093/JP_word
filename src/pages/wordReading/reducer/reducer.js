import { START_SESSION, ANSWER_CARD, NEXT_CARD, UPDATE_CARD, UPDATE_SESSION_QUEUE } from './actions'; // Import UPDATE_SESSION_QUEUE
import { calculateNextState } from '../../../services/ankiService';

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
  console.log("--- Reducer Debugging ---");
  console.log("Action:", action.type, action.payload);
  console.log("State before:", state);
  switch (action.type) {
    case START_SESSION: { // Added curly braces
      const { cards, sortOrder } = action.payload; // Destructure payload
      const sortedCards = sortCards(cards, sortOrder); // Apply sorting
      return {
        ...state,
        cards: sortedCards, // Use sorted cards
        queue: sortedCards, // Use sorted cards
        currentCard: sortedCards[0] || null,
        sessionState: 'active',
      };
    } // Added curly braces
    case ANSWER_CARD: { // Added curly braces
      const { cardId, rating, systemSettings } = action.payload;
      const cardToUpdate = state.cards.find(card => card.id === cardId);

      if (!cardToUpdate) {
        console.warn(`Card with ID ${cardId} not found for update.`);
        return state;
      }

      const updatedCard = calculateNextState(cardToUpdate, rating, systemSettings);

      const updatedCards = state.cards.map(card =>
        card.id === updatedCard.id ? updatedCard : card
      );

      // Filter out the answered card from the queue if its new due date is far in the future
      // This assumes the queue is for the current session and cards due much later should not reappear.
      const now = Date.now();
      const futureThreshold = 5 * 60 * 1000; // 5 minutes in milliseconds

      let newQueue = state.queue.filter(card => card.id !== cardId); // Remove the answered card

      // If the updated card is still due soon (e.g., marked 'again' or 'hard' in learning phase), re-add it to the queue
      if (updatedCard.due <= now + futureThreshold) {
        // Re-insert into the queue.
        newQueue.push(updatedCard);
        // Re-sort the queue to ensure cards due sooner are at the front
        newQueue.sort((a, b) => a.due - b.due);
      }

      console.log("Card to update:", cardToUpdate);
      console.log("Updated card from calculateNextState:", updatedCard);
      console.log("Cards array after update:", updatedCards);
      console.log("Queue after update:", newQueue);
      return {
        ...state,
        cards: updatedCards, // Update the main cards array
        queue: newQueue, // Update the session queue
        currentCard: state.currentCard && state.currentCard.id === updatedCard.id ? updatedCard : state.currentCard,
      };
    } // Added curly braces
    case NEXT_CARD: { // Added curly braces
      const newQueue = state.queue.slice(1);
      return {
        ...state,
        queue: newQueue,
        currentCard: newQueue[0] || null,
        sessionState: newQueue.length === 0 ? 'finished' : state.sessionState,
      };
    } // Added curly braces
    case UPDATE_CARD: { // Added curly braces
      const updatedCard = action.payload;
      const updatedCards = state.cards.map(card =>
        card.id === updatedCard.id ? updatedCard : card
      );
      // Also update the queue if the current card is the one being updated
      const updatedQueue = state.queue.map(card =>
        card.id === updatedCard.id ? updatedCard : card
      );
      return {
        ...state,
        cards: updatedCards,
        queue: updatedQueue,
        currentCard: state.currentCard && state.currentCard.id === updatedCard.id ? updatedCard : state.currentCard,
      };
    } // Added curly braces
    case UPDATE_SESSION_QUEUE: { // Added curly braces
      const newSessionQueue = action.payload;
      return {
        ...state,
        queue: newSessionQueue,
        currentCard: newSessionQueue[0] || null, // Set current card from the new queue
        sessionState: newSessionQueue.length === 0 ? 'finished' : state.sessionState,
      };
    } // Added curly braces
    default:
      return state;
  }
}

export default reducer;
