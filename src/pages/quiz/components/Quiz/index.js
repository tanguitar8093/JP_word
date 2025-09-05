import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../../store/contexts/AppContext"; // Changed from QuizContext
import { useAnswerPlayback } from "../../../../hooks/useAnswerPlayback";
import QuestionCard from "../QuestionCard";
import AudioRecorderPage from "../../../AudioRecorder";
import SettingsPanel from "../../../../components/SettingsPanel";
import StatisticsPage from "../StatisticsPage"; // Import StatisticsPage
import Modal from "../../../../components/Modal"; // Import the new Modal component
import {
  setPlaybackOptions,
  setPlaybackSpeed,
  setAutoProceed,
} from "../../../../components/SettingsPanel/reducer"; // Import actions
import {
  AppContainer,
  Title,
  Progress,
  SettingsToggle,
  FloatingSettingsPanel,
  InfoToggle,
  Overlay,
  BackPage,
} from "../../../../components/App/styles";
import {
  nextQuestionGame, // Changed from NEXT_QUESTION
  restartQuiz,
  startQuiz,
} from "../../../../pages/quiz/reducer/actions"; // Import quiz actions

import quizProgressService from "../../../../services/quizProgressService";
import readingProgressService from "../../../../services/readingProgressService";
import notebookService from "../../../../services/notebookService";
import { setCurrentNotebook } from "../../../../store/reducer/actions";

import { commitPendingProficiencyUpdates } from "../../../../store/reducer/actions"; // Import commitPendingProficiencyUpdates
import {
  updatePendingProficiency,
  updateWordInNotebook,
} from "../../../../store/reducer/actions";

// Import moved styles
import {
  IconContainer,
  IconGroup,
  HomeIcon,
  TopBar,
  RightPanel,
  TinyButton,
} from "./styles";

