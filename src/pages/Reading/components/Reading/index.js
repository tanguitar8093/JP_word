import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useBlocker } from "react-router-dom"; // Import useBlocker
import { useApp } from "../../../../store/contexts/AppContext"; // Changed from QuizContext
import { useAnswerPlayback } from "../../../../hooks/useAnswerPlayback";
import ReadingCard from "../ReadingCard";
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
} from "../../../quiz/reducer/actions"; // Import quiz actions

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

const MinimalistButton = styled.button`
  font-size: 12px;
  padding: 10px 16px;
  cursor: pointer;
  border-radius: 18px;
  border: 1.5px solid gray;
  background-color: white;
  // color: #007bff;
  margin: 8px 0 8px 8px; /* 上 右 下 左 間距，與左上角保持微小間隔 */
  // font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 123, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  max-width: fit-content;

  &:hover {
    background-color: #f0f8ff;
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(0, 123, 255, 0.15);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 1px 3px rgba(0, 123, 255, 0.15);
  }

  @media (max-width: 768px) {
    font-size: 12px;
    padding: 5px 10px;
    margin: 6px 0 6px 6px;
    border-radius: 14px;
  }
`;

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
  const [showPauseConfirmModal, setShowPauseConfirmModal] = useState(false); // State for modal visibility
  const [exitQuiz, setExitQuiz] = useState(false);
  const navigate = useNavigate();
  const recorderRef = useRef(null);
  const [isAutoPlayActive, setIsAutoPlayActive] = useState(false);
  const [isSequencePaused, setIsSequencePaused] = useState(false);

  // Correct: Get state and dispatch from the context using useApp hook
  const { state, dispatch } = useApp(); // Changed from useQuiz
  const { questions, currentQuestionIndex, result, quizCompleted } = state.quiz; // Access quiz state
  const {
    playbackOptions,
    playbackSpeed,
    proficiencyFilter,
    startQuestionIndex,
    wordRangeCount,
    sortOrder,
    readingStudyMode,
    readingRecordWord,
    readingRecordSentence,
    readingPlayBeep,
    readingWordRecordTime,
    readingSentenceRecordTime,
    readingPlaybackRepeatCount,
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

  const handleConfirmPause = useCallback(() => {
    blocker.proceed();
    setShowPauseConfirmModal(false);
  }, [blocker, dispatch]);

  const handleCancelExit = useCallback(() => {
    blocker.reset();
    setShowExitConfirmModal(false);
    setExitQuiz(false);
  }, [blocker]);

  useEffect(() => {
    if (blocker.state === "blocked" && !exitQuiz) {
      setShowPauseConfirmModal(true);
    } else if (blocker.state === "blocked" && exitQuiz) {
      setShowExitConfirmModal(true); // Show modal    instead of alert
    }
  }, [blocker]);

  const { playSequence, cancelPlayback } = useAnswerPlayback({
    result,
    question,
    onNext: () => dispatch(nextQuestionGame()), // Changed dispatch type
    playbackOptions, // Now from global state
    rate: playbackSpeed, // Use playbackSpeed from global state
  });

  const playBeep = () => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 pitch
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1); // Beep for 0.1 seconds
  };

  useEffect(() => {
    let timers = [];
    let isCancelled = false;

    const cancellableWait = (duration) => {
      return new Promise((resolve) => {
        const timer = setTimeout(resolve, duration);
        timers.push(timer);
      });
    };

    const autoPlaySequence = async () => {
      try {
        if (
          quizCompleted ||
          !question ||
          readingStudyMode !== "auto" ||
          !isAutoPlayActive ||
          isSequencePaused
        )
          return;

        const repeatPlayback = async (playbackFn) => {
          for (let i = 0; i < readingPlaybackRepeatCount; i++) {
            if (isCancelled) return;
            await playbackFn();
          }
        };

        // --- WORD PART ---
        await repeatPlayback(() =>
          playSequence(null, question, { jp: true }, { skipSound: true })
        );
        if (isCancelled) return;

        if (readingRecordWord) {
          if (readingPlayBeep) {
            playBeep();
            await cancellableWait(200);
            if (isCancelled) return;
          }

          if (recorderRef.current) await recorderRef.current.startRecording();
          if (isCancelled) return;

          await cancellableWait(readingWordRecordTime * 1000);
          if (isCancelled) return;

          if (recorderRef.current) await recorderRef.current.stopRecording();
          if (isCancelled) return;

          if (recorderRef.current) await recorderRef.current.play();
          if (isCancelled) return;

          await repeatPlayback(() =>
            playSequence(null, question, { jp: true }, { skipSound: true })
          );
          if (isCancelled) return;
        } else {
          await cancellableWait(1000);
          if (isCancelled) return;
        }

        await playSequence(null, question, { ch: true }, { skipSound: true });
        if (isCancelled) return;

        // --- SENTENCE PART ---
        if (question.jp_ex_statement) {
          await repeatPlayback(() =>
            playSequence(null, question, { jpEx: true }, { skipSound: true })
          );
          if (isCancelled) return;

          if (readingRecordSentence) {
            if (readingPlayBeep) {
              playBeep();
              await cancellableWait(200);
              if (isCancelled) return;
            }

            if (recorderRef.current) await recorderRef.current.startRecording();
            if (isCancelled) return;

            await cancellableWait(readingSentenceRecordTime * 1000);
            if (isCancelled) return;

            if (recorderRef.current) await recorderRef.current.stopRecording();
            if (isCancelled) return;

            if (recorderRef.current) await recorderRef.current.play();
            if (isCancelled) return;

            await repeatPlayback(() =>
              playSequence(null, question, { jpEx: true }, { skipSound: true })
            );
            if (isCancelled) return;
          } else {
            await cancellableWait(1000);
            if (isCancelled) return;
          }

          await playSequence(
            null,
            question,
            { chEx: true },
            { skipSound: true }
          );
          if (isCancelled) return;
        }

        // --- END PART ---
        await cancellableWait(2000);
        if (isCancelled) return;

        dispatch(nextQuestionGame());
      } catch (error) {
        if (!isCancelled) {
          console.error("Error in autoPlaySequence:", error);
        }
      }
    };

    autoPlaySequence();

    return () => {
      isCancelled = true;
      timers.forEach(clearTimeout);
      if (recorderRef.current) {
        recorderRef.current.stopRecording(); // Stop any ongoing recording
      }
      cancelPlayback(); // Stop any ongoing speech
    };
  }, [
    currentQuestionIndex,
    readingStudyMode,
    readingRecordWord,
    readingRecordSentence,
    readingPlayBeep,
    readingWordRecordTime,
    readingSentenceRecordTime,
    readingPlaybackRepeatCount,
    quizCompleted,
    dispatch,
    playSequence,
    question,
    playbackOptions,
    cancelPlayback,
    isAutoPlayActive,
    isSequencePaused,
  ]);

  const handleStartAutoPlay = async () => {
    if (recorderRef.current && (readingRecordWord || readingRecordSentence)) {
      const stream = await recorderRef.current.getMicrophonePermission();
      if (stream) {
        setIsAutoPlayActive(true);
      }
    } else {
      setIsAutoPlayActive(true);
    }
  };

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
          <HomeIcon
            onClick={() => {
              setExitQuiz(true);
              navigate("/");
            }}
          >
            ↩️
          </HomeIcon>
          <InfoToggle onClick={() => setShowInfoModal(true)}>ℹ️</InfoToggle>
        </IconGroup>
      </IconContainer>
      {showSettings && (
        <>
          <Overlay onClick={() => setShowSettings(false)} />
          <FloatingSettingsPanel>
            <SettingsPanel context="reading" />
          </FloatingSettingsPanel>
        </>
      )}

      <Title>單字練習</Title>
      <Progress>
        第 {currentQuestionIndex + 1} 題 / 共 {questions.length} 題
      </Progress>

      {readingStudyMode === "auto" && !isAutoPlayActive && (
        <MinimalistButton onClick={handleStartAutoPlay}>
          <span>開始</span>
          <span style={{ fontSize: "0.95em", fontWeight: "bold" }}>▶</span>
        </MinimalistButton>
      )}
      {readingStudyMode === "auto" && isAutoPlayActive && (
        <MinimalistButton
          onClick={() => setIsSequencePaused(!isSequencePaused)}
        >
          <span>{isSequencePaused ? "繼續" : "暫停"}</span>
          <span style={{ fontSize: "0.95em", fontWeight: "bold" }}>
            {isSequencePaused ? "▶" : "⏸"}
          </span>
        </MinimalistButton>
      )}

      <ReadingCard
        ref={recorderRef}
        speakManually={speakManually}
        cancelPlayback={cancelPlayback}
        question={question}
        studyMode={readingStudyMode}
        playbackOptions={playbackOptions}
        playSequence={playSequence}
        isPaused={readingStudyMode === "auto" && !isAutoPlayActive}
      />

      <Modal
        message="要終止測驗，並儲存熟練標籤離開嗎？"
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
        isVisible={showExitConfirmModal}
      />

      <Modal
        message="提醒: 若有標記熟練度, 需結束測驗才會儲存"
        onConfirm={handleConfirmPause}
        disableCancel
        isVisible={showPauseConfirmModal}
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
