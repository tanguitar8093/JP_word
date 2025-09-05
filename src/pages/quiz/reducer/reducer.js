import { sortQuestions, shuffleOptionsForQuestions } from "../../../utils/questionUtils";

const initialState = {
  questions: [], // Initialize with an empty array
  currentQuestionIndex: 0,
  selectedAnswer: "",
  result: null, // null | '⭕' | '❌' (from useQuizGame)
  correctAnswersCount: 0, // (from useQuizGame)
  answeredQuestions: [], // Stores { question, isCorrect } (from useQuizGame)
  quizCompleted: false, // (from useQuizGame)
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case "quiz/LOAD_PROGRESS": {
      const { questions: restoredQuestions, currentIndex, results } = action.payload;
      // Shuffle options to avoid fixed correct answer position after refresh
      const shuffledQuestions = shuffleOptionsForQuestions(restoredQuestions);
      const answered = results.map((isCorrect, i) => ({
        question: shuffledQuestions[i],
        isCorrect,
      }));
      return {
        ...state,
        questions: shuffledQuestions,
        currentQuestionIndex: currentIndex,
        selectedAnswer: "",
        result: null,
        correctAnswersCount: results.filter(Boolean).length,
        answeredQuestions: answered,
        quizCompleted: currentIndex >= shuffledQuestions.length,
      };
    }
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
      // const isCorrect = action.payload === currentQuestion.ch_word;
      const isCorrect = currentQuestion.ch_word.includes(action.payload);
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
    case "quiz/RECORD_FILLIN_RESULT": {
      const { isCorrect } = action.payload;
      const currentQuestion = state.questions[state.currentQuestionIndex];
      const newAnsweredQuestions = [
        ...state.answeredQuestions,
        { question: currentQuestion, isCorrect },
      ];
      return {
        ...state,
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
