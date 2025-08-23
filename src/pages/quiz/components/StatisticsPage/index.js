import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../../store/contexts/AppContext"; // Import useApp
import { restartQuiz } from "../../../../pages/quiz/reducer/actions"; // Import restartQuiz
import notebookService from "../../../../services/notebookService";
import {
  StatisticsContainer,
  ScoreDisplay,
  QuestionList,
  QuestionItem,
  QuestionText,
  StatusEmoji,
  EndQuizButton,
  ProficiencyButton,
  ProficiencyControlContainer
} from "./styles"; // Import styled components from styles.js

const StatisticsPage = ({ answeredQuestions, correctAnswersCount }) => {
  const navigate = useNavigate();
  const { state, dispatch } = useApp(); // Get dispatch from useApp
  const { currentNotebookId } = state.shared;
  const [localAnsweredQuestions, setLocalAnsweredQuestions] = useState(answeredQuestions);

  const totalQuestions = localAnsweredQuestions.length;
  const score =
    totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;

  const handleEndQuiz = () => {
    dispatch(restartQuiz()); // Dispatch restartQuiz before navigating
    navigate("/");
  };

  const handleProficiencyChange = (wordId, proficiency) => {
    try {
      notebookService.updateWordInNotebook(currentNotebookId, wordId, { proficiency });
      const updatedQuestions = localAnsweredQuestions.map(item => {
        if (item.question.id === wordId) {
          return { ...item, question: { ...item.question, proficiency } };
        }
        return item;
      });
      setLocalAnsweredQuestions(updatedQuestions);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <StatisticsContainer>
      <ScoreDisplay>分數: {score.toFixed(0)} / 100</ScoreDisplay>
      <QuestionList>
        {localAnsweredQuestions.map((item, index) => (
          <QuestionItem key={index}>
            <StatusEmoji>{item.isCorrect ? "⭕" : "❌"}</StatusEmoji>
            <QuestionText>
              {item.question.kanji_jp_word
                ? item.question.kanji_jp_word
                : item.question.jp_word}
            </QuestionText>
            <ProficiencyControlContainer>
              <ProficiencyButton 
                className={item.question.proficiency === 1 ? 'active' : ''}
                onClick={() => handleProficiencyChange(item.question.id, 1)}>低</ProficiencyButton>
              <ProficiencyButton 
                className={item.question.proficiency === 2 ? 'active' : ''}
                onClick={() => handleProficiencyChange(item.question.id, 2)}>中</ProficiencyButton>
              <ProficiencyButton 
                className={item.question.proficiency === 3 ? 'active' : ''}
                onClick={() => handleProficiencyChange(item.question.id, 3)}>高</ProficiencyButton>
            </ProficiencyControlContainer>
          </QuestionItem>
        ))}
      </QuestionList>
      <EndQuizButton onClick={handleEndQuiz}>結束測驗</EndQuizButton>
    </StatisticsContainer>
  );
};

export default StatisticsPage;
