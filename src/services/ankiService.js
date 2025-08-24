export const calculateNextState = (card, rating, ankiSettings) => {
  const { learningSteps, graduatingInterval, lapseInterval } = ankiSettings;
  let newCard = { ...card };
  const now = Date.now();

  newCard.reps += 1; // Increment review count

  if (rating === 'again') {
    newCard.lapses += 1;
    newCard.easeFactor = Math.max(1.3, newCard.easeFactor - 0.2);
    newCard.status = 'learning';
    newCard.learningStep = 0; // Reset to first learning step
    newCard.interval = lapseInterval;
    newCard.due = now + lapseInterval;
  } else if (newCard.status === 'learning') {
    if (rating === 'hard') {
      // Stay at current learning step, or move back if it's the first
      newCard.learningStep = Math.max(0, newCard.learningStep - 1);
      newCard.interval = learningSteps[newCard.learningStep];
      newCard.due = now + newCard.interval;
    } else if (rating === 'good') {
      newCard.learningStep += 1;
      if (newCard.learningStep >= learningSteps.length) {
        // Graduate
        newCard.status = 'review';
        newCard.interval = graduatingInterval * 24 * 60 * 60 * 1000; // Convert days to ms
        newCard.due = now + newCard.interval;
        newCard.learningStep = 0; // Reset learning step
      } else {
        newCard.interval = learningSteps[newCard.learningStep];
        newCard.due = now + newCard.interval;
      }
    } else if (rating === 'easy') {
      // Graduate early
      newCard.status = 'review';
      newCard.easeFactor = newCard.easeFactor + 0.15;
      newCard.interval = graduatingInterval * 24 * 60 * 60 * 1000 * 1.3; // Graduate interval * 1.3
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
    newCard.status = 'learning'; // Transition to learning phase
    newCard.learningStep = 0; // Start at first learning step

    if (rating === 'again') {
      newCard.lapses += 1; // A lapse on a new card
      newCard.easeFactor = Math.max(1.3, newCard.easeFactor - 0.2); // Decrease ease
      newCard.interval = learningSteps[0]; // Due very soon
      newCard.due = now + newCard.interval;
    } else if (rating === 'hard') {
      newCard.interval = learningSteps[0]; // Stay at first learning step
      newCard.due = now + newCard.interval;
    } else if (rating === 'good') {
      newCard.learningStep += 1;
      if (newCard.learningStep >= learningSteps.length) {
        // Graduate
        newCard.status = 'review';
        newCard.interval = graduatingInterval * 24 * 60 * 60 * 1000;
        newCard.due = now + newCard.interval;
        newCard.learningStep = 0;
      } else {
        newCard.interval = learningSteps[newCard.learningStep];
        newCard.due = now + newCard.interval;
      }
    } else if (rating === 'easy') {
      // Graduate early
      newCard.status = 'review';
      newCard.easeFactor = newCard.easeFactor + 0.15;
      newCard.interval = graduatingInterval * 24 * 60 * 60 * 1000 * 1.3;
      newCard.due = now + newCard.interval;
      newCard.learningStep = 0;
    }
  }

  newCard.lastReview = now; // Update last review time

  return newCard;
};