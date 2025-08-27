import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../../store/contexts/AppContext"; // Import useApp
import { commitPendingProficiencyUpdates } from "../../../../store/reducer/actions"; // Import commitPendingProficiencyUpdates
import { updateWordInNotebook } from "../../../../store/reducer/actions"; // Import updateWordInNotebook
import notebookService from "../../../../services/notebookService"; // Import notebookService
import { restartQuiz } from "../../../quiz/reducer/actions"; // Import restartQuiz from quiz actions
import {
  StatisticsContainer,
  ScoreDisplay,
  QuestionList,
  QuestionItem,
  QuestionText,
  EndQuizButton,
  ProficiencyButton,
  ProficiencyControlContainer,
  HeaderContainer,
  HeaderItem,
  SpeakButton,
} from "./styles";

const StatisticsPage = ({ answeredQuestions, correctAnswersCount, speakManually, wordType }) => {
  const navigate = useNavigate();
  const { state, dispatch } = useApp(); // Get dispatch from useApp
  const { currentNotebookId, pendingProficiencyUpdates } = state.shared; // Get pendingProficiencyUpdates

  // Prepare base items; fallback if answeredQuestions is empty
  const baseItems = (answeredQuestions && answeredQuestions.length > 0)
    ? answeredQuestions
    : (state.quiz?.questions || []).map((q) => ({ question: q }));

  // Initialize localAnsweredQuestions by applying pendingProficiencyUpdates
  const initialAnsweredQuestions = baseItems.map((item) => {
    const pendingProficiency = pendingProficiencyUpdates[item.question.id];
    if (pendingProficiency !== undefined) {
      return {
        ...item,
        question: { ...item.question, proficiency: pendingProficiency },
      };
    }
    return item;
  });
  const [localAnsweredQuestions, setLocalAnsweredQuestions] = useState(
    initialAnsweredQuestions
  );

  const totalQuestions = localAnsweredQuestions.length;

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
      notebookService.updateWordInNotebook(currentNotebookId, wordId, {
        proficiency,
      });
      dispatch(
        updateWordInNotebook(currentNotebookId, wordId, { proficiency })
      );
      // Update local state to reflect the change immediately in UI
      const updatedQuestions = localAnsweredQuestions.map((item) => {
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
  <ScoreDisplay>朗讀單字數量: {totalQuestions}</ScoreDisplay>
      <HeaderContainer>
        <HeaderItem>單字</HeaderItem>
        <HeaderItem>熟練度</HeaderItem>
      </HeaderContainer>
      <QuestionList>
        {localAnsweredQuestions.map((item, index) => {
          // Determine the current proficiency to highlight the button
          // This still uses pendingProficiencyUpdates for initial display from quiz phase
          const currentProficiency =
            pendingProficiencyUpdates[item.question.id] ||
            item.question.proficiency;
          return (
            <QuestionItem key={index}>
              <SpeakButton
                onClick={() => speakManually(item.question.jp_word, "ja")}
              >
                <QuestionText>
                  {wordType == "kanji_jp_word" &&
                    item.question.kanji_jp_word &&
                    item.question.kanji_jp_word}
                  {wordType == "kanji_jp_word" &&
                    !item.question.kanji_jp_word &&
                    item.question.jp_word}
                  {wordType == "jp_word" && item.question.jp_word}
                  {wordType == "jp_context" && (
                    <span>
                      {item.question.jp_context.map((part, index) =>
                        part.kanji ? (
                          <ruby key={index}>
                            {part.kanji}
                            <rt>{part.hiragana}</rt>
                          </ruby>
                        ) : (
                          <span key={index}>{part.hiragana}</span>
                        )
                      )}
                    </span>
                  )}
                  🔊
                </QuestionText>
              </SpeakButton>
              <ProficiencyControlContainer>
                <ProficiencyButton
                  className={currentProficiency === 1 ? "active" : ""}
                  onClick={() => handleProficiencyChange(item.question.id, 1)}
                >
                  低
                </ProficiencyButton>
                <ProficiencyButton
                  className={currentProficiency === 2 ? "active" : ""}
                  onClick={() => handleProficiencyChange(item.question.id, 2)}
                >
                  中
                </ProficiencyButton>
                <ProficiencyButton
                  className={currentProficiency === 3 ? "active" : ""}
                  onClick={() => handleProficiencyChange(item.question.id, 3)}
                >
                  高
                </ProficiencyButton>
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
