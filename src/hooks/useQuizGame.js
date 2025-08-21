import { useReducer } from "react";
import { questions } from "../data/questions";

const initialState = {
  questions,
  currentQuestionIndex: 0,
  selectedAnswer: "",
  result: null, // null | '⭕' | '❌'
  correctAnswersCount: 0,
  answeredQuestions: [], // Stores { question, isCorrect } for each answered question
  quizCompleted: false,
};

function quizReducer(state, action) {
  switch (action.type) {
    case "CHECK_ANSWER": {
      const currentQuestion = state.questions[state.currentQuestionIndex];
      const isCorrect = action.payload === currentQuestion.ch_word;
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
    case "NEXT_QUESTION": {
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
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

export const useQuizGame = () => {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  return { state, dispatch };
};
