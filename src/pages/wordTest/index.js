import React, { useEffect, useMemo, useState, useCallback } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  AppContainer,
  Title,
  Progress,
  BackPage,
  SettingsToggle,
  Overlay,
  FloatingSettingsPanel,
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
} from "../Reading/components/ReadingCard/styles";
import ExampleSentence from "../Reading/components/ExampleSentence";

const defaultConfig = {
  slice_length: 5,
  max_word_study: 20,
  sort_type: "normal", // normal | asc
  round_count: 1,
};

const GameBox = styled.div`
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 16px;
  margin-top: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
`;

const Btn = styled.button`
  padding: 10px 14px;
  border: 1px solid #ddd;
  background: ${(p) => (p.primary ? "#4caf50" : "#f7f7f7")};
  color: ${(p) => (p.primary ? "#fff" : "#333")};
  border-radius: 8px;
  cursor: pointer;
  min-width: 120px;
  &:hover {
    filter: brightness(0.98);
  }
`;

const Bar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PanelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.div`
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 10px;
`;

const PanelTitle = styled.div`
  font-weight: 600;
  color: #444;
  margin-bottom: 8px;
`;

const List = styled.ul`
  margin: 0;
  padding-left: 18px;
  max-height: 180px;
  overflow: auto;
`;

const ListItem = styled.li`
  color: #333;
  margin: 2px 0;
`;

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

