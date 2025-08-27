const initialState = {
  questions: [], // Initialize with an empty array
  currentQuestionIndex: 0,
  selectedAnswer: "",
  result: null, // null | '⭕' | '❌' (from useQuizGame)
  correctAnswersCount: 0, // (from useQuizGame)
  answeredQuestions: [], // Stores { question, isCorrect } (from useQuizGame)
  quizCompleted: false, // (from useQuizGame)
};

const createRandomQuestions = (questions) => {
  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  return questions.map((q) => ({ ...q, options: shuffleArray(q.options) }));
};

const sortQuestions = (questions, sortOrder) => {
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
  return createRandomQuestions(sortedQuestions);
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case "quiz/START_QUIZ":
      const { questions, sortOrder } = action.payload;
      return {
        ...state,
        questions: sortQuestions(questions, sortOrder),
        currentQuestionIndex: 0,
        selectedAnswer: "",
        result: null,
        correctAnswersCount: 0,
        answeredQuestions: [],
        quizCompleted: false,
      };
    case "quiz/CHECK_ANSWER": {
      const currentQuestion = state.questions[state.currentQuestionIndex];
      const isCorrect = action.payload === currentQuestion.ch_word; // Check against ch_word from useQuizGame
      const newAnsweredQuestions = [
        ...state.answeredQuestions,
        { question: currentQuestion, isCorrect },
      ];
      return {
        ...state,
        selectedAnswer: action.payload,
        result: isCorrect ? "⭕" : "❌",
        correctAnswersCount: isCorrect
          ? state.correctAnswersCount + 1
          : state.correctAnswersCount,
        answeredQuestions: newAnsweredQuestions,
      };
    }
    case "quiz/NEXT_QUESTION_GAME": {
      // This action advances the question in the game flow
      const nextQuestionIndex = state.currentQuestionIndex + 1;
      const quizCompleted = nextQuestionIndex >= state.questions.length;
      return {
        ...state,
        currentQuestionIndex: quizCompleted
          ? state.currentQuestionIndex
          : nextQuestionIndex,
        selectedAnswer: "",
        result: null,
        quizCompleted: quizCompleted,
      };
    }
    case "quiz/RESTART_QUIZ": // This action restarts the quiz from the beginning
      // Reset all quiz-specific state to initial, but keep the loaded questions
      return { ...initialState, questions: state.questions };
    default:
      return state;
  }
}

export default reducer;
