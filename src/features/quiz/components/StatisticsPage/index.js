import React from "react";
import { useNavigate } from "react-router-dom";
import {
  StatisticsContainer,
  ScoreDisplay,
  QuestionList,
  QuestionItem,
  QuestionText,
  StatusEmoji,
  FavoriteMark,
} from "./styles"; // Import styled components from styles.js
import { SettingsToggle } from "../../../../components/App/styles";
import styled from "styled-components";

const HomeIcon = styled(SettingsToggle)`
  position: absolute;
  top: 10px;
  right: 10px;
`;

const StatisticsPage = ({ answeredQuestions, correctAnswersCount }) => {
  const navigate = useNavigate();
  const totalQuestions = answeredQuestions.length;
  const score =
    totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;

  return (
    <StatisticsContainer>
      <HomeIcon onClick={() => navigate("/")}>↩️</HomeIcon>
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
