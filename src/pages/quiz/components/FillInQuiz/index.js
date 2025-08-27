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
  const { questions, currentQuestionIndex, quizCompleted } = state.quiz;
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
    } catch {}
    dispatch(restartQuiz());
    setShowExitConfirmModal(false);
    navigate("/");
    window.location.reload();
  }, [dispatch, navigate]);

  const handleCancelExit = useCallback(() => {
    setShowExitConfirmModal(false);
  }, []);

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

  // Clear local result when question changes to avoid residue
  useEffect(() => {
    setResult(null);
    setSelectedAnswer("");
  }, [currentQuestionIndex]);

  // Auto proceed after showing result if enabled
  useEffect(() => {
    if (!result || !autoProceed) return;
    const t = setTimeout(() => {
      setResult(null);
      setSelectedAnswer("");
      dispatch(nextQuestionGame());
    }, 900);
    return () => clearTimeout(t);
  }, [result, autoProceed, dispatch]);

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
  } = state.systemSettings;
  const { quizCompleted, answeredQuestions, correctAnswersCount } = state.quiz;
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
    if (quizCompleted) return;
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
  }, [
    quizCompleted,
    notebooks,
    currentNotebookId,
    proficiencyFilter,
    startQuestionIndex,
    wordRangeCount,
    sortOrder,
    dispatch,
  ]);

  if (quizCompleted) {
    // reuse existing results page for simplicity
    return (
      <div style={{ padding: 20 }}>
        <h3>完成！</h3>
        <button
          onClick={() => {
            dispatch(restartQuiz());
          }}
        >
          再測一次
        </button>
        <button
          onClick={() => {
            window.location.href = process.env.PUBLIC_URL + "/";
          }}
        >
          回首頁
        </button>
      </div>
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
