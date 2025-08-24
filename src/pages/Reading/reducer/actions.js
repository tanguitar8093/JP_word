export const START_QUIZ = 'quiz/START_QUIZ';
export const CHECK_ANSWER = 'quiz/CHECK_ANSWER';
export const NEXT_QUESTION_GAME = 'quiz/NEXT_QUESTION_GAME';
export const FINISH_QUIZ = 'quiz/FINISH_QUIZ';
export const RESTART_QUIZ = 'quiz/RESTART_QUIZ';
export const TICK = 'quiz/TICK';

export const startQuiz = (questions, sortOrder) => ({
  type: START_QUIZ,
  payload: { questions, sortOrder },
});

export const checkAnswer = (answer) => ({
  type: CHECK_ANSWER,
  payload: answer,
});

export const nextQuestionGame = () => ({
  type: NEXT_QUESTION_GAME,
});

export const finishQuiz = () => ({
  type: FINISH_QUIZ,
});

export const restartQuiz = () => ({
  type: RESTART_QUIZ,
});

export const tick = () => ({
  type: TICK,
});