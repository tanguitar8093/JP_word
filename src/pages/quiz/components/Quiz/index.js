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
} from "../../../../components/App/styles";
import styled from "styled-components";
import {
  nextQuestionGame, // Changed from NEXT_QUESTION
  restartQuiz,
  startQuiz
} from "../../../../pages/quiz/reducer/actions"; // Import quiz actions

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
function QuizContent() {
  const [rate, setRate] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackOptions, setPlaybackOptions] = useState({
    jp: true,
    ch: true,
    jpEx: false,
    chEx: false,
    autoNext: true,
  });
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false); // State for modal visibility

  const navigate = useNavigate(); // Initialize useNavigate

  // Correct: Get state and dispatch from the context using useApp hook
  const { state, dispatch } = useApp(); // Changed from useQuiz
  const { questions, currentQuestionIndex, result, quizCompleted } = state.quiz; // Access quiz state
  const question = questions[currentQuestionIndex];

  const blocker = useBlocker(!quizCompleted);

  const handleConfirmExit = useCallback(() => {
    dispatch(restartQuiz());
    blocker.proceed();
    setShowExitConfirmModal(false);
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
    playbackOptions,
    rate,
    currentQuestionIndex,
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
        </IconGroup>
      </IconContainer>
      {showSettings && (
        <FloatingSettingsPanel>
          <SettingsPanel
            rate={rate}
            setRate={setRate}
            playbackOptions={playbackOptions}
            setPlaybackOptions={setPlaybackOptions}
          />
        </FloatingSettingsPanel>
      )}

      <Title>日文單字測驗</Title>
      <Progress>
        第 {currentQuestionIndex + 1} 題 / 共 {questions.length} 題
      </Progress>

      {/* Pass speakManually down as it's not part of the quiz context */}
      <QuestionCard speakManually={speakManually} cancelPlayback={cancelPlayback} />

      <Modal
        message="測驗尚未完成，確定要離開嗎？"
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
        isVisible={showExitConfirmModal}
      />
    </AppContainer>
  );
}

// The component that provides the context
export default function Quiz() {
  const { state, dispatch } = useApp(); // Get state from global context
  const { quizCompleted, answeredQuestions, correctAnswersCount } = state.quiz; // Access quiz-specific state
  const { notebooks, currentNotebookId } = state.shared;

  useEffect(() => {
    const currentNotebook = notebooks.find(n => n.id === currentNotebookId);
    if (currentNotebook) {
      const questions = currentNotebook.context.filter(q => q.jp_word);
      if (questions.length > 0) {
        dispatch(startQuiz(questions));
      } else {
        // Handle case where notebook is empty
        alert("This notebook is empty!");
      }
    }
  }, [notebooks, currentNotebookId, dispatch]);

  if (quizCompleted) {
    // Use quizCompleted from global state
    return (
      <StatisticsPage
        answeredQuestions={answeredQuestions} // Pass from global state
        correctAnswersCount={correctAnswersCount} // Pass from global state
      />
    );
  }

  // show loading state if questions are not ready
  if (state.quiz.questions.length === 0) {
    return <div>Loading questions...</div>;
  }

  return (
    <QuizContent /> // No longer wrapping with QuizContext.Provider
  );
}
