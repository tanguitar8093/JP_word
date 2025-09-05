export const START_QUIZ = "quiz/START_QUIZ";
export const CHECK_ANSWER = "quiz/CHECK_ANSWER";
export const NEXT_QUESTION_GAME = "quiz/NEXT_QUESTION_GAME";
export const RESTART_QUIZ = "quiz/RESTART_QUIZ";
export const RECORD_FILLIN_RESULT = "quiz/RECORD_FILLIN_RESULT";

export const startQuiz = (questions, sortOrder, optionsContext = {}) => ({
  type: START_QUIZ,
  payload: { questions, sortOrder, optionsContext },
});

export const checkAnswer = (answer) => ({
  type: CHECK_ANSWER,
  payload: answer,
});

export const nextQuestionGame = () => ({
  type: NEXT_QUESTION_GAME,
});

export const restartQuiz = () => ({
  type: RESTART_QUIZ,
});

export const recordFillInResult = (isCorrect) => ({
  type: RECORD_FILLIN_RESULT,
  payload: { isCorrect },
});
