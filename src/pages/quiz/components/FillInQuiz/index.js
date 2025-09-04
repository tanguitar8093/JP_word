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
  recordFillInResult,
} from "../../../../pages/quiz/reducer/actions";
import quizProgressService from "../../../../services/quizProgressService";
import readingProgressService from "../../../../services/readingProgressService";
import fillinProgressService from "../../../../services/fillinProgressService";
import StatisticsPage from "../StatisticsPage";
import AudioRecorderPage from "../../../AudioRecorder";
import {
  commitPendingProficiencyUpdates,
  updateWordInNotebook,
} from "../../../../store/reducer/actions";
import notebookService from "../../../../services/notebookService";
import { setCurrentNotebook } from "../../../../store/reducer/actions";
import { updatePendingProficiency } from "../../../../store/reducer/actions"; // 新增：更新熟練度（pending）
import {
  ProficiencyControlContainer as StatProficiencyControlContainer,
  ProficiencyButton as StatProficiencyButton,
} from "../StatisticsPage/styles"; // 新增：沿用統計頁面的熟練度樣式（非絕對定位）

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

// Top bar: recorder (left) + controls (right)
const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const RightPanel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TinyButton = styled.button`
  padding: 2px 6px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f0f0f0;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  line-height: 1.4;

  &:hover {
    background-color: #e7e7e7;
  }

  &.active {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
  }
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
  const [isBug, setIsBug] = useState(false);

  const { state, dispatch } = useApp();
  const { questions, currentQuestionIndex } = state.quiz;
  const {
    playbackOptions,
    playbackSpeed,
    autoProceed,
  gameSoundEffects,
    proficiencyFilter,
    startQuestionIndex,
    wordRangeCount,
    sortOrder,
    wordType,
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

  // Use hook only for speaking/cancel; handle result playback and auto-next manually to avoid double triggers
  const { playSequence, cancelPlayback } = useAnswerPlayback({
    question,
    onNext: () => {},
    playbackOptions,
    rate: playbackSpeed,
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

  // 題目切換時自動播放發音（與 Quiz 一致）
  useEffect(() => {
    if (question && question.jp_word) {
      speakManually(question.jp_word, "ja");
    }
  }, [question, speakManually]);

  useEffect(() => {
    setIsBug(question ? !!question.word_bug : false);
  }, [question?.id, question?.word_bug]);

  // 清理狀態於題目切換
  useEffect(() => {
    setResult(null);
    setSelectedAnswer("");
  }, [currentQuestionIndex]);

  // 在結果頁播放答題音與語音，結束後依設定自動前進
  useEffect(() => {
    if (!result || !question) return;
    let stopped = false;
    (async () => {
      await playSequence(result, question, playbackOptions, {
        skipSound: !gameSoundEffects,
      });
      if (stopped) return;
      if (autoProceed) {
        // Clear local result before跳下一題，避免在 question 改變但 result 仍為真時再次觸發此效果而重播答題音
        setResult(null);
        setSelectedAnswer("");
        dispatch(nextQuestionGame());
      }
    })();
    return () => {
      stopped = true;
      cancelPlayback();
    };
  }, [
    result,
    question,
    playbackOptions,
    autoProceed,
    dispatch,
    playSequence,
    cancelPlayback,
    gameSoundEffects,
  ]);

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

  // 依設定呈現日文顯示（假名/漢字/漢字+ruby）
  const renderWordByType = useCallback(() => {
    if (!question) return null;
    if (wordType === "kanji_jp_word") {
      return <span>{question.kanji_jp_word || question.jp_word}</span>;
    }
    if (wordType === "jp_word") {
      return <span>{question.jp_word}</span>;
    }
    if (wordType === "jp_context" && Array.isArray(question.jp_context)) {
      return (
        <span>
          {question.jp_context.map((part, index) =>
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
      );
    }
    // fallback
    return <span>{question.jp_word}</span>;
  }, [question, wordType]);

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
            <SettingsPanel context="fillin" />
          </FloatingSettingsPanel>
        </>
      )}

      <Title>拼字練習</Title>
      <Progress>
        第 {currentQuestionIndex + 1} 題 / 共 {questions.length} 題
      </Progress>

      {/* Top bar: left recorder, right proficiency/bug panel */}
      <TopBar>
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <AudioRecorderPage triggerReset={currentQuestionIndex} />
        </div>
        {question && (
          <RightPanel>
            <TinyButton
              className={
                (state.shared.pendingProficiencyUpdates[question.id] ||
                  question.proficiency) === 1
                  ? "active"
                  : ""
              }
              onClick={() => dispatch(updatePendingProficiency(question.id, 1))}
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
              onClick={() => dispatch(updatePendingProficiency(question.id, 2))}
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
              onClick={() => dispatch(updatePendingProficiency(question.id, 3))}
              title="設為高熟練度"
            >
              高
            </TinyButton>
            <TinyButton
              className={isBug ? "active" : ""}
              onClick={async () => {
                try {
                  const newVal = !isBug;
                  setIsBug(newVal);
                  await notebookService.updateWordInNotebook(
                    state.shared.currentNotebookId,
                    question.id,
                    { word_bug: newVal }
                  );
                  dispatch(
                    updateWordInNotebook(
                      state.shared.currentNotebookId,
                      question.id,
                      { word_bug: newVal }
                    )
                  );
                } catch (e) {
                  console.error("toggle bug (FillIn top bar) failed", e);
                  setIsBug((prev) => !prev);
                }
              }}
              title="標記為錯誤/取消"
            >
              錯
            </TinyButton>
          </RightPanel>
        )}
      </TopBar>

      {!result && (
        <FillInQuestionCard
          question={question}
          allQuestions={questions}
          onComplete={({ correct, guess }) => {
            setSelectedAnswer(guess);
            setResult(correct ? "⭕" : "❌");
            // 紀錄填空作答結果，讓結算頁與進度儲存正確
            dispatch(recordFillInResult(correct));
          }}
          speak={(text, lang) => speakManually(text, lang)}
        />
      )}

      {result && (
        <div style={{ maxWidth: 720, margin: "0 auto", padding: 12 }}>
          {/* 熟練度/錯誤控制已移至頂部右側面板 */}

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
            {/* 依設定顯示日文答案 */}
            <div style={{ fontSize: 18, marginTop: 8 }}>
              日文：{renderWordByType()}{" "}
              <button
                style={{ marginLeft: 8 }}
                onClick={() => speakManually(question.jp_word, "ja")}
                aria-label="播放日文發音"
              >
                🔊
              </button>
            </div>
          </div>
          <ExampleSentence
            jp_ex={question.jp_ex_statement}
            ch_ex={question.ch_ex_statement}
            speak={speakManually}
            jp_ex_context={question.jp_ex_statement_context}
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

    const {
      notebookId: savedNotebookId,
      questionIds,
      currentIndex,
      results,
    } = saved;

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
  }, [quizCompleted, notebooks, currentNotebookId, dispatch]);

  // 正常初始化（若沒有本地進度或不同筆記本）
  useEffect(() => {
    if (!quizCompleted && !hydratedFromProgress) {
      // 避免在題目已載入的情況下，因 notebooks 內容更新（例如 word_bug 切換）而重新初始化並改變順序
      if (state.quiz.questions && state.quiz.questions.length > 0) return;
      const saved = fillinProgressService.loadProgress();
      if (
        saved &&
        notebooks &&
        notebooks.some((n) => n.id === saved.notebookId)
      )
        return;
      const currentNotebook = notebooks.find((n) => n.id === currentNotebookId);
      if (currentNotebook) {
        let questions = currentNotebook.context.filter((q) => {
          if (!q.jp_word) return false;
          return proficiencyFilter[q.proficiency];
        });
        const startIndex = Math.max(0, startQuestionIndex - 1);
        const endIndex = Math.min(
          questions.length,
          startIndex + wordRangeCount
        );
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