export default function WordTest() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { notebooks, currentNotebookId } = state.shared;
  const { playbackOptions, playbackSpeed, wordType } = state.systemSettings;

  const [config, setConfig] = useState(defaultConfig);

  const currentNotebook = useMemo(
    () => notebooks.find((n) => n.id === currentNotebookId),
    [notebooks, currentNotebookId]
  );

  const eligibleWords = useMemo(() => {
    const ctx =
      currentNotebook && Array.isArray(currentNotebook.context)
        ? currentNotebook.context
        : [];
    const filtered = ctx.filter((w) => {
      if (!w || !w.jp_word) return false;
      const s =
        typeof w.studyted === "number"
          ? w.studyted
          : typeof w.studyed === "number"
          ? w.studyed
          : 0;
      return s === 0;
    });
    return filtered.slice(0, Math.max(0, config.max_word_study));
  }, [currentNotebook, config.max_word_study]);

  const initialOrderedWords = useMemo(() => {
    return sortWords(eligibleWords, config.sort_type);
  }, [eligibleWords, config.sort_type]);

  const byId = useMemo(
    () => new Map(initialOrderedWords.map((w) => [w.id, w])),
    [initialOrderedWords]
  );
  const allIds = useMemo(
    () => initialOrderedWords.map((w) => w.id),
    [initialOrderedWords]
  );

  const [round, setRound] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const slicesCount = useMemo(
    () => Math.ceil(allIds.length / Math.max(1, config.slice_length)),
    [allIds.length, config.slice_length]
  );
  const currentSliceNo = useMemo(
    () =>
      allIds.length === 0
        ? 0
        : Math.floor(wordIndex / Math.max(1, config.slice_length)) + 1,
    [wordIndex, allIds.length, config.slice_length]
  );

  const [sliceIds, setSliceIds] = useState([]);
  const [currentQueue, setCurrentQueue] = useState([]);
  const [queueIdx, setQueueIdx] = useState(0);
  const [memorySet, setMemorySet] = useState(() => new Set());
  const [visitedSet, setVisitedSet] = useState(() => new Set());

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showQueues, setShowQueues] = useState(true);
  const [showLocalSettings, setShowLocalSettings] = useState(false);
  const [draftConfig, setDraftConfig] = useState(defaultConfig);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showHiragana, setShowHiragana] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);

  const handleClearAllStudy = useCallback(async () => {
    if (!currentNotebookId || !currentNotebook) return;
    try {
      setClearing(true);
      for (const w of currentNotebook.context || []) {
        if (!w || !w.id || !w.jp_word) continue;
        await notebookService.updateWordInNotebook(currentNotebookId, w.id, {
          studyted: 0,
        });
        dispatch(
          updateWordInNotebook(currentNotebookId, w.id, { studyted: 0 })
        );
      }
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
      const ids = idsOrder.slice(start, end);
      setSliceIds(ids);
      setMemorySet(new Set());
      setCurrentQueue(shuffleArray(ids));
      setQueueIdx(0);
    },
    [allIds, config.slice_length]
  );

  useEffect(() => {
    setRound(0);
    setWordIndex(0);
    setVisitedSet(new Set());
    loadSlice(0, allIds);
  }, [allIds, loadSlice]);

  useEffect(() => {
    if (
      allIds.length > 0 &&
      sliceIds.length === 0 &&
      currentQueue.length === 0
    ) {
      loadSlice(0, allIds);
    }
  }, [allIds, sliceIds.length, currentQueue.length, loadSlice]);

  const currentId = currentQueue[queueIdx];
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

  const onRemember = useCallback(() => {
    if (!currentId) return;
    setIsAnswerVisible(false);
    setVisitedSet((prev) => new Set(prev).add(currentId));
    setMemorySet((prev) => new Set(prev).add(currentId));
    setQueueIdx((i) => i + 1);
  }, [currentId]);

  const onNotYet = useCallback(() => {
    if (!currentId) return;
    setIsAnswerVisible(false);
    setVisitedSet((prev) => new Set(prev).add(currentId));
    setQueueIdx((i) => i + 1);
  }, [currentId]);

  useEffect(() => {
    if (queueIdx < currentQueue.length) return;
    if (currentQueue.length === 0 && sliceIds.length === 0) return;

    const allCovered = sliceIds.every((id) => memorySet.has(id));
    if (allCovered) {
      const hasNextSlice = wordIndex + config.slice_length < allIds.length;
      if (hasNextSlice) {
        const nextStart = wordIndex + config.slice_length;
        setWordIndex(nextStart);
        loadSlice(nextStart, allIds);
      } else {
        const nextRound = round + 1;
        setRound(nextRound);
        if (nextRound >= config.round_count) {
          (async () => {
            try {
              const nbId = currentNotebookId;
              for (const id of Array.from(visitedSet)) {
                const word = byId.get(id);
                if (!word) continue;
                const base =
                  typeof word.studyted === "number"
                    ? word.studyted
                    : typeof word.studyed === "number"
                    ? word.studyed
                    : 0;
                const newStudy = base + 1;
                await notebookService.updateWordInNotebook(nbId, id, {
                  studyted: newStudy,
                });
                dispatch(
                  updateWordInNotebook(nbId, id, { studyted: newStudy })
                );
              }
              setShowFinishModal(true);
            } catch (e) {
              console.error("更新 studyted 失敗", e);
              setShowFinishModal(true);
            }
          })();
        } else {
          const reshuffled = shuffleArray(allIds);
          setWordIndex(0);
          setSliceIds([]);
          setCurrentQueue([]);
          setQueueIdx(0);
          setMemorySet(new Set());
          setTimeout(() => loadSlice(0, reshuffled), 0);
        }
      }
      return;
    }

    const pending = sliceIds.filter((id) => !memorySet.has(id));
    setCurrentQueue(pending);
    setQueueIdx(0);
  }, [
    queueIdx,
    currentQueue.length,
    sliceIds,
    memorySet,
    wordIndex,
    allIds,
    config.slice_length,
    round,
    config.round_count,
    currentNotebookId,
    byId,
    dispatch,
    loadSlice,
    visitedSet,
  ]);

  const progressText = useMemo(() => {
    const inSliceTotal = sliceIds.length;
    const inSliceDone = Math.min(queueIdx, inSliceTotal);
    return `第 ${currentSliceNo}/${slicesCount} 片 · 題目 ${inSliceDone}/${inSliceTotal} · 輪次 ${
      round + 1
    }/${config.round_count}`;
  }, [
    queueIdx,
    sliceIds.length,
    currentSliceNo,
    slicesCount,
    round,
    config.round_count,
  ]);

  const confirmExit = useCallback(() => setShowExitConfirm(true), []);
  const handleExit = useCallback(() => {
    setShowExitConfirm(false);
    navigate("/");
  }, [navigate]);

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
        <BackPage onClick={() => navigate("/")}>🏠</BackPage>
        <Title>單字挑戰</Title>
        <div>
          沒有可學的新卡（studyted == 0）。請到「筆記本」匯入或調整資料。
        </div>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <Bar>
        <BackPage onClick={confirmExit}>↩️</BackPage>
        <div style={{ display: "flex", gap: 8 }}>
          <SettingsToggle onClick={() => setShowQueues((v) => !v)}>
            🧾
          </SettingsToggle>
          <SettingsToggle
            onClick={() => {
              setDraftConfig(config);
              setShowSettings((s) => !s);
            }}
          >
            ⚙️
          </SettingsToggle>
        </div>
      </Bar>
      <Title>單字練習</Title>
      <Progress>{progressText}</Progress>

      {currentWord ? (
        <CardContainer
          onClick={() => !isAnswerVisible && setIsAnswerVisible(true)}
        >
          {wordType === "jp_word" && (
            <>
              <HiraganaToggleContainer>
                <ToggleButton onClick={() => setShowHiragana((v) => !v)}>
                  {showHiragana ? "🔽漢" : "▶️漢"}
                </ToggleButton>
              </HiraganaToggleContainer>
              {showHiragana && (
                <HiraganaTextContainer>
                  <HiraganaText>{currentWord.kanji_jp_word}</HiraganaText>
                </HiraganaTextContainer>
              )}
            </>
          )}

          {currentWord.kanji_jp_word && wordType === "kanji_jp_word" && (
            <>
              <HiraganaToggleContainer>
                <ToggleButton onClick={() => setShowHiragana((v) => !v)}>
                  {showHiragana ? "🔽平/片" : "▶️平/片"}
                </ToggleButton>
              </HiraganaToggleContainer>
              {showHiragana && (
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
              onClick={() => speakManually(currentWord.jp_word, "ja")}
            >
              🔊
            </SpeakButton>
          </WordContainer>

          {isAnswerVisible && (
            <ResultContainer>
              <SubCard>
                <AnswerText correct>
                  {currentWord.ch_word} [{currentWord.type}]
                </AnswerText>
              </SubCard>
              <ExampleSentence
                jp_ex={currentWord.jp_ex_statement}
                ch_ex={currentWord.ch_ex_statement}
                speak={speakManually}
                jp_ex_context={currentWord.jp_ex_statement_context}
                wordType={wordType}
              />

              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <NextButton onClick={onNotYet} style={{ borderColor: "#ccc" }}>
                  還沒記住
                </NextButton>
                <NextButton onClick={onRemember}>記住</NextButton>
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
              {currentQueue.slice(queueIdx).map((id) => {
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
              {sliceIds
                .filter((id) => memorySet.has(id))
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
                  清除整本進度（studyted → 0）
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
                    setRound(0);
                    setWordIndex(0);
                    setSliceIds([]);
                    setCurrentQueue([]);
                    setQueueIdx(0);
                    setMemorySet(new Set());
                    setVisitedSet(new Set());
                    setTimeout(() => {
                      const start = 0;
                      const end = Math.min(
                        allIds.length,
                        start + Math.max(1, draftConfig.slice_length)
                      );
                      const ids = allIds.slice(start, end);
                      setSliceIds(ids);
                      setMemorySet(new Set());
                      setCurrentQueue(shuffleArray(ids));
                      setQueueIdx(0);
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
                : "確定要將此筆記本所有單字的 studyted 歸零嗎？此動作不可還原。"
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
            message="完成！本次有作答的單字已 +1。返回首頁？"
            onConfirm={handleExit}
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
