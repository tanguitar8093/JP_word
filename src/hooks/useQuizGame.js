import { useReducer } from "react";
import { questions } from "../data/questions";

const initialState = {
  questions,
  currentQuestionIndex: 0,
  selectedAnswer: "",
  result: null, // null | '✅' | '❌'
};

function quizReducer(state, action) {
  switch (action.type) {
    case "CHECK_ANSWER": {
      const currentQuestion = state.questions[state.currentQuestionIndex];
      const isCorrect = action.payload === currentQuestion.ch_word;
      return {
        ...state,
        selectedAnswer: action.payload,
        result: isCorrect ? "✅" : "❌",
      };
    }
    case "NEXT_QUESTION": {
      return {
        ...state,
        currentQuestionIndex: (state.currentQuestionIndex + 1) % state.questions.length,
        selectedAnswer: "",
        result: null,
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
