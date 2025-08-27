export const START_QUIZ = "quiz/START_QUIZ";
export const CHECK_ANSWER = "quiz/CHECK_ANSWER";
export const NEXT_QUESTION_GAME = "quiz/NEXT_QUESTION_GAME";
export const RESTART_QUIZ = "quiz/RESTART_QUIZ";
export const READING_START = "reading/START";
export const READING_CHECK = "reading/CHECK";
export const READING_NEXT = "reading/NEXT";
export const READING_RESTART = "reading/RESTART";

export const startQuiz = (questions, sortOrder) => ({
  type: READING_START,
  payload: { questions, sortOrder },
});

export const checkAnswer = (answer) => ({
  type: READING_CHECK,
  payload: answer,
});

export const nextQuestionGame = () => ({
  type: READING_NEXT,
});

export const restartQuiz = () => ({
  type: READING_RESTART,
});
