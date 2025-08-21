import React from "react";
import {
  StatisticsContainer,
  ScoreDisplay,
  QuestionList,
  QuestionItem,
  QuestionText,
  StatusEmoji,
  FavoriteMark,
} from "./styles"; // Import styled components from styles.js

const StatisticsPage = ({ answeredQuestions, correctAnswersCount }) => {
  const totalQuestions = answeredQuestions.length;
  const score =
    totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;

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
    </StatisticsContainer>
  );
};

export default StatisticsPage;
