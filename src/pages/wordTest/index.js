import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppContainer,
  Title,
  Progress,
  BackPage,
  SettingsToggle,
  LogToggle,
  Overlay,
  FloatingSettingsPanel,
  InfoToggle,
} from "../../components/App/styles";
import Modal from "../../components/Modal";
import { useApp } from "../../store/contexts/AppContext";
import notebookService from "../../services/notebookService";
import { updateWordInNotebook } from "../../store/reducer/actions";
import { shuffleArray } from "../../utils/questionUtils";
import { useAnswerPlayback } from "../../hooks/useAnswerPlayback";
import SettingsPanel from "../../components/SettingsPanel";
import {
  CardContainer,
  HiraganaToggleContainer,
  HiraganaTextContainer,
  ToggleButton,
  HiraganaText,
  WordContainer,
  SpeakButton,
  ResultContainer,
  AnswerText,
  SubCard,
  NextButton,
  ProficiencyButton,
} from "../Reading/components/ReadingCard/styles";
import ExampleSentence from "../Reading/components/ExampleSentence";
import AudioRecorderPage from "../AudioRecorder";
// duplicate imports removed

import {
  GameBox,
  StageToggleWrap,
  StageBtn,
  Btn,
  Bar,
  PanelGrid,
  Panel,
  PanelTitle,
  List,
  ListItem,
  IconContainer,
  IconGroup,
  HomeIcon,
} from "./styles";

const defaultConfig = {
  slice_length: 5,
  max_word_study: 20,
  sort_type: "normal", // normal | asc
  round_count: 3,
  review_interval: 0.5, // hours; minimum 0.05
};

// const GameBox = styled.div`
//   background: #fff;
//   border: 1px solid #eee;
//   border-radius: 12px;
//   padding: 16px;
//   margin-top: 8px;
//   box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
// `;

// const StageToggleWrap = styled.div`
//   display: flex;
//   justify-content: center;
//   gap: 8px;
//   margin: 6px 0 10px;
// `;

// const StageBtn = styled.button`
//   padding: 6px 10px;
//   border-radius: 8px;
//   border: 1px solid ${(p) => (p.active ? "#4caf50" : "#ddd")};
//   color: ${(p) => (p.active ? "#fff" : "#333")};
//   background: ${(p) => (p.active ? "#4caf50" : "#f7f7f7")};
//   cursor: pointer;
// `;

// const Btn = styled.button`
//   padding: 5px 7px;
//   border: 1px solid #ddd;
//   background: ${(p) => (p.primary ? "#4caf50" : "#f7f7f7")};
//   color: ${(p) => (p.primary ? "#fff" : "#333")};
//   border-radius: 8px;
//   cursor: pointer;
//   &:hover {
//     filter: brightness(0.98);
//   }
// `;

// const Bar = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
// `;

// const PanelGrid = styled.div`
//   display: grid;
//   grid-template-columns: repeat(2, 1fr);
//   gap: 12px;
//   margin-top: 12px;

//   @media (max-width: 768px) {
//     grid-template-columns: 1fr;
//   }
// `;

// const Panel = styled.div`
//   background: #fafafa;
//   border: 1px solid #eee;
//   border-radius: 8px;
//   padding: 10px;
// `;

// const PanelTitle = styled.div`
//   font-weight: 600;
//   color: #444;
//   margin-bottom: 8px;
// `;

// const List = styled.ul`
//   margin: 0;
//   padding-left: 18px;
//   max-height: 180px;
//   overflow: auto;
// `;

// const ListItem = styled.li`
//   color: #333;
//   margin: 2px 0;
// `;

// Consistent icon group (align with Reading/Quiz)
// const IconContainer = styled.div`
//   position: absolute;
//   top: 10px;
//   right: 10px; /* Keep it on the right side */
//   z-index: 100;
// `;

// const IconGroup = styled.div`
//   display: flex;
//   gap: 10px; /* Adjust gap between icons */
//   flex-direction: row-reverse; /* Put HomeIcon (↩️) on the far right */
// `;

// const HomeIcon = styled(SettingsToggle)`
//   right: 5px;
// `;

