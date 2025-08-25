import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useBlocker } from "react-router-dom"; // Import useBlocker
import { useApp } from "../../../../store/contexts/AppContext"; // Changed from QuizContext
import { useAnswerPlayback } from "../../../../hooks/useAnswerPlayback";
import QuestionCard from "../QuestionCard";
import SettingsPanel from "../../../../components/SettingsPanel";
import StatisticsPage from "../StatisticsPage"; // Import StatisticsPage
import Modal from "../../../../components/Modal"; // Import the new Modal component
import {
  AppContainer,
  Title,
  Progress,
  SettingsToggle,
  FloatingSettingsPanel,
  InfoToggle,
  Overlay,
} from "../../../../components/App/styles";
import styled from "styled-components";
import {
  nextQuestionGame, // Changed from NEXT_QUESTION
  restartQuiz,
  startQuiz,
} from "../../../../pages/quiz/reducer/actions"; // Import quiz actions

import { commitPendingProficiencyUpdates } from "../../../../store/reducer/actions"; // Import commitPendingProficiencyUpdates

const IconContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px; /* Keep it on the right side */
  z-index: 100;
`;

const IconGroup = styled.div`
  display: flex;
  gap: 10px; /* Adjust gap between icons */
  flex-direction: row-reverse; /* Reverse the order to put HomeIcon on the right */
`;

const HomeIcon = styled(SettingsToggle)`
  right: 5px;
