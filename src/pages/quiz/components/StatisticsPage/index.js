import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../../store/contexts/AppContext"; // Import useApp
import { commitPendingProficiencyUpdates } from "../../../../store/reducer/actions"; // Import commitPendingProficiencyUpdates
import { updateWordInNotebook } from "../../../../store/reducer/actions"; // Import updateWordInNotebook
import notebookService from "../../../../services/notebookService"; // Import notebookService
import { restartQuiz } from "../../../../pages/quiz/reducer/actions"; // Import restartQuiz from quiz actions
import {
  StatisticsContainer,
  ScoreDisplay,
  QuestionList,
  QuestionItem,
  QuestionText,
  StatusEmoji,
  EndQuizButton,
  ProficiencyButton,
  ProficiencyControlContainer,
  HeaderContainer, // Import HeaderContainer
  HeaderItem,     // Import HeaderItem
} from "./styles"; // Import styled components from styles.js

const StatisticsPage = ({ answeredQuestions, correctAnswersCount }) => {
  const navigate = useNavigate();
  const { state, dispatch } = useApp(); // Get dispatch from useApp
  const { currentNotebookId, pendingProficiencyUpdates } = state.shared; // Get pendingProficiencyUpdates

  // Initialize localAnsweredQuestions by applying pendingProficiencyUpdates
  const initialAnsweredQuestions = answeredQuestions.map(item => {
    const pendingProficiency = pendingProficiencyUpdates[item.question.id];
    if (pendingProficiency !== undefined) {
      return { ...item, question: { ...item.question, proficiency: pendingProficiency } };
    }
    return item;
  });
  const [localAnsweredQuestions, setLocalAnsweredQuestions] = useState(initialAnsweredQuestions);

  const totalQuestions = localAnsweredQuestions.length;
  const score =
    totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;

  // Commit pending updates when StatisticsPage mounts
  useEffect(() => {
    dispatch(commitPendingProficiencyUpdates());
  }, [dispatch]); // Only run once on mount

  const handleEndQuiz = async () => {
    dispatch(restartQuiz()); // Dispatch restartQuiz before navigating
    navigate("/");
    window.location.reload();
  };

  const handleProficiencyChange = (wordId, proficiency) => {
    try {
      notebookService.updateWordInNotebook(currentNotebookId, wordId, { proficiency });
      dispatch(updateWordInNotebook(currentNotebookId, wordId, { proficiency }));
      // Update local state to reflect the change immediately in UI
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
      <HeaderContainer>
        <HeaderItem>結果</HeaderItem>
        <HeaderItem>單字</HeaderItem>
        <HeaderItem>熟練度</HeaderItem>
      </HeaderContainer>
      <QuestionList>
        {localAnsweredQuestions.map((item, index) => {
          // Determine the current proficiency to highlight the button
          // This still uses pendingProficiencyUpdates for initial display from quiz phase
          const currentProficiency = pendingProficiencyUpdates[item.question.id] || item.question.proficiency;
          return (
            <QuestionItem key={index}>
              <StatusEmoji>{item.isCorrect ? "⭕" : "❌"}</StatusEmoji>
              <QuestionText>
                {item.question.kanji_jp_word
                  ? item.question.kanji_jp_word
                  : item.question.jp_word}
              </QuestionText>
              <ProficiencyControlContainer>
                <ProficiencyButton
                  className={currentProficiency === 1 ? 'active' : ''}
                  onClick={() => handleProficiencyChange(item.question.id, 1)}>低</ProficiencyButton>
                <ProficiencyButton
                  className={currentProficiency === 2 ? 'active' : ''}
                  onClick={() => handleProficiencyChange(item.question.id, 2)}>中</ProficiencyButton>
                <ProficiencyButton
                  className={currentProficiency === 3 ? 'active' : ''}
                  onClick={() => handleProficiencyChange(item.question.id, 3)}>高</ProficiencyButton>
              </ProficiencyControlContainer>
            </QuestionItem>
          );
        })}
      </QuestionList>
      <EndQuizButton onClick={handleEndQuiz}>結束測驗</EndQuizButton>
    </StatisticsContainer>
  );
};

export default StatisticsPage;
