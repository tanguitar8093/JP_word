import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../../store/contexts/AppContext";
import { useAnswerPlayback } from "../../../../hooks/useAnswerPlayback";
import FillInQuestionCard from "../FillInQuestionCard";
import ExampleSentence from "../ExampleSentence";
import SettingsPanel from "../../../../components/SettingsPanel";
import Modal from "../../../../components/Modal";
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
import styled from "styled-components";
import {
  nextQuestionGame,
  restartQuiz,
  startQuiz,
} from "../../../../pages/quiz/reducer/actions";
import quizProgressService from "../../../../services/quizProgressService";
import readingProgressService from "../../../../services/readingProgressService";
import fillinProgressService from "../../../../services/fillinProgressService";
import StatisticsPage from "../StatisticsPage";
import AudioRecorderPage from "../../../AudioRecorder";
import { commitPendingProficiencyUpdates } from "../../../../store/reducer/actions";
import notebookService from "../../../../services/notebookService";
import { setCurrentNotebook } from "../../../../store/reducer/actions";

const IconContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 100;
`;
const IconGroup = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: row-reverse;
`;
const HomeIcon = styled(SettingsToggle)`
  right: 5px;
`;

const proficiencyMap = { 1: "低", 2: "中", 3: "高" };
const sortOrderMap = { random: "隨機", aiueo: "あいうえお", none: "預設" };

