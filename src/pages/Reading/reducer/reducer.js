const initialState = {
  questions: [], // Initialize with an empty array
  currentQuestionIndex: 0,
  selectedAnswer: "",
  result: null, // null | '⭕' | '❌' (from useQuizGame)
  correctAnswersCount: 0, // (from useQuizGame)
  answeredQuestions: [], // Stores { question, isCorrect } (from useQuizGame)
  quizCompleted: false, // (from useQuizGame)
};

import { sortQuestions } from '../../../utils/questionUtils';

function reducer(state = initialState, action) {
  switch (action.type) {
  case "reading/START":
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
  case "reading/CHECK": {
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
  case "reading/NEXT": {
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
  case "reading/RESTART": // Restart reading session
      // Reset all quiz-specific state to initial, but keep the loaded questions
      return { ...initialState, questions: state.questions };
    default:
      return state;
  }
}

export default reducer;
