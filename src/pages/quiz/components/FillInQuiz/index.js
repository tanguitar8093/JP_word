import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../../store/contexts/AppContext";
import { useAnswerPlayback } from "../../../../hooks/useAnswerPlayback";
import FillInQuestionCard from "../FillInQuestionCard";
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
import { nextQuestionGame, restartQuiz, startQuiz } from "../../../../pages/quiz/reducer/actions";
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

  const { state, dispatch } = useApp();
  const { questions, currentQuestionIndex, quizCompleted } = state.quiz;
  const {
    playbackOptions,
    playbackSpeed,
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

  return (
    <AppContainer>
      <IconContainer>
        <IconGroup>
          <SettingsToggle onClick={() => setShowSettings((s) => !s)}>⚙️</SettingsToggle>
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
      <Progress>第 {currentQuestionIndex + 1} 題 / 共 {questions.length} 題</Progress>

      <FillInQuestionCard
        question={question}
        allQuestions={questions}
        onAnswer={(correct) => {
          // advance when filled; keep same logic as quiz game flow
          if (correct) {
            // correctness feedback handled in card; advance to next
            dispatch(nextQuestionGame());
          }
        }}
        speak={(text, lang) => speakManually(text, lang)}
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

export default function FillInQuiz() {
  const { state, dispatch } = useApp();
  const { notebooks, currentNotebookId } = state.shared;
  const { proficiencyFilter, startQuestionIndex, wordRangeCount, sortOrder, playbackOptions, playbackSpeed } = state.systemSettings;
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
  }, [quizCompleted, notebooks, currentNotebookId, proficiencyFilter, startQuestionIndex, wordRangeCount, sortOrder, dispatch]);

  if (quizCompleted) {
    // reuse existing results page for simplicity
    return (
      <div style={{ padding: 20 }}>
        <h3>完成！</h3>
        <button onClick={() => { dispatch(restartQuiz()); }}>再測一次</button>
        <button onClick={() => { window.location.href = process.env.PUBLIC_URL + '/'; }}>回首頁</button>
      </div>
    );
  }

  if (state.quiz.questions.length === 0) {
    return (
      <>
        <Modal
          message="請調整單字範圍或筆記本!"
          onConfirm={() => { navigate("/settings"); }}
          disableCancel
          isVisible={emptyAlert}
        />
        <div>Loading questions...</div>
      </>
    );
  }

  return <Content />;
}
