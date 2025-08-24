const LEARNING_STEPS = [1 * 60 * 1000, 10 * 60 * 1000]; // 1 minute, 10 minutes in milliseconds
const GRADUATING_INTERVAL = 1; // 1 day
const LAPSE_INTERVAL = 1 * 60 * 1000; // 1 minute in milliseconds

export const calculateNextState = (card, rating) => {
  let newCard = { ...card };
  const now = Date.now();

  newCard.reps += 1; // Increment review count

  if (rating === 'again') {
    newCard.lapses += 1;
    newCard.easeFactor = Math.max(1.3, newCard.easeFactor - 0.2);
    newCard.status = 'learning';
    newCard.learningStep = 0; // Reset to first learning step
    newCard.interval = LAPSE_INTERVAL;
    newCard.due = now + LAPSE_INTERVAL;
  } else if (newCard.status === 'learning') {
    if (rating === 'hard') {
      // Stay at current learning step, or move back if it's the first
      newCard.learningStep = Math.max(0, newCard.learningStep - 1);
      newCard.interval = LEARNING_STEPS[newCard.learningStep];
      newCard.due = now + newCard.interval;
    } else if (rating === 'good') {
      newCard.learningStep += 1;
      if (newCard.learningStep >= LEARNING_STEPS.length) {
        // Graduate
        newCard.status = 'review';
        newCard.interval = GRADUATING_INTERVAL * 24 * 60 * 60 * 1000; // Convert days to ms
        newCard.due = now + newCard.interval;
        newCard.learningStep = 0; // Reset learning step
      } else {
        newCard.interval = LEARNING_STEPS[newCard.learningStep];
        newCard.due = now + newCard.interval;
      }
    } else if (rating === 'easy') {
      // Graduate early
      newCard.status = 'review';
      newCard.easeFactor = newCard.easeFactor + 0.15;
      newCard.interval = GRADUATING_INTERVAL * 24 * 60 * 60 * 1000 * 1.3; // Graduate interval * 1.3
      newCard.due = now + newCard.interval;
      newCard.learningStep = 0; // Reset learning step
    }
  } else if (newCard.status === 'review') {
    // Review card logic
    if (rating === 'hard') {
      newCard.easeFactor = Math.max(1.3, newCard.easeFactor - 0.15);
      newCard.interval = newCard.interval * 1.2;
    } else if (rating === 'good') {
      // easeFactor remains the same
      newCard.interval = newCard.interval * newCard.easeFactor;
    } else if (rating === 'easy') {
      newCard.easeFactor = newCard.easeFactor + 0.15;
      newCard.interval = newCard.interval * newCard.easeFactor * 1.3;
    }
    newCard.due = now + newCard.interval;
  } else if (newCard.status === 'new') {
    // New card logic (first time seeing it)
    // Treat 'new' cards as if they are in the 'learning' phase from step 0
    newCard.status = 'learning';
    newCard.learningStep = 0;
    if (rating === 'good') {
      newCard.learningStep += 1;
      if (newCard.learningStep >= LEARNING_STEPS.length) {
        newCard.status = 'review';
        newCard.interval = GRADUATING_INTERVAL * 24 * 60 * 60 * 1000;
        newCard.due = now + newCard.interval;
        newCard.learningStep = 0;
      } else {
        newCard.interval = LEARNING_STEPS[newCard.learningStep];
        newCard.due = now + newCard.interval;
      }
    } else if (rating === 'easy') {
      newCard.status = 'review';
      newCard.easeFactor = newCard.easeFactor + 0.15;
      newCard.interval = GRADUATING_INTERVAL * 24 * 60 * 60 * 1000 * 1.3;
      newCard.due = now + newCard.interval;
      newCard.learningStep = 0;
    } else if (rating === 'hard') {
      // For new cards, 'hard' means stay at first learning step
      newCard.interval = LEARNING_STEPS[0];
      newCard.due = now + newCard.interval;
    }
  }

  newCard.lastReview = now; // Update last review time

  return newCard;
};