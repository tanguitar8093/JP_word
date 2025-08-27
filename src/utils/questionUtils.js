// Shared utilities for question preparation (sorting and option shuffling)

// Fisher–Yates shuffle
export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function shuffleOptionsForQuestions(questions) {
  return questions.map((q) => ({ ...q, options: shuffleArray(q.options) }));
}

export function sortQuestions(questions, sortOrder) {
  let sortedQuestions = [...questions];

  if (sortOrder === "random") {
    // Shuffle the questions array
    for (let i = sortedQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [sortedQuestions[i], sortedQuestions[j]] = [
        sortedQuestions[j],
        sortedQuestions[i],
      ];
    }
  } else if (sortOrder === "aiueo") {
    sortedQuestions.sort((a, b) => a.jp_word.localeCompare(b.jp_word, "ja"));
  } else if (sortOrder === "none") {
    // Do nothing
  }

  // After sorting questions, shuffle options for each question
  return shuffleOptionsForQuestions(sortedQuestions);
}