function Content() {
  const [showSettings, setShowSettings] = useState(false);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const navigate = useNavigate();
  const [result, setResult] = useState(null); // '⭕' | '❌' | null
  const [selectedAnswer, setSelectedAnswer] = useState("");

  const { state, dispatch } = useApp();
  const { questions, currentQuestionIndex } = state.quiz;
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

  const currentNotebook = notebooks.find((n) => n.id === currentNotebookId);
  const notebookName = currentNotebook ? currentNotebook.name : "";
  const selectedProficiencies = Object.entries(proficiencyFilter)
    .filter(([, value]) => value)
    .map(([key]) => proficiencyMap[key])
    .join(", ");

  const handleConfirmExit = useCallback(() => {
    try {
      quizProgressService.clearProgress();
      readingProgressService.clearProgress();
      fillinProgressService.clearProgress();
    } catch {}
    dispatch(commitPendingProficiencyUpdates());
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
    onNext: () => dispatch(nextQuestionGame()),
    playbackOptions,
    rate: playbackSpeed,
    autoProceed,
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

  // 題目切換時自動播放發音（與 Quiz 一致）
  useEffect(() => {
    if (question && question.jp_word) {
      speakManually(question.jp_word, "ja");
    }
  }, [question, speakManually]);

  // 清理狀態於題目切換
  useEffect(() => {
    setResult(null);
    setSelectedAnswer("");
  }, [currentQuestionIndex]);

  // 自動儲存 Fill-in 進度（移動到下一題時）
  const prevIndexRef = React.useRef(state.quiz.currentQuestionIndex);
  useEffect(() => {
    const idx = state.quiz.currentQuestionIndex;
    const prev = prevIndexRef.current;
    prevIndexRef.current = idx;
    if (state.quiz.quizCompleted) return;
    if (idx > prev && state.quiz.questions.length > 0) {
      const questionIds = state.quiz.questions.map((q) => q.id);
      const results = state.quiz.answeredQuestions.map((a) => a.isCorrect);
      fillinProgressService.saveProgress({
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
    state.quiz.quizCompleted,
    sortOrder,
    state.shared.currentNotebookId,
  ]);

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
            <SettingsPanel context="quiz" />
          </FloatingSettingsPanel>
        </>
      )}

      <Title>拼字練習</Title>
      <Progress>
        第 {currentQuestionIndex + 1} 題 / 共 {questions.length} 題
      </Progress>

      {/* 錄音區塊（與 Quiz 一致） */}
      <AudioRecorderPage triggerReset={currentQuestionIndex} />

      {!result && (
        <FillInQuestionCard
          question={question}
          allQuestions={questions}
          onComplete={({ correct, guess }) => {
            setSelectedAnswer(guess);
            setResult(correct ? "⭕" : "❌");
          }}
          speak={(text, lang) => speakManually(text, lang)}
        />
      )}

      {result && (
        <div style={{ maxWidth: 720, margin: "0 auto", padding: 12 }}>
          <div
            style={{
              borderRadius: 12,
              border: `1px solid ${result === "⭕" ? "#4caf50" : "#e53935"}`,
              padding: 12,
              background: result === "⭕" ? "#e8f5e9" : "#ffebee",
              marginBottom: 12,
            }}
          >
            <div style={{ fontSize: 18, marginBottom: 6 }}>
              {question.ch_word} [{question.type}]
            </div>
            <div style={{ fontSize: 18 }}>
              {selectedAnswer} {result}
            </div>
          </div>
          <ExampleSentence
            jp_ex={question.jp_ex_statement}
            ch_ex={question.ch_ex_statement}
            speak={speakManually}
            jp_ex_context={question.jp_ex_statement_context}
            wordType={state.systemSettings.wordType}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button
              onClick={() => {
                cancelPlayback();
                setResult(null);
                setSelectedAnswer("");
                dispatch(nextQuestionGame());
              }}
            >
              下一題
            </button>
            {autoProceed && (
              <span
                style={{ fontSize: 12, color: "#666", alignSelf: "center" }}
              >
                自動前進已開啟
              </span>
            )}
          </div>
        </div>
      )}

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

export default function FillInQuiz() {
  const { state, dispatch } = useApp();
  const { notebooks, currentNotebookId } = state.shared;
  const {
    proficiencyFilter,
    startQuestionIndex,
    wordRangeCount,
    sortOrder,
    playbackOptions,
    playbackSpeed,
    wordType,
  } = state.systemSettings;
  const { quizCompleted, answeredQuestions, correctAnswersCount } = state.quiz;
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

  // 嘗試從本地進度還原（Fill-in 專用）
  useEffect(() => {
    if (quizCompleted) return;
    const saved = fillinProgressService.loadProgress();
    if (!saved) return;
    if (!notebooks || notebooks.length === 0) return;

    const { notebookId: savedNotebookId, questionIds, currentIndex, results } = saved;

    if (savedNotebookId && savedNotebookId !== currentNotebookId) {
      dispatch(setCurrentNotebook(savedNotebookId));
      notebookService.setCurrentNotebookId(savedNotebookId);
    }

    const nb = notebooks.find((n) => n.id === savedNotebookId);
    if (!nb) return;

    const byId = new Map((nb.context || []).map((w) => [w.id, w]));
    const restoredQuestions = (questionIds || [])
      .map((id) => byId.get(id))
      .filter(Boolean);

    if (restoredQuestions.length === 0) return;

    const clampedIndex = Math.min(Math.max(0, currentIndex || 0), restoredQuestions.length);
    const trimmedResults = Array.isArray(results) ? results.slice(0, clampedIndex) : [];

    dispatch({
      type: "quiz/LOAD_PROGRESS",
      payload: {
        questions: restoredQuestions,
        currentIndex: clampedIndex,
        results: trimmedResults,
      },
    });
    setHydratedFromProgress(true);
  }, [quizCompleted, notebooks, currentNotebookId, dispatch]);

  // 正常初始化（若沒有本地進度或不同筆記本）
  useEffect(() => {
    if (!quizCompleted && !hydratedFromProgress) {
      const saved = fillinProgressService.loadProgress();
      if (saved && notebooks && notebooks.some((n) => n.id === saved.notebookId)) return;
      const currentNotebook = notebooks.find((n) => n.id === currentNotebookId);
      if (currentNotebook) {
        let questions = currentNotebook.context.filter((q) => {
          if (!q.jp_word) return false;
          return proficiencyFilter[q.proficiency];
        });
        const startIndex = Math.max(0, startQuestionIndex - 1);
        const endIndex = Math.min(questions.length, startIndex + wordRangeCount);
        questions = questions.slice(startIndex, endIndex);
        if (questions.length > 0) {
          dispatch(startQuiz(questions, sortOrder));
        } else {
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

  // 完成後使用同一個統計頁
  if (quizCompleted) {
    return (
      <StatisticsPage
        answeredQuestions={answeredQuestions}
        correctAnswersCount={correctAnswersCount}
        speakManually={speakManually}
        wordType={wordType}
      />
    );
  }

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
        <div>Loading questions...</div>
      </>
    );
  }

  return <Content />;
}