function getStudyValue(w) {
  // Canonical field
  const raw = w && typeof w === "object" ? w.studied ?? 0 : 0;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function getLastStudyTime(w) {
  const raw = w && typeof w === "object" ? w.lastStudyTime ?? 0 : 0;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : 0; // default 0 => very old
}

function sortWords(words, sortType) {
  if (sortType === "asc") {
    const groups = new Map();
    words.forEach((w) => {
      const len = (w.jp_word || "").length;
      if (!groups.has(len)) groups.set(len, []);
      groups.get(len).push(w);
    });
    const keys = Array.from(groups.keys()).sort((a, b) => a - b);
    const result = [];
    keys.forEach((k) => {
      result.push(...shuffleArray(groups.get(k)));
    });
    return result;
  }
  return shuffleArray(words);
}

function uniqueByWordKey(words) {
  const seen = new Set();
  const result = [];
  for (const w of words || []) {
    if (!w) continue;
    const key = `${w.jp_word || ""}|${w.kanji_jp_word || ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(w);
  }
  return result;
}

export default function WordTest() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { notebooks, currentNotebookId } = state.shared;
  const { playbackOptions, playbackSpeed, wordType } = state.systemSettings;

  const [config, setConfig] = useState(defaultConfig);
  // Stage: 'new' | 'review' | 'test' | 'wrong'
  // 統一狀態管理 - 合併所有分散的狀態到一個結構中
  const [testState, setTestState] = useState({
    stage: "new",
    restored: false,
    attemptedRestore: false,
    sessionPool: new Set(),
    wrongSet: new Set(),
    round: 0,
    wordIndex: 0,
    sliceIds: [],
    currentQueue: [],
    queueIdx: 0,
    memorySet: new Set(),
    visitedSet: new Set(),
    sessionDone: false,
    isAnswerVisible: false,
    showHiragana: false,
  });

  const currentNotebook = useMemo(
    () => notebooks.find((n) => n.id === currentNotebookId),
    [notebooks, currentNotebookId]
  );

  // 狀態更新函數 - 確保同步更新並保存到 localStorage
  const updateTestState = useCallback(
    (updates) => {
      setTestState((prev) => {
        const newState = { ...prev, ...updates };
        // 自動保存到 localStorage (但排除一些瞬時狀態)
        const stateToSave = {
          ...newState,
          sessionPool: Array.from(newState.sessionPool),
          wrongSet: Array.from(newState.wrongSet),
          memorySet: Array.from(newState.memorySet),
          visitedSet: Array.from(newState.visitedSet),
        };
        if (currentNotebookId && !newState.sessionDone) {
          try {
            notebookService.updateNotebookWordTest(currentNotebookId, {
              ...stateToSave,
              config,
              schemaVersion: 4,
              savedAt: Date.now(),
            });
          } catch (e) {
            console.warn("Failed to save word test state:", e);
          }
        }
        return newState;
      });
    },
    [currentNotebookId, config]
  );

  const eligibleWords = useMemo(() => {
    const ctx =
      currentNotebook && Array.isArray(currentNotebook.context)
        ? currentNotebook.context
        : [];
    if (testState.stage === "new") {
      const filtered = ctx.filter((w) => {
        if (!w || !w.jp_word) return false;
        return getStudyValue(w) === 0; // treat null/undefined/NaN as 0
      });
      const uniq = uniqueByWordKey(filtered);
      return uniq.slice(0, Math.max(0, config.max_word_study));
    }
    // review: pick studied > 0 AND past review interval, then choose the lowest-studied items up to max_word_study
    const now = Date.now();
    const hours = Number(
      config.review_interval ?? defaultConfig.review_interval
    );
    const clampHours = isNaN(hours)
      ? defaultConfig.review_interval
      : Math.max(0.05, hours);
    const thresholdMs = clampHours * 3600 * 1000;
    const studiedItems = ctx.filter((w) => {
      if (!w || !w.jp_word) return false;
      if (!(getStudyValue(w) > 0)) return false;
      const last = getLastStudyTime(w);
      return now - last > thresholdMs;
    });
    const uniqStudied = uniqueByWordKey(studiedItems);
    if (uniqStudied.length <= config.max_word_study) return uniqStudied;
    const groups = new Map();
    for (const w of uniqStudied) {
      const s = getStudyValue(w);
      if (!groups.has(s)) groups.set(s, []);
      groups.get(s).push(w);
    }
    const keys = Array.from(groups.keys()).sort((a, b) => a - b);
    const picked = [];
    for (const k of keys) {
      const arr = shuffleArray(groups.get(k));
      for (const w of arr) {
        picked.push(w);
        if (picked.length >= config.max_word_study) return picked;
      }
    }
    return picked;
  }, [
    currentNotebook,
    config.max_word_study,
    config.review_interval,
    testState.stage,
  ]);

  const testWords = useMemo(() => {
    if (testState.stage !== "test") return [];
    const ctx =
      currentNotebook && Array.isArray(currentNotebook.context)
        ? currentNotebook.context
        : [];
    const allowed = new Set(testState.sessionPool);
    const arr = ctx.filter((w) => allowed.has(w.id));
    return uniqueByWordKey(arr).slice();
  }, [testState.stage, testState.sessionPool, currentNotebook]);

  const wrongWords = useMemo(() => {
    if (testState.stage !== "wrong") return [];
    const ctx =
      currentNotebook && Array.isArray(currentNotebook.context)
        ? currentNotebook.context
        : [];
    const allowed = new Set(testState.wrongSet);
    const arr = ctx.filter((w) => allowed.has(w.id));
    return uniqueByWordKey(arr).slice();
  }, [testState.stage, testState.wrongSet, currentNotebook]);

  // Build a map for lookup and a default order
  const pageWords =
    testState.stage === "test"
      ? testWords
      : testState.stage === "wrong"
      ? wrongWords
      : eligibleWords;
  const byId = useMemo(
    () => new Map((pageWords || []).map((w) => [w.id, w])),
    [pageWords]
  );
  const defaultOrderWords = useMemo(() => {
    return sortWords(pageWords, config.sort_type);
  }, [pageWords, config.sort_type]);
  const defaultAllIds = useMemo(
    () => defaultOrderWords.map((w) => w.id),
    [defaultOrderWords]
  );
  // Allow restoring a persisted order instead of recomputing (prevents shuffle mismatch)
  const [overrideAllIds, setOverrideAllIds] = useState(null);
  const allIds = useMemo(() => {
    const ids = overrideAllIds || defaultAllIds;
    // Filter out ids that no longer exist in current context, and deduplicate defensively
    return Array.from(new Set(ids.filter((id) => byId.has(id))));
  }, [overrideAllIds, defaultAllIds, byId]);

  // If a restored order becomes invalid (e.g., no words in current stage),
  // fall back to the freshly computed default order so remaining new cards appear.
  useEffect(() => {
    if (overrideAllIds && allIds.length === 0 && defaultAllIds.length > 0) {
      setOverrideAllIds(null);
    }
  }, [overrideAllIds, allIds.length, defaultAllIds.length]);

  const slicesCount = useMemo(
    () => Math.ceil(allIds.length / Math.max(1, config.slice_length)),
    [allIds.length, config.slice_length]
  );
  const currentSliceNo = useMemo(
    () =>
      allIds.length === 0
        ? 0
        : Math.floor(testState.wordIndex / Math.max(1, config.slice_length)) +
          1,
    [testState.wordIndex, allIds.length, config.slice_length]
  );

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [finishMessage, setFinishMessage] = useState(
    "完成！本次有作答的單字已 +1。返回首頁？"
  );
  const [showQueues, setShowQueues] = useState(false);
  const [showLocalSettings, setShowLocalSettings] = useState(false);
  const [draftConfig, setDraftConfig] = useState(defaultConfig);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // switch stage helper (reset state and re-attempt restore)
  const switchStage = useCallback(
    (nextStage) => {
      updateTestState({
        stage: nextStage,
        restored: false,
        attemptedRestore: false,
        round: 0,
        wordIndex: 0,
        sliceIds: [],
        currentQueue: [],
        queueIdx: 0,
        memorySet: new Set(),
        visitedSet: new Set(),
        isAnswerVisible: false,
        sessionDone: false,
      });
      setOverrideAllIds(null);
    },
    [updateTestState]
  );

  const handleClearAllStudy = useCallback(async () => {
    if (!currentNotebookId || !currentNotebook) return;
    try {
      setClearing(true);
      for (const w of currentNotebook.context || []) {
        if (!w || !w.id || !w.jp_word) continue;
        await notebookService.updateWordInNotebook(currentNotebookId, w.id, {
          studied: 0,
        });
        dispatch(
          updateWordInNotebook(currentNotebookId, w.id, {
            studied: 0,
          })
        );
      }
      // Also clear persisted WordTest progress
      try {
        notebookService.updateNotebookWordTest(currentNotebookId, null);
      } catch (_) {}
    } catch (e) {
      console.error("清除進度失敗", e);
    } finally {
      setClearing(false);
      setShowClearConfirm(false);
    }
  }, [currentNotebookId, currentNotebook, dispatch]);

  const loadSlice = useCallback(
    (startIdx, idsOrder = allIds) => {
      const start = Math.max(0, startIdx);
      const end = Math.min(
        idsOrder.length,
        start + Math.max(1, config.slice_length)
      );
      const ids = Array.from(new Set(idsOrder.slice(start, end)));
      updateTestState({
        sliceIds: ids,
        memorySet: new Set(),
        currentQueue: shuffleArray(ids),
        queueIdx: 0,
      });
    },
    [allIds, config.slice_length, updateTestState]
  );

  useEffect(() => {
    if (!testState.attemptedRestore) return; // wait until restore attempt completes
    if (testState.restored) return; // skip auto-reset if we've restored a session
    updateTestState({
      round: 0,
      wordIndex: 0,
      visitedSet: new Set(),
    });
    loadSlice(0, allIds);
  }, [
    allIds,
    loadSlice,
    testState.restored,
    testState.attemptedRestore,
    updateTestState,
  ]);

  useEffect(() => {
    if (
      allIds.length > 0 &&
      testState.sliceIds.length === 0 &&
      testState.currentQueue.length === 0
    ) {
      loadSlice(0, allIds);
    }
  }, [
    allIds,
    testState.sliceIds.length,
    testState.currentQueue.length,
    loadSlice,
  ]);

  const currentId = testState.currentQueue[testState.queueIdx];
  const currentWord = byId.get(currentId);

  const { playSequence } = useAnswerPlayback({
    result: null,
    question: currentWord,
    onNext: () => {},
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

  // Auto play the question word when a new item appears
  useEffect(() => {
    if (!currentWord || !currentWord.jp_word) return;
    speakManually(currentWord.jp_word, "ja");
  }, [currentId]);

  const onRemember = useCallback(() => {
    if (!currentId) return;

    const newVisitedSet = new Set(testState.visitedSet).add(currentId);
    let newMemorySet = new Set(testState.memorySet);
    let newWrongSet = new Set(testState.wrongSet);

    if (testState.stage === "new" || testState.stage === "review") {
      newMemorySet.add(currentId);
    } else if (testState.stage === "wrong") {
      // mark learned and remove from wrong set
      newMemorySet.add(currentId);
      newWrongSet.delete(currentId);
    }

    updateTestState({
      isAnswerVisible: false,
      visitedSet: newVisitedSet,
      memorySet: newMemorySet,
      wrongSet: newWrongSet,
      queueIdx: testState.queueIdx + 1,
    });
  }, [currentId, testState, updateTestState]);

  const onNotYet = useCallback(() => {
    if (!currentId) return;

    const newVisitedSet = new Set(testState.visitedSet).add(currentId);
    let newWrongSet = new Set(testState.wrongSet);

    if (testState.stage === "test") {
      newWrongSet.add(currentId);
    }

    updateTestState({
      isAnswerVisible: false,
      visitedSet: newVisitedSet,
      wrongSet: newWrongSet,
      queueIdx: testState.queueIdx + 1,
    });
  }, [currentId, testState, updateTestState]);

  // After revealing the answer, speak according to settings (same as Reading page)
  useEffect(() => {
    if (!testState.isAnswerVisible) return;
    if (!currentWord) return;
    playSequence(null, currentWord, playbackOptions, { skipSound: true });
  }, [
    testState.isAnswerVisible,
    currentId,
    currentWord,
    playSequence,
    playbackOptions,
  ]);

  useEffect(() => {
    // Stop any further progression once the session is finished
    if (testState.sessionDone) return;
    if (testState.queueIdx < testState.currentQueue.length) return;
    if (testState.currentQueue.length === 0 && testState.sliceIds.length === 0)
      return;

    if (testState.stage === "test") {
      // Present each exactly once; go to next slice or switch to wrong/finish
      const hasNextSlice =
        testState.wordIndex + config.slice_length < allIds.length;
      if (hasNextSlice) {
        const nextStart = testState.wordIndex + config.slice_length;
        updateTestState({ wordIndex: nextStart });
        loadSlice(nextStart, allIds);
      } else {
        if (testState.wrongSet.size > 0) {
          // move to wrong practice
          switchStage("wrong");
        } else {
          updateTestState({
            sessionDone: true,
            sliceIds: [],
            currentQueue: [],
            queueIdx: 0,
          });
          setFinishMessage("測試完成！全部記住了。返回首頁？");
          setShowFinishModal(true);
        }
      }
      return;
    }

    // Wrong practice: repeat until all wrong remembered; then finish
    if (testState.stage === "wrong") {
      const allCoveredWrong = testState.sliceIds.every((id) =>
        testState.memorySet.has(id)
      );
      if (allCoveredWrong) {
        const hasNextSlice =
          testState.wordIndex + config.slice_length < allIds.length;
        if (hasNextSlice) {
          const nextStart = testState.wordIndex + config.slice_length;
          updateTestState({ wordIndex: nextStart });
          loadSlice(nextStart, allIds);
        } else {
          // If wrongSet still has items (shouldn't if remembered), just reshuffle remaining
          if (testState.wrongSet.size > 0) {
            const remaining = allIds.filter(
              (id) => !testState.memorySet.has(id)
            );
            if (remaining.length > 0) {
              updateTestState({
                sliceIds: remaining,
                currentQueue: remaining,
                queueIdx: 0,
              });
              return;
            }
          }
          updateTestState({
            sessionDone: true,
            sliceIds: [],
            currentQueue: [],
            queueIdx: 0,
          });
          setFinishMessage("錯題練習完成！測試全對。返回首頁？");
          setShowFinishModal(true);
        }
      } else {
        const pending = testState.sliceIds.filter(
          (id) => !testState.memorySet.has(id)
        );
        updateTestState({
          currentQueue: pending,
          queueIdx: 0,
        });
      }
      return;
    }

    const allCovered = testState.sliceIds.every((id) =>
      testState.memorySet.has(id)
    );
    if (allCovered) {
      const hasNextSlice =
        testState.wordIndex + config.slice_length < allIds.length;
      if (hasNextSlice) {
        const nextStart = testState.wordIndex + config.slice_length;
        updateTestState({ wordIndex: nextStart });
        loadSlice(nextStart, allIds);
      } else {
        const nextRound = testState.round + 1;
        updateTestState({ round: nextRound });
        if (nextRound >= config.round_count) {
          // Mark as finished and clear queues to avoid the effect firing again
          updateTestState({
            sessionDone: true,
            sliceIds: [],
            currentQueue: [],
            queueIdx: 0,
          });
          (async () => {
            try {
              const nbId = currentNotebookId;
              for (const id of Array.from(testState.visitedSet)) {
                const word = byId.get(id);
                if (!word) continue;
                const base = getStudyValue(word);
                const newStudy = base + 1;
                const nowTs = Date.now();
                await notebookService.updateWordInNotebook(nbId, id, {
                  studied: newStudy,
                  lastStudyTime: nowTs,
                });
                dispatch(
                  updateWordInNotebook(nbId, id, {
                    studied: newStudy,
                    lastStudyTime: nowTs,
                  })
                );
              }
              // add visited words to session pool for Stage 3 testing
              const newSessionPool = new Set(testState.sessionPool);
              for (const id of Array.from(testState.visitedSet))
                newSessionPool.add(id);
              updateTestState({ sessionPool: newSessionPool });

              setFinishMessage("完成！本次有作答的單字已 +1。返回首頁？");
              setShowFinishModal(true);
            } catch (e) {
              console.error("更新 studied 失敗", e);
              setShowFinishModal(true);
            }
          })();
        } else {
          const reshuffled = shuffleArray(allIds);
          // Ensure the entire new round uses the same order for all slices
          setOverrideAllIds(reshuffled);
          updateTestState({
            wordIndex: 0,
            sliceIds: [],
            currentQueue: [],
            queueIdx: 0,
            memorySet: new Set(),
          });
          setTimeout(() => loadSlice(0, reshuffled), 0);
        }
      }
      return;
    }

    const pending = testState.sliceIds.filter(
      (id) => !testState.memorySet.has(id)
    );
    updateTestState({
      currentQueue: pending,
      queueIdx: 0,
    });
  }, [
    testState.queueIdx,
    testState.currentQueue.length,
    testState.sliceIds,
    testState.memorySet,
    testState.wordIndex,
    allIds,
    config.slice_length,
    testState.round,
    config.round_count,
    currentNotebookId,
    byId,
    dispatch,
    loadSlice,
    testState.visitedSet,
    testState.sessionDone,
    testState.stage,
    testState.wrongSet,
    switchStage,
    updateTestState,
  ]);

  const progressText = useMemo(() => {
    const inSliceTotal = testState.sliceIds.length;
    const inSliceDone = Math.min(testState.queueIdx, inSliceTotal);
    return `第 ${currentSliceNo}/${slicesCount} 片 · 題目 ${inSliceDone}/${inSliceTotal} · 輪次 ${
      testState.round + 1
    }/${config.round_count}`;
  }, [
    testState.queueIdx,
    testState.sliceIds.length,
    currentSliceNo,
    slicesCount,
    testState.round,
    config.round_count,
  ]);

  const confirmExit = useCallback(() => setShowExitConfirm(true), []);
  const handleExit = useCallback(() => {
    setShowExitConfirm(false);
    navigate("/");
  }, [navigate]);

  const handleFinishAndExit = useCallback(() => {
    try {
      if (currentNotebookId) {
        // Clear the saved progress after a completed session
        notebookService.updateNotebookWordTest(currentNotebookId, null);
      }
    } catch (_) {}
    setShowFinishModal(false);
    navigate("/");
  }, [currentNotebookId, navigate]);

  // Attempt to restore saved WordTest progress from the notebook
  useEffect(() => {
    if (!currentNotebookId) return;
    if (testState.attemptedRestore || testState.restored) return;
    try {
      const nb = notebookService.getNotebook(currentNotebookId);
      const saved = nb && nb.word_test;
      if (!saved || typeof saved !== "object") {
        updateTestState({ attemptedRestore: true });
        return;
      }
      if (saved.schemaVersion !== 4) {
        // 舊版本格式，清理後重新開始
        try {
          notebookService.updateNotebookWordTest(currentNotebookId, null);
        } catch (_) {}
        updateTestState({ attemptedRestore: true });
        return;
      }
      const savedStage = saved.stage || "new";
      if (savedStage !== testState.stage) {
        updateTestState({ attemptedRestore: true });
        return;
      }

      // 恢復配置和順序
      if (saved.config) setConfig(saved.config);
      if (Array.isArray(saved.allIds) && saved.allIds.length > 0) {
        setOverrideAllIds(saved.allIds);
      }

      // 恢復狀態
      updateTestState({
        sessionPool: new Set(saved.sessionPool || []),
        wrongSet: new Set(saved.wrongSet || []),
        round: saved.round || 0,
        wordIndex: saved.wordIndex || 0,
        sliceIds: saved.sliceIds || [],
        currentQueue: saved.currentQueue || [],
        queueIdx: saved.queueIdx || 0,
        memorySet: new Set(saved.memorySet || []),
        visitedSet: new Set(saved.visitedSet || []),
        showHiragana: !!saved.showHiragana,
        isAnswerVisible: !!saved.isAnswerVisible,
        restored: true,
        attemptedRestore: true,
      });
    } catch (e) {
      console.warn("Failed to restore word test state:", e);
      updateTestState({ attemptedRestore: true });
    }
  }, [
    currentNotebookId,
    testState.attemptedRestore,
    testState.restored,
    testState.stage,
    updateTestState,
  ]);

  // 自動保存功能已經整合到 updateTestState 中，移除舊的自動保存邏輯

  if (!currentNotebookId || !currentNotebook) {
    return (
      <AppContainer>
        <BackPage onClick={() => navigate("/")}>🏠</BackPage>
        <Title>單字挑戰</Title>
        <div>尚未選擇筆記本。</div>
      </AppContainer>
    );
  }

  if (allIds.length === 0) {
    return (
      <AppContainer>
        <IconContainer>
          <IconGroup>
            <SettingsToggle onClick={() => setShowSettings((s) => !s)}>
              ⚙️
            </SettingsToggle>
            <HomeIcon onClick={() => setShowExitConfirm(true)}>↩️</HomeIcon>
            <LogToggle onClick={() => setShowQueues((v) => !v)}>🧾</LogToggle>
            <InfoToggle onClick={() => setShowQueues((v) => !v)}>ℹ️</InfoToggle>
            <BackPage onClick={() => navigate("/")}>🏠</BackPage>
          </IconGroup>
        </IconContainer>
        <Title>單字挑戰</Title>
        <StageToggleWrap>
          <StageBtn
            active={testState.stage === "new"}
            onClick={() => switchStage("new")}
          >
            新卡
          </StageBtn>
          <StageBtn
            active={testState.stage === "review"}
            onClick={() => switchStage("review")}
          >
            複習
          </StageBtn>
          <StageBtn
            active={testState.stage === "test"}
            onClick={() => switchStage("test")}
          >
            測試
          </StageBtn>
          <StageBtn
            active={testState.stage === "wrong"}
            onClick={() => switchStage("wrong")}
          >
            錯題
          </StageBtn>
        </StageToggleWrap>
        <div>
          {testState.stage === "new"
            ? "沒有可學的新卡（studied == 0）。請到「筆記本」匯入或調整資料。"
            : testState.stage === "review"
            ? "沒有可複習的單字（studied > 0）。"
            : testState.stage === "test"
            ? "沒有可測試的單字（需先完成新卡或複習）。"
            : "沒有需要練習的錯題。"}
        </div>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <IconContainer>
        <IconGroup>
          <SettingsToggle
            onClick={() => {
              setDraftConfig(config);
              setShowSettings((s) => !s);
            }}
          >
            ⚙️
          </SettingsToggle>
          <HomeIcon onClick={confirmExit}>↩️</HomeIcon>
          <LogToggle onClick={() => setShowQueues((v) => !v)}>🧾</LogToggle>
          <InfoToggle onClick={() => setShowQueues((v) => !v)}>ℹ️</InfoToggle>
          <BackPage onClick={() => navigate("/")}>🏠</BackPage>
        </IconGroup>
      </IconContainer>
      <Title>單字練習</Title>
      <StageToggleWrap>
        <StageBtn
          active={testState.stage === "new"}
          onClick={() => switchStage("new")}
        >
          新卡
        </StageBtn>
        <StageBtn
          active={testState.stage === "review"}
          onClick={() => switchStage("review")}
        >
          複習
        </StageBtn>
        <StageBtn
          active={testState.stage === "test"}
          onClick={() => switchStage("test")}
        >
          測試
        </StageBtn>
        <StageBtn
          active={testState.stage === "wrong"}
          onClick={() => switchStage("wrong")}
        >
          錯題
        </StageBtn>
      </StageToggleWrap>
      <Progress>{progressText}</Progress>

      {/* 錄音模組（置於卡片外左上，與 FillIn 一致） */}
      <div style={{ display: "flex", justifyContent: "flex-start" }}>
        <AudioRecorderPage triggerReset={currentId} />
      </div>

      {currentWord ? (
        <CardContainer
          onClick={() =>
            !testState.isAnswerVisible &&
            updateTestState({ isAnswerVisible: true })
          }
        >
          {wordType === "jp_word" && (
            <>
              <HiraganaToggleContainer>
                <ToggleButton
                  onClick={() =>
                    updateTestState({ showHiragana: !testState.showHiragana })
                  }
                >
                  {testState.showHiragana ? "🔽漢" : "▶️漢"}
                </ToggleButton>
              </HiraganaToggleContainer>
              {testState.showHiragana && (
                <HiraganaTextContainer>
                  <HiraganaText>{currentWord.kanji_jp_word}</HiraganaText>
                </HiraganaTextContainer>
              )}
            </>
          )}

          {currentWord.kanji_jp_word && wordType === "kanji_jp_word" && (
            <>
              <HiraganaToggleContainer>
                <ToggleButton
                  onClick={() =>
                    updateTestState({ showHiragana: !testState.showHiragana })
                  }
                >
                  {testState.showHiragana ? "🔽平/片" : "▶️平/片"}
                </ToggleButton>
              </HiraganaToggleContainer>
              {testState.showHiragana && (
                <HiraganaTextContainer>
                  <HiraganaText>{currentWord.jp_word}</HiraganaText>
                </HiraganaTextContainer>
              )}
            </>
          )}

          <WordContainer>
            {wordType === "kanji_jp_word" && (
              <span>{currentWord.kanji_jp_word || currentWord.jp_word}</span>
            )}
            {wordType === "jp_word" && <span>{currentWord.jp_word}</span>}
            {wordType === "jp_context" && (
              <span>
                {(currentWord.jp_context || []).map((part, index) =>
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
            <SpeakButton
              onClick={(e) => {
                e.stopPropagation();
                speakManually(currentWord.jp_word, "ja");
              }}
            >
              🔊
            </SpeakButton>
          </WordContainer>

          {testState.isAnswerVisible && (
            <ResultContainer>
              <SubCard>
                <AnswerText correct>
                  {currentWord.ch_word} [{currentWord.type}]
                </AnswerText>
              </SubCard>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <ProficiencyButton
                  className={currentWord.word_bug ? "active" : ""}
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      const newVal = !currentWord.word_bug;
                      // optimistic UI: update local selectedNotebook cache word if available
                      // Note: WordTest maintains its own state; we keep minimal local optimism by dispatching first
                      dispatch(
                        updateWordInNotebook(currentNotebookId, currentId, {
                          word_bug: newVal,
                        })
                      );
                      await notebookService.updateWordInNotebook(
                        currentNotebookId,
                        currentId,
                        { word_bug: newVal }
                      );
                    } catch (e) {
                      console.error("toggle bug flag failed", e);
                      // revert on failure
                      dispatch(
                        updateWordInNotebook(currentNotebookId, currentId, {
                          word_bug: currentWord.word_bug,
                        })
                      );
                    }
                  }}
                  title="標記為錯誤/取消"
                >
                  錯
                </ProficiencyButton>
              </div>
              <ExampleSentence
                jp_ex={currentWord.jp_ex_statement}
                ch_ex={currentWord.ch_ex_statement}
                speak={speakManually}
                jp_ex_context={currentWord.jp_ex_statement_context}
              />

              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <NextButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onNotYet();
                  }}
                  style={{ borderColor: "#ccc" }}
                >
                  還沒記住
                </NextButton>
                <NextButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemember();
                  }}
                >
                  記住了
                </NextButton>
              </div>
            </ResultContainer>
          )}
        </CardContainer>
      ) : (
        <GameBox>
          <div>片尾處理中…</div>
        </GameBox>
      )}

      {showQueues && (
        <PanelGrid>
          <Panel>
            <PanelTitle>current_queue（剩餘）</PanelTitle>
            <List>
              {testState.currentQueue.slice(testState.queueIdx).map((id) => {
                const w = byId.get(id);
                return (
                  <ListItem key={id}>
                    {w ? `${w.jp_word} — ${w.ch_word}` : id}
                  </ListItem>
                );
              })}
            </List>
          </Panel>
          <Panel>
            <PanelTitle>memory_queue（已記住，本片）</PanelTitle>
            <List>
              {testState.sliceIds
                .filter((id) => testState.memorySet.has(id))
                .map((id) => {
                  const w = byId.get(id);
                  return (
                    <ListItem key={id}>
                      {w ? `${w.jp_word} — ${w.ch_word}` : id}
                    </ListItem>
                  );
                })}
            </List>
          </Panel>
        </PanelGrid>
      )}

      {(showSettings || showLocalSettings) && (
        <>
          <Overlay
            onClick={() => {
              setShowSettings(false);
              setShowLocalSettings(false);
            }}
          />
          <FloatingSettingsPanel>
            <div style={{ padding: 12 }}>
              <SettingsPanel
                context="wordtest"
                wordTestConfig={draftConfig}
                onWordTestConfigChange={(cfg) => setDraftConfig(cfg)}
              />
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 12,
                  justifyContent: "flex-end",
                }}
              >
                <Btn
                  onClick={() => setShowClearConfirm(true)}
                  style={{
                    background: "#fff0f0",
                    color: "#b00020",
                    borderColor: "#f3c2c2",
                  }}
                >
                  清除整本進度（studied → 0）
                </Btn>
                <Btn
                  onClick={() => {
                    setShowSettings(false);
                    setShowLocalSettings(false);
                  }}
                >
                  取消
                </Btn>
                <Btn
                  primary
                  onClick={() => {
                    setConfig(draftConfig);
                    updateTestState({
                      round: 0,
                      wordIndex: 0,
                      sliceIds: [],
                      currentQueue: [],
                      queueIdx: 0,
                      memorySet: new Set(),
                      visitedSet: new Set(),
                      sessionDone: false,
                    });
                    setOverrideAllIds(null); // recalc order for new settings
                    setTimeout(() => {
                      const start = 0;
                      const end = Math.min(
                        (overrideAllIds || defaultAllIds).length,
                        start + Math.max(1, draftConfig.slice_length)
                      );
                      const sourceIds = overrideAllIds || defaultAllIds;
                      const ids = Array.from(
                        new Set(sourceIds.slice(start, end))
                      );
                      updateTestState({
                        sliceIds: ids,
                        memorySet: new Set(),
                        currentQueue: shuffleArray(ids),
                        queueIdx: 0,
                      });
                    }, 0);
                    setShowSettings(false);
                    setShowLocalSettings(false);
                  }}
                >
                  套用
                </Btn>
              </div>
            </div>
          </FloatingSettingsPanel>
        </>
      )}

      {showClearConfirm && (
        <>
          <Overlay onClick={() => setShowClearConfirm(false)} />
          <Modal
            message={
              clearing
                ? "清除中，請稍候…"
                : "確定要將此筆記本所有單字的 studied 歸零嗎？此動作不可還原。"
            }
            onConfirm={() => {
              if (!clearing) handleClearAllStudy();
            }}
            onCancel={() => {
              if (!clearing) setShowClearConfirm(false);
            }}
            isVisible
          />
        </>
      )}

      {showFinishModal && (
        <>
          <Overlay onClick={() => setShowFinishModal(false)} />
          <Modal
            message={finishMessage}
            onConfirm={handleFinishAndExit}
            onCancel={() => setShowFinishModal(false)}
            isVisible
          />
        </>
      )}

      {showExitConfirm && (
        <>
          <Overlay onClick={() => setShowExitConfirm(false)} />
          <Modal
            message="確定離開單字挑戰？未更新的進度將遺失。"
            onConfirm={handleExit}
            onCancel={() => setShowExitConfirm(false)}
            isVisible
          />
        </>
      )}
    </AppContainer>
  );
}
