const initialState = {
  questions: [], // Initialize with an empty array
  status: "ready",
  currentQuestionIndex: 0,
  selectedAnswer: "",
  points: 0, // Score for the quiz
  highscore: 0,
  secondsRemaining: null,
  result: null, // null | '⭕' | '❌' (from useQuizGame)
  correctAnswersCount: 0, // (from useQuizGame)
  answeredQuestions: [], // Stores { question, isCorrect } (from useQuizGame)
  quizCompleted: false, // (from useQuizGame)
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case "quiz/START_QUIZ":
      return {
        ...state,
        questions: action.payload, // Load questions from payload
        status: "active",
        secondsRemaining: action.payload.length * 30,
        // Reset game-specific state when starting a new quiz
        currentQuestionIndex: 0,
        selectedAnswer: "",
        points: 0,
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
      // Points logic from original QuizContext
      const newPoints =
        action.payload === currentQuestion.correctOption
          ? state.points + currentQuestion.points
          : state.points;

      return {
        ...state,
        selectedAnswer: action.payload,
        result: isCorrect ? "⭕" : "❌",
        correctAnswersCount: isCorrect
          ? state.correctAnswersCount + 1
          : state.correctAnswersCount,
        answeredQuestions: newAnsweredQuestions,
        points: newPoints,
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
        status: quizCompleted ? "finished" : state.status, // Update status if quiz completed
      };
    }
    case "quiz/FINISH_QUIZ": // This action explicitly finishes the quiz, e.g., from a button
      return {
        ...state,
        status: "finished",
        highscore: Math.max(state.points, state.highscore),
      };
    case "quiz/RESTART_QUIZ": // This action restarts the quiz from the beginning
      // Reset all quiz-specific state to initial, but keep the loaded questions
      return { ...initialState, questions: state.questions, status: "ready" };
    case "quiz/TICK":
      return {
        ...state,
        secondsRemaining: state.secondsRemaining - 1,
        status: state.secondsRemaining === 0 ? "finished" : state.status,
      };
    default:
      return state;
  }
}

export default reducer;
