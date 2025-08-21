import { useState, useCallback } from "react";
import { questions } from "../data/questions";

export const useQuizGame = () => {
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState(null);
  const [answer, setAnswer] = useState("");

  const q = questions[current];

  const checkAnswer = useCallback(
    (selectedAnswer) => {
      setAnswer(selectedAnswer);
      setResult(selectedAnswer === q.ch_word ? "✅" : "❌");
    },
    [q]
  );

  const next = useCallback(() => {
    setResult(null);
    setCurrent((prev) => (prev + 1) % questions.length);
    setAnswer("");
  }, []);

  return {
    current,
    question: q,
    result,
    selectedAnswer: answer,
    totalQuestions: questions.length,
    checkAnswer,
    next,
  };
};
