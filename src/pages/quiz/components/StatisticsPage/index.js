import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../../store/contexts/AppContext"; // Import useApp
import { restartQuiz } from "../../../../pages/quiz/reducer/actions"; // Import restartQuiz
import {
  StatisticsContainer,
  ScoreDisplay,
  QuestionList,
  QuestionItem,
  QuestionText,
  StatusEmoji,
  FavoriteMark,
  EndQuizButton,
} from "./styles"; // Import styled components from styles.js

const StatisticsPage = ({ answeredQuestions, correctAnswersCount }) => {
  const navigate = useNavigate();
  const { dispatch } = useApp(); // Get dispatch from useApp
  const totalQuestions = answeredQuestions.length;
  const score =
    totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;

  const handleEndQuiz = () => {
    dispatch(restartQuiz()); // Dispatch restartQuiz before navigating
    navigate("/");
  };

  return (
    <StatisticsContainer>
      <ScoreDisplay>分數: {score.toFixed(0)} / 100</ScoreDisplay>
      <QuestionList>
        {answeredQuestions.map((item, index) => (
          <QuestionItem key={index}>
            <StatusEmoji>{item.isCorrect ? "⭕" : "❌"}</StatusEmoji>
            <QuestionText>
              {item.question.kanji_jp_word
                ? item.question.kanji_jp_word
                : item.question.jp_word}
            </QuestionText>
            <FavoriteMark>📑</FavoriteMark>
          </QuestionItem>
        ))}
      </QuestionList>
      <EndQuizButton onClick={handleEndQuiz}>結束測驗</EndQuizButton>
    </StatisticsContainer>
  );
};

export default StatisticsPage;
