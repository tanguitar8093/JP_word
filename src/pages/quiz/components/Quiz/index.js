import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useBlocker } from "react-router-dom"; // Import useBlocker
import { useApp } from "../../../../store/contexts/AppContext"; // Changed from QuizContext
import { useAnswerPlayback } from "../../../../hooks/useAnswerPlayback";
import { ExampleSentence } from '../ExampleSentence';
import QuestionCard  from '../QuestionCard';
import AudioRecorderPage from '../../../AudioRecorder';
import SettingsPanel from "../../../../components/SettingsPanel";
import StatisticsPage from "../StatisticsPage"; // Import StatisticsPage
import Modal from "../../../../components/Modal"; // Import the new Modal component
import {
  AppContainer,
  Title,
  Progress,
  SettingsToggle,
  FloatingSettingsPanel,
  Overlay,
} from "../../../../components/App/styles";
import styled from "styled-components";
import {
  nextQuestionGame, // Changed from NEXT_QUESTION
  restartQuiz,
  startQuiz
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
import { setPlaybackOptions, setPlaybackSpeed, setAutoProceed, setQuizScope } from "../../../../pages/systemSettings/reducer"; // Import actions

function QuizContent() {
  const [showSettings, setShowSettings] = useState(false);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false); // State for modal visibility

  const navigate = useNavigate(); // Initialize useNavigate

  // Correct: Get state and dispatch from the context using useApp hook
  const { state, dispatch } = useApp(); // Changed from useQuiz
  const { questions, currentQuestionIndex, result, quizCompleted } = state.quiz; // Access quiz state
  const { playbackOptions, playbackSpeed, autoProceed } = state.systemSettings; // Access systemSettings state
  const question = questions[currentQuestionIndex];
  const blocker = useBlocker(!quizCompleted);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!quizCompleted) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [quizCompleted]);

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
        <>
          <Overlay onClick={() => setShowSettings(false)} />
          <FloatingSettingsPanel>
            <SettingsPanel
              playbackSpeed={playbackSpeed}
              setPlaybackSpeed={(newSpeed) => dispatch(setPlaybackSpeed(newSpeed))}
              playbackOptions={playbackOptions}
              setPlaybackOptions={(newOptions) => dispatch(setPlaybackOptions(newOptions))}
              autoProceed={autoProceed} // Pass autoProceed from global state
              setAutoProceed={(newAutoProceed) => dispatch(setAutoProceed(newAutoProceed))} // Pass setAutoProceed from global state
              isQuizContext={true} // New prop
            />
          </FloatingSettingsPanel>
        </>
      )}

      <Title>單字練習</Title>
      <Progress>
        第 {currentQuestionIndex + 1} 題 / 共 {questions.length} 題
      </Progress>

      {/* Pass speakManually and question down as they are not part of the quiz context */}
      <QuestionCard speakManually={speakManually} cancelPlayback={cancelPlayback} question={question} />

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
  const { quizScope, startQuestionIndex, wordRangeCount } = state.systemSettings; // Destructure new settings
  const [emptyAlert, setEmptyAlert,]=useState(false)
  const navigate = useNavigate();
  useEffect(() => {
    if (!quizCompleted) {
      const currentNotebook = notebooks.find(n => n.id === currentNotebookId);
      if (currentNotebook) {
        let questions = currentNotebook.context.filter(q => {
          if (!q.jp_word) return false; // Ensure jp_word exists

          // Apply quizScope filter (old logic)
          if (quizScope === "all") return true;
          if (quizScope === "low" && q.proficiency === 1) return true;
          if (quizScope === "medium" && q.proficiency === 2) return true;
          if (quizScope === "high" && q.proficiency === 3) return true;
          return false;
        });

        // Apply startQuestionIndex and wordRangeCount filters
        const startIndex = Math.max(0, startQuestionIndex - 1); // Convert to 0-based index
        const endIndex = Math.min(questions.length, startIndex + wordRangeCount);
        questions = questions.slice(startIndex, endIndex);

        console.log("Quiz useEffect - filtered questions IDs:", questions.map(q => q.id)); // Add this log
        if (questions.length > 0) {
          dispatch(startQuiz(questions));
        } else {
          // Handle case where notebook is empty or no questions match filter
          setEmptyAlert(true)
        }
      }
    }
  }, [currentNotebookId, dispatch, quizCompleted, quizScope, notebooks, startQuestionIndex, wordRangeCount]); // Add new dependencies

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
    return (     
      <>
        <Modal
          message="請調整單字範圍或筆記本!"
          onConfirm={()=>{navigate("/settings")}}
          disableCancel
          isVisible={emptyAlert}
        />
          <div>Loading questions...</div>;
      </>
    )
  }
  return (
      <QuizContent />
  );
}
