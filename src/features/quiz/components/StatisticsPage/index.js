import React from "react";
import styled from "styled-components";

const StatisticsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  // background-color: #f0f0f0;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); /* 🔹 陰影 */
  width: 80%;
  max-width: 600px;
  margin: 20px auto;
`;

const ScoreDisplay = styled.h2`
  color: #333;
  margin-bottom: 20px;
`;

const QuestionList = styled.ul`
  list-style: none;
  padding: 0;
  width: 100%;
`;

const QuestionItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

const QuestionText = styled.span`
  font-size: 1.1em;
  color: #555;
`;

const StatusEmoji = styled.span`
  margin-right: 10px;
  font-size: 1.2em;
`;

const FavoriteMark = styled.span`
  margin-left: 10px;
  cursor: pointer;
`;

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