`;

// The actual UI component that consumes the context
import {
  setPlaybackOptions,
  setPlaybackSpeed,
  setAutoProceed,
} from "../../../../pages/systemSettings/reducer"; // Import actions

const proficiencyMap = {
  1: "低",
  2: "中",
  3: "高",
};

const sortOrderMap = {
  random: "隨機",
  aiueo: "あいうえお",
  none: "預設",
};

function QuizContent() {
  const [showSettings, setShowSettings] = useState(false);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false); // State for modal visibility
  const [showInfoModal, setShowInfoModal] = useState(false); // New state for info modal

  const navigate = useNavigate();

  // Correct: Get state and dispatch from the context using useApp hook
  const { state, dispatch } = useApp(); // Changed from useQuiz
  const { questions, currentQuestionIndex, result, quizCompleted } = state.quiz; // Access quiz state
  const {
    playbackOptions,
    playbackSpeed,
    autoProceed,
    proficiencyFilter,
    startQuestionIndex,
    wordRangeCount,
    sortOrder,
  } = state.systemSettings;
  const { notebooks, currentNotebookId } = state.shared;
  const question = questions[currentQuestionIndex];
  const blocker = useBlocker(!quizCompleted);

  const currentNotebook = notebooks.find((n) => n.id === currentNotebookId);
  const notebookName = currentNotebook ? currentNotebook.name : "";

  const selectedProficiencies = Object.entries(proficiencyFilter)
    .filter(([, value]) => value)
    .map(([key]) => proficiencyMap[key])
    .join(", ");

  const handleConfirmExit = useCallback(() => {
    dispatch(commitPendingProficiencyUpdates()); // Commit changes before exiting
    dispatch(restartQuiz());
    blocker.proceed();
    setShowExitConfirmModal(false);
    window.location.reload();
  }, [blocker, dispatch]);

  const handleCancelExit = useCallback(() => {
    blocker.reset();
    setShowExitConfirmModal(false);
  }, [blocker]);

  useEffect(() => {
    if (blocker.state === "blocked") {
      setShowExitConfirmModal(true); // Show modal instead of alert
    }
  }, [blocker]);

  const { playSequence, cancelPlayback } = useAnswerPlayback({
    result,
    question,
    onNext: () => dispatch(nextQuestionGame()), // Changed dispatch type
    playbackOptions, // Now from global state
    rate: playbackSpeed, // Use playbackSpeed from global state
    autoProceed, // Pass autoProceed from global state
  });

  const speakManually = useCallback(
    (text, lang) => {
      const options = {};
      if (lang === "ja") {
        options.jp = true;
        playSequence(null, { jp_word: text }, options, { skipSound: true });
      } else if (lang === "zh") {
        options.ch = true;
        playSequence(null, { ch_word: text }, options, { skipSound: true });
      }
    },
    [playSequence]
  );

  return (
    <AppContainer>
      <IconContainer>
        <IconGroup>
          <SettingsToggle onClick={() => setShowSettings((s) => !s)}>
            ⚙️
          </SettingsToggle>
          <HomeIcon onClick={() => navigate("/")}>↩️</HomeIcon>
          <InfoToggle onClick={() => setShowInfoModal(true)}>ℹ️</InfoToggle>
        </IconGroup>
      </IconContainer>
      {showSettings && (
        <>
          <Overlay onClick={() => setShowSettings(false)} />
          <FloatingSettingsPanel>
            <SettingsPanel
              playbackSpeed={playbackSpeed}
              setPlaybackSpeed={(newSpeed) =>
                dispatch(setPlaybackSpeed(newSpeed))
              }
              playbackOptions={playbackOptions}
              setPlaybackOptions={(newOptions) =>
                dispatch(setPlaybackOptions(newOptions))
              }
              autoProceed={autoProceed} // Pass autoProceed from global state
              setAutoProceed={(newAutoProceed) =>
                dispatch(setAutoProceed(newAutoProceed))
              } // Pass setAutoProceed from global state
              isQuizContext={true} // New prop
            />
          </FloatingSettingsPanel>
        </>
      )}

      <Title>單字練習</Title>
      <Progress>
        第 {currentQuestionIndex + 1} 題 / 共 {questions.length} 題
      </Progress>

      <QuestionCard
        speakManually={speakManually}
        cancelPlayback={cancelPlayback}
        question={question}
      />

      <Modal
        message="測驗尚未完成，確定要離開嗎？"
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
        isVisible={showExitConfirmModal}
      />

      <Modal
        message={
          <div style={{ textAlign: "left" }}>
            <p>筆記本名稱: {notebookName}</p>
            <p>熟練度: {selectedProficiencies}</p>
            <p>排序: {sortOrderMap[sortOrder]}</p>
            <p>單字起始索引: {startQuestionIndex}</p>
            <p>單字範圍: {wordRangeCount}</p>
          </div>
        }
        onConfirm={() => setShowInfoModal(false)}
        disableCancel
        isVisible={showInfoModal}
      />
    </AppContainer>
  );
}

// The component that provides the context
export default function Quiz() {
  const { state, dispatch } = useApp(); // Get state from global context
  const { quizCompleted, answeredQuestions, correctAnswersCount } = state.quiz; // Access quiz-specific state
  const { notebooks, currentNotebookId } = state.shared;
  const {
    proficiencyFilter,
    startQuestionIndex,
    wordRangeCount,
    sortOrder,
    playbackOptions,
    playbackSpeed,
    wordType,
  } = state.systemSettings; // Destructure new settings
  const [emptyAlert, setEmptyAlert] = useState(false);
  const navigate = useNavigate();

  const { playSequence } = useAnswerPlayback({
    onNext: () => dispatch(nextQuestionGame()),
    playbackOptions,
    rate: playbackSpeed,
  });

  const speakManually = useCallback(
    (text, lang) => {
      const options = {};
      if (lang === "ja") {
        options.jp = true;
        playSequence(null, { jp_word: text }, options, { skipSound: true });
      } else if (lang === "zh") {
        options.ch = true;
        playSequence(null, { ch_word: text }, options, { skipSound: true });
      }
    },
    [playSequence]
  );

  useEffect(() => {
    if (!quizCompleted) {
      const currentNotebook = notebooks.find((n) => n.id === currentNotebookId);
      if (currentNotebook) {
        let questions = currentNotebook.context.filter((q) => {
          if (!q.jp_word) return false; // Ensure jp_word exists
          return proficiencyFilter[q.proficiency];
        });

        // Apply startQuestionIndex and wordRangeCount filters
        const startIndex = Math.max(0, startQuestionIndex - 1); // Convert to 0-based index
        const endIndex = Math.min(
          questions.length,
          startIndex + wordRangeCount
        );
        questions = questions.slice(startIndex, endIndex);
        if (questions.length > 0) {
          dispatch(startQuiz(questions, sortOrder));
        } else {
          // Handle case where notebook is empty or no questions match filter
          setEmptyAlert(true);
        }
      }
    }
  }, [
    currentNotebookId,
    dispatch,
    quizCompleted,
    proficiencyFilter,
    notebooks,
    startQuestionIndex,
    wordRangeCount,
    sortOrder,
  ]);

  if (quizCompleted) {
    // Use quizCompleted from global state
    return (
      <StatisticsPage
        answeredQuestions={answeredQuestions}
        correctAnswersCount={correctAnswersCount}
        speakManually={speakManually}
        wordType={wordType}
      />
    );
  }

  // show loading state if questions are not ready
  if (state.quiz.questions.length === 0) {
    return (
      <>
        <Modal
          message="請調整單字範圍或筆記本!"
          onConfirm={() => {
            navigate("/settings");
          }}
          disableCancel
          isVisible={emptyAlert}
        />
        <div>Loading questions...</div>;
      </>
    );
  }
  return <QuizContent />;
}