// The actual UI component that consumes the context
// (imports moved to top to satisfy eslint import/first)

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
    gameSoundEffects,
    proficiencyFilter,
    startQuestionIndex,
    wordRangeCount,
    sortOrder,
  } = state.systemSettings;
  const { notebooks, currentNotebookId } = state.shared;
  const question = questions[currentQuestionIndex];

  // Local bug flag for optimistic UI
  const [isBug, setIsBug] = useState(() =>
    question ? !!question.word_bug : false
  );
  useEffect(() => {
    setIsBug(question ? !!question.word_bug : false);
  }, [question?.id, question?.word_bug]);

  const currentNotebook = notebooks.find((n) => n.id === currentNotebookId);
  const notebookName = currentNotebook ? currentNotebook.name : "";

  const selectedProficiencies = Object.entries(proficiencyFilter)
    .filter(([, value]) => value)
    .map(([key]) => proficiencyMap[key])
    .join(", ");

  const handleConfirmExit = useCallback(() => {
    // Clear saved progress when user decides to exit
    try {
      quizProgressService.clearProgress();
      readingProgressService.clearProgress();
    } catch {}
    dispatch(commitPendingProficiencyUpdates()); // Commit changes before exiting
    dispatch(restartQuiz());
    setShowExitConfirmModal(false);
    navigate("/");
    window.location.reload();
  }, [dispatch, navigate]);

  const handleCancelExit = useCallback(() => {
    setShowExitConfirmModal(false);
  }, []);

  const { playSequence, cancelPlayback } = useAnswerPlayback({
    result,
    question,
    onNext: () => dispatch(nextQuestionGame()), // Changed dispatch type
    playbackOptions, // Now from global state
    rate: playbackSpeed, // Use playbackSpeed from global state
    autoProceed, // Pass autoProceed from global state
    gameSoundEffects,
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
          <HomeIcon onClick={() => setShowExitConfirmModal(true)}>↩️</HomeIcon>
          <InfoToggle onClick={() => setShowInfoModal(true)}>ℹ️</InfoToggle>
          <BackPage onClick={() => navigate("/")}>🏠</BackPage>
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
              context="quiz" // New prop
            />
          </FloatingSettingsPanel>
        </>
      )}

      <Title>單字練習</Title>
      <Progress>
        第 {currentQuestionIndex + 1} 題 / 共 {questions.length} 題
      </Progress>

      {/* Top bar: left recorder, right proficiency/bug panel */}
      <TopBar>
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <AudioRecorderPage triggerReset={currentQuestionIndex} />
        </div>
        {/* Right-side controls for current question */}
        {question && (
          <RightPanel>
            {/* Proficiency */}
            <TinyButton
              className={
                (state.shared.pendingProficiencyUpdates[question.id] ||
                  question.proficiency) === 1
                  ? "active"
                  : ""
              }
              onClick={(e) => {
                e.stopPropagation();
                dispatch(updatePendingProficiency(question.id, 1));
              }}
              title="設為低熟練度"
            >
              低
            </TinyButton>
            <TinyButton
              className={
                (state.shared.pendingProficiencyUpdates[question.id] ||
                  question.proficiency) === 2
                  ? "active"
                  : ""
              }
              onClick={(e) => {
                e.stopPropagation();
                dispatch(updatePendingProficiency(question.id, 2));
              }}
              title="設為中熟練度"
            >
              中
            </TinyButton>
            <TinyButton
              className={
                (state.shared.pendingProficiencyUpdates[question.id] ||
                  question.proficiency) === 3
                  ? "active"
                  : ""
              }
              onClick={(e) => {
                e.stopPropagation();
                dispatch(updatePendingProficiency(question.id, 3));
              }}
              title="設為高熟練度"
            >
              高
            </TinyButton>
            {/* Bug toggle */}
            <TinyButton
              className={isBug ? "active" : ""}
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  const nbId = state.shared.currentNotebookId;
                  const newVal = !isBug;
                  setIsBug(newVal); // optimistic
                  await notebookService.updateWordInNotebook(
                    nbId,
                    question.id,
                    {
                      word_bug: newVal,
                    }
                  );
                  dispatch(
                    updateWordInNotebook(nbId, question.id, {
                      word_bug: newVal,
                    })
                  );
                } catch (e) {
                  console.error("toggle bug (Quiz) failed", e);
                  setIsBug((prev) => !prev); // revert
                }
              }}
              title="標記為錯誤/取消"
            >
              錯
            </TinyButton>
          </RightPanel>
        )}
      </TopBar>

      <QuestionCard
        speakManually={speakManually}
        cancelPlayback={cancelPlayback}
        question={question}
      />

      <Modal
        message="要終止測驗，並儲存熟練標籤離開嗎？"
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
  const [hydratedFromProgress, setHydratedFromProgress] = useState(false);
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

  // Hydrate from saved progress if any
  useEffect(() => {
    if (quizCompleted) return;
    if (hydratedFromProgress) return; // avoid re-hydrating on notebooks updates
    const saved = quizProgressService.loadProgress();
    if (!saved) return;
    if (!notebooks || notebooks.length === 0) return; // wait until notebooks are loaded

    const {
      notebookId: savedNotebookId,
      questionIds,
      currentIndex,
      results,
    } = saved;

    // Ensure current notebook matches saved
    if (savedNotebookId && savedNotebookId !== currentNotebookId) {
      dispatch(setCurrentNotebook(savedNotebookId));
      notebookService.setCurrentNotebookId(savedNotebookId);
    }

    const nb = notebooks.find((n) => n.id === savedNotebookId);
    if (!nb) return; // don't clear here; only clear on explicit exit/end

    const byId = new Map((nb.context || []).map((w) => [w.id, w]));
    const restoredQuestions = (questionIds || [])
      .map((id) => byId.get(id))
      .filter(Boolean);

    if (restoredQuestions.length === 0) return; // fallback to normal flow; keep progress for now

    const clampedIndex = Math.min(
      Math.max(0, currentIndex || 0),
      restoredQuestions.length
    );
    const trimmedResults = Array.isArray(results)
      ? results.slice(0, clampedIndex)
      : [];

    dispatch({
      type: "quiz/LOAD_PROGRESS",
      payload: {
        questions: restoredQuestions,
        currentIndex: clampedIndex,
        results: trimmedResults,
      },
    });
    setHydratedFromProgress(true);
  }, [
    quizCompleted,
    notebooks,
    currentNotebookId,
    dispatch,
    hydratedFromProgress,
  ]);

  useEffect(() => {
    if (!quizCompleted && !hydratedFromProgress) {
      // 避免在題目已載入的情況下，因 notebooks 內容更新（例如 word_bug 切換）而重新初始化並改變選項順序
      if (state.quiz.questions && state.quiz.questions.length > 0) return;
      // If there is valid saved progress for an existing notebook, skip normal initialization to avoid race
      const saved = quizProgressService.loadProgress();
      if (
        saved &&
        notebooks &&
        notebooks.some((n) => n.id === saved.notebookId)
      )
        return;
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
          // 準備選項生成的上下文資料
          const optionsContext = {
            currentNotebookWords: currentNotebook.context || [],
            allNotebookWords: notebooks.flatMap(nb => nb.context || []),
            strategy: {
              optionsStrategy: state.systemSettings.optionsStrategy || "mixed",
              mixedStrategyLocalRatio: state.systemSettings.mixedStrategyLocalRatio || 0.8,
            }
          };
          dispatch(startQuiz(questions, sortOrder, optionsContext));
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
    hydratedFromProgress,
    proficiencyFilter,
    notebooks,
    startQuestionIndex,
    wordRangeCount,
    sortOrder,
  ]);

  // Auto-save progress when moving to next question (index increases)
  const prevIndexRef = React.useRef(state.quiz.currentQuestionIndex);
  useEffect(() => {
    const idx = state.quiz.currentQuestionIndex;
    const prev = prevIndexRef.current;
    prevIndexRef.current = idx;
    if (quizCompleted) return;
    if (idx > prev && state.quiz.questions.length > 0) {
      const questionIds = state.quiz.questions.map((q) => q.id);
      const results = state.quiz.answeredQuestions.map((a) => a.isCorrect);
      quizProgressService.saveProgress({
        notebookId: state.shared.currentNotebookId,
        questionIds,
        currentIndex: idx,
        results,
        sortOrder,
      });
    }
  }, [
    state.quiz.currentQuestionIndex,
    state.quiz.questions,
    state.quiz.answeredQuestions,
    quizCompleted,
    sortOrder,
    state.shared.currentNotebookId,
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
