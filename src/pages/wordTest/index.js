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

// 可開放給使用者調整的預設參數（此版先內建，後續可接到 SettingsPanel）
const defaultConfig = {
  slice_length: 5,
  max_word_study: 20,
  sort_type: "normal", // normal | asc
  round_count: 1,
};

// UI
const GameBox = styled.div`
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 16px;
  margin-top: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
`;

const WordBlock = styled.div`
  font-size: 1.4rem;
  line-height: 1.6;
  margin: 12px 0 16px;
  text-align: center;
`;

const BtnRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 12px;
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

// 根據 sort_type 產生排序後的清單（輸入 words 陣列，輸出同長度陣列）
function sortWords(words, sortType) {
  if (sortType === "asc") {
    // 依 jp_word 長度分組，每組內隨機，之後由短到長串接
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
  // normal: 全體隨機
  return shuffleArray(words);
}

export default function WordTest() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { notebooks, currentNotebookId } = state.shared;

  // 參數（此版採用預設，可之後改為來自 Settings）
  const [config, setConfig] = useState(defaultConfig);

  // 來源：當前 Notebook 的 context
  const currentNotebook = useMemo(
    () => notebooks.find((n) => n.id === currentNotebookId),
    [notebooks, currentNotebookId]
  );

  // 依規格篩選：studyted == 0 或沒有 studyted 的單字，按原 notebook 順序取前 max_word_study
  const eligibleWords = useMemo(() => {
    const ctx =
      currentNotebook && Array.isArray(currentNotebook.context)
        ? currentNotebook.context
        : [];
    const filtered = ctx.filter((w) => {
      if (!w || !w.jp_word) return false;
      // 兼容舊欄位 studyed，寫入時以 studyted 為主
      const s =
        typeof w.studyted === "number"
          ? w.studyted
          : typeof w.studyed === "number"
          ? w.studyed
          : 0;
      return s === 0; // 無屬性視為 0
    });
    return filtered.slice(0, Math.max(0, config.max_word_study));
  }, [currentNotebook, config.max_word_study]);

  // 初始排序（normal: 隨機；asc: 分組）
  const initialOrderedWords = useMemo(() => {
    return sortWords(eligibleWords, config.sort_type);
  }, [eligibleWords, config.sort_type]);

  // 快速索引
  const byId = useMemo(
    () => new Map(initialOrderedWords.map((w) => [w.id, w])),
    [initialOrderedWords]
  );
  const allIds = useMemo(
    () => initialOrderedWords.map((w) => w.id),
    [initialOrderedWords]
  );

  // 遊戲全域狀態
  const [round, setRound] = useState(0); // 0-based
  const [wordIndex, setWordIndex] = useState(0); // 當前切片起始索引（0-based）
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

  // 切片狀態
  const [sliceIds, setSliceIds] = useState([]); // 本片 id 集
  const [currentQueue, setCurrentQueue] = useState([]); // 目前跑的佇列（id 陣列）
  const [queueIdx, setQueueIdx] = useState(0); // 目前在 currentQueue 的位置
  const [memorySet, setMemorySet] = useState(() => new Set()); // 已記住的 id 集
  const [visitedSet, setVisitedSet] = useState(() => new Set()); // 本次實際作答過的 id 集

  // UI 狀態
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showQueues, setShowQueues] = useState(true);
  const [showLocalSettings, setShowLocalSettings] = useState(false);
  const [draftConfig, setDraftConfig] = useState(defaultConfig);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleClearAllStudy = useCallback(async () => {
    if (!currentNotebookId || !currentNotebook) return;
    try {
      setClearing(true);
      // 僅對有 jp_word 的詞條重置 studyted
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

  // 初始化或切片變更時載入切片
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
      setCurrentQueue(shuffleArray(ids)); // 每片初次載入時隨機
      setQueueIdx(0);
    },
    [allIds, config.slice_length]
  );

  // 首次與依賴變更
  useEffect(() => {
    setRound(0);
    setWordIndex(0);
    setVisitedSet(new Set());
    loadSlice(0, allIds);
  }, [allIds, loadSlice]);

  const currentId = currentQueue[queueIdx];
  const currentWord = byId.get(currentId);

  const onRemember = useCallback(() => {
    if (!currentId) return;
    setVisitedSet((prev) => new Set(prev).add(currentId));
    setMemorySet((prev) => new Set(prev).add(currentId));
    setQueueIdx((i) => i + 1);
  }, [currentId]);

  const onNotYet = useCallback(() => {
    if (!currentId) return;
    setVisitedSet((prev) => new Set(prev).add(currentId));
    setQueueIdx((i) => i + 1);
  }, [currentId]);

  // 佇列走完時的片尾檢查
  useEffect(() => {
    if (queueIdx < currentQueue.length) return; // 尚未走完
    if (currentQueue.length === 0 && sliceIds.length === 0) return; // 無資料

    const allCovered = sliceIds.every((id) => memorySet.has(id));
    if (allCovered) {
      // 本片通過
      const hasNextSlice = wordIndex + config.slice_length < allIds.length; // 注意不+1，避免漏題
      if (hasNextSlice) {
        const nextStart = wordIndex + config.slice_length;
        setWordIndex(nextStart);
        loadSlice(nextStart, allIds);
      } else {
        // 本輪所有切片完成 → 進入下一輪或結束
        const nextRound = round + 1;
        setRound(nextRound);
        if (nextRound >= config.round_count) {
          // 遊戲結束：僅針對本次有作答的題目（visitedSet）做 studyted +1 並提示完成
          (async () => {
            try {
              const nbId = currentNotebookId;
              // 批次更新整批選中單字
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
              setShowFinishModal(true); // 即使失敗也讓玩家結束流程
            }
          })();
        } else {
          // 重新一輪：依規格「全部重新一輪，將單字隨機排序」
          const reshuffled = shuffleArray(allIds);
          setWordIndex(0);
          // 重設片並從第一片開始
          setSliceIds([]);
          setCurrentQueue([]);
          setQueueIdx(0);
          setMemorySet(new Set());
          // 延遲到下一輪 render 再載入，確保使用最新順序
          setTimeout(() => loadSlice(0, reshuffled), 0);
        }
      }
      return;
    }

    // 尚未全部記住 → 把沒記住的重做
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
  ]);

  // 顯示資訊文字
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

  // 離開處理
  const confirmExit = useCallback(() => setShowExitConfirm(true), []);
  const handleExit = useCallback(() => {
    setShowExitConfirm(false);
    navigate("/");
  }, [navigate]);

  // 空資料處理
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
              setShowLocalSettings(true);
            }}
          >
            ⚙️
          </SettingsToggle>
        </div>
      </Bar>
      <Title>單字挑戰</Title>
      <Progress>{progressText}</Progress>

      <GameBox>
        {currentWord ? (
          <>
            <WordBlock>
              <div style={{ fontSize: "1.8rem", marginBottom: 4 }}>
                {currentWord.jp_word}
              </div>
              {currentWord.kanji_jp_word && (
                <div style={{ color: "#666", marginBottom: 6 }}>
                  {currentWord.kanji_jp_word}
                </div>
              )}
              <div style={{ color: "#333" }}>{currentWord.ch_word}</div>
            </WordBlock>

            <BtnRow>
              <Btn onClick={onNotYet}>還沒記住</Btn>
              <Btn primary onClick={onRemember}>
                記住
              </Btn>
            </BtnRow>
          </>
        ) : (
          <div>片尾處理中…</div>
        )}
      </GameBox>

      {/* 狀態面板：顯示 current_quene（剩餘）與 memory_quene，可切換顯示 */}
      {showQueues && (
        <PanelGrid>
          <Panel>
            <PanelTitle>
              current_quene（剩餘） ·{" "}
              {Math.max(0, currentQueue.length - queueIdx)}
            </PanelTitle>
            <List>
              {currentQueue.slice(queueIdx).map((id) => {
                const w = byId.get(id);
                if (!w) return null;
                const label = w.kanji_jp_word
                  ? `${w.jp_word}（${w.kanji_jp_word}）`
                  : w.jp_word;
                return (
                  <ListItem key={id}>
                    {label} · {w.ch_word}
                  </ListItem>
                );
              })}
            </List>
          </Panel>
          <Panel>
            <PanelTitle>memory_quene · {memorySet.size}</PanelTitle>
            <List>
              {Array.from(memorySet).map((id) => {
                const w = byId.get(id);
                if (!w) return null;
                const label = w.kanji_jp_word
                  ? `${w.jp_word}（${w.kanji_jp_word}）`
                  : w.jp_word;
                return (
                  <ListItem key={id}>
                    {label} · {w.ch_word}
                  </ListItem>
                );
              })}
            </List>
          </Panel>
        </PanelGrid>
      )}

      {showExitConfirm && (
        <>
          <Overlay onClick={() => setShowExitConfirm(false)} />
          <Modal
            message="確定要離開單字挑戰嗎？目前進度不會保存。"
            onConfirm={handleExit}
            onCancel={() => setShowExitConfirm(false)}
            isVisible
          />
        </>
      )}

      {showFinishModal && (
        <>
          <Overlay onClick={() => setShowFinishModal(false)} />
          <Modal
            message="恭喜完成！已將本輪所有單字的 studyted +1。"
            onConfirm={() => {
              setShowFinishModal(false);
              navigate("/");
            }}
            disableCancel
            isVisible
          />
        </>
      )}

      {showLocalSettings && (
        <>
          <Overlay onClick={() => setShowLocalSettings(false)} />
          <FloatingSettingsPanel>
            <div style={{ padding: 12 }}>
              <h3 style={{ marginTop: 0 }}>單字挑戰設定（僅此頁）</h3>
              <div style={{ display: "grid", gap: 10 }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <span>切片測試數量（slice_length）</span>
                  <input
                    type="number"
                    min={1}
                    value={draftConfig.slice_length}
                    onChange={(e) =>
                      setDraftConfig((d) => ({
                        ...d,
                        slice_length: Math.max(
                          1,
                          parseInt(e.target.value || "1", 10)
                        ),
                      }))
                    }
                  />
                </label>
                <label style={{ display: "grid", gap: 6 }}>
                  <span>要學習的單字上限（max_word_study）</span>
                  <input
                    type="number"
                    min={1}
                    value={draftConfig.max_word_study}
                    onChange={(e) =>
                      setDraftConfig((d) => ({
                        ...d,
                        max_word_study: Math.max(
                          1,
                          parseInt(e.target.value || "1", 10)
                        ),
                      }))
                    }
                  />
                </label>
                <label style={{ display: "grid", gap: 6 }}>
                  <span>題目排序方式（sort_type）</span>
                  <select
                    value={draftConfig.sort_type}
                    onChange={(e) =>
                      setDraftConfig((d) => ({
                        ...d,
                        sort_type: e.target.value,
                      }))
                    }
                  >
                    <option value="normal">normal（隨機）</option>
                    <option value="asc">asc（依字數分組，由短到長）</option>
                  </select>
                </label>
                <label style={{ display: "grid", gap: 6 }}>
                  <span>每個單字累計答對的次數才過關（round_count）</span>
                  <input
                    type="number"
                    min={1}
                    value={draftConfig.round_count}
                    onChange={(e) =>
                      setDraftConfig((d) => ({
                        ...d,
                        round_count: Math.max(
                          1,
                          parseInt(e.target.value || "1", 10)
                        ),
                      }))
                    }
                  />
                </label>
              </div>

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
                <Btn onClick={() => setShowLocalSettings(false)}>取消</Btn>
                <Btn
                  primary
                  onClick={() => {
                    setConfig(draftConfig);
                    // 立即以新設定重置本輪
                    setRound(0);
                    setWordIndex(0);
                    setSliceIds([]);
                    setCurrentQueue([]);
                    setQueueIdx(0);
                    setMemorySet(new Set());
                    setVisitedSet(new Set());
                    // 等下一個 tick 按新排序重載
                    setTimeout(() => {
                      // allIds 由 config 推導，更新後 useMemo 將重算並觸發首次載入 effect
                    }, 0);
                    setShowLocalSettings(false);
                  }}
                >
                  套用
                </Btn>
              </div>

              <div style={{ marginTop: 8, color: "#777", fontSize: 12 }}>
                說明：此面板只影響本頁。完成所有切片且達到 round_count
                後，僅針對本次學習範圍的單字（本頁選中的清單）執行 studyted +1。
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
    </AppContainer>
  );
}
