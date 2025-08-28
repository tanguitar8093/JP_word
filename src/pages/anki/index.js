import React, { useMemo, useState, useEffect } from "react";
import styled from "styled-components";

// 單檔 Anki Demo：資料 + 邏輯 + UI
// - 簡化的學習排程：Again/Hard/Good/Easy 依難度把卡片插回佇列不同位置
// - 無後端、無本地儲存，純前端示範

const Page = styled.div`
  max-width: 720px;
  margin: 0 auto;
  padding: 16px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const Title = styled.h2`
  margin: 0;
`;

const Stats = styled.div`
  font-size: 14px;
  color: #555;
`;

const CardContainer = styled.div`
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
`;

const CardFront = styled.div`
  font-size: 20px;
  text-align: center;
`;

const CardBack = styled.div`
  font-size: 18px;
  margin-top: 10px;
  color: #333;
  text-align: center;
`;

const Actions = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 14px;
`;

const Btn = styled.button`
  padding: 8px 12px;
  border: 1px solid #ccc;
  background: #fafafa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: #f0f0f0;
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  color: #777;
  font-size: 13px;
`;

// 測試資料（可自行增減）
const SAMPLE_CARDS = [
  {
    id: 1,
    jp_word: "たべる",
    kanji_jp_word: "食べる",
    ch_word: "吃",
    type: "動詞",
  },
  {
    id: 2,
    jp_word: "のみます",
    kanji_jp_word: "飲みます",
    ch_word: "喝",
    type: "動詞",
  },
  {
    id: 3,
    jp_word: "はやい",
    kanji_jp_word: "早い",
    ch_word: "快、早",
    type: "形容詞",
  },
  {
    id: 4,
    jp_word: "きれい",
    kanji_jp_word: "綺麗",
    ch_word: "漂亮、乾淨",
    type: "形容動詞",
  },
  {
    id: 5,
    jp_word: "くるま",
    kanji_jp_word: "車",
    ch_word: "車子",
    type: "名詞",
  },
  {
    id: 6,
    jp_word: "はしる",
    kanji_jp_word: "走る",
    ch_word: "跑",
    type: "動詞",
  },
  {
    id: 7,
    jp_word: "おそい",
    kanji_jp_word: "遅い",
    ch_word: "慢、晚",
    type: "形容詞",
  },
  {
    id: 8,
    jp_word: "かわいい",
    kanji_jp_word: "可愛い",
    ch_word: "可愛",
    type: "形容詞",
  },
  {
    id: 9,
    jp_word: "でんしゃ",
    kanji_jp_word: "電車",
    ch_word: "電車",
    type: "名詞",
  },
  {
    id: 10,
    jp_word: "みる",
    kanji_jp_word: "見る",
    ch_word: "看",
    type: "動詞",
  },
  {
    id: 11,
    jp_word: "おおきい",
    kanji_jp_word: "大きい",
    ch_word: "大、巨大",
    type: "形容詞",
  },
  {
    id: 12,
    jp_word: "ちいさい",
    kanji_jp_word: "小さい",
    ch_word: "小、小型",
    type: "形容詞",
  },
  {
    id: 13,
    jp_word: "あたらしい",
    kanji_jp_word: "新しい",
    ch_word: "新、新的",
    type: "形容詞",
  },
  {
    id: 14,
    jp_word: "ふるい",
    kanji_jp_word: "古い",
    ch_word: "舊、老舊",
    type: "形容詞",
  },
  {
    id: 15,
    jp_word: "べんり",
    kanji_jp_word: "便利",
    ch_word: "方便",
    type: "形容動詞",
  },
];

// 簡化的佇列插入工具：將 id 插回 queue 的 offset 位置（最小插 1）
function requeue(queue, id, offset) {
  const next = queue.filter((x) => x !== id);
  const pos = Math.max(1, Math.min(next.length, offset));
  next.splice(pos, 0, id);
  return next;
}

// 簡化的語音播放（日文）
function speakJa(text) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {}
}

// ===== 模組層常數與工具，避免 hooks 依賴噪音 =====
const DECK_ID = "DEMO"; // 未接筆記本時，先用 DEMO；之後可替換為 notebookId
const VERSION = 1;
const STORAGE_KEY = `jpword:anki:v1:${DECK_ID}`;
const DEFAULT_CONFIG = {
  cooldownN: 3, // Again 至少隔幾張
  dailyCap: 50, // 今日最多答題數
  shuffleWindow: 2, // 插回位置抖動幅度 ±2
  shuffleFrontK: 5, // 出題前打亂前 K 張
  graduateMode: "session", // "session" | "permanent"
  // 新增：最小間隔（不進冷卻池，只避免太快重複）
  minGapHard: 2,
  minGapGood: 4,
};
const todayStr = () => new Date().toISOString().slice(0, 10);
const newSessionId = () => Math.random().toString(36).slice(2, 10);

export default function AnkiDemo() {
  // 規則與鍵值已提升到模組層

  // 卡片基礎資料
  const cardsById = useMemo(() => {
    const m = new Map();
    for (const c of SAMPLE_CARDS) m.set(c.id, c);
    return m;
  }, []);

  // 初始佇列：依資料順序
  const initialIds = useMemo(() => SAMPLE_CARDS.map((c) => c.id), []);
  const [queue, setQueue] = useState(initialIds);
  const [currentId, setCurrentId] = useState(initialIds[0] || null);
  const [showBack, setShowBack] = useState(false);

  // 每張卡的學習狀態（簡化）：{ reviews, graduated }
  const [cardState, setCardState] = useState(() => {
    const init = {};
    for (const c of SAMPLE_CARDS) init[c.id] = { reviews: 0, graduated: false };
    return init;
  });

  // 冷卻池（Again 暫存，remaining 次數歸零後釋放回 queue）
  const [parked, setParked] = useState([]); // [{id, remaining, baseOffset}]

  // 統計與設定
  const [stats, setStats] = useState({ day: todayStr(), reviewedToday: 0 });
  const [sessionId, setSessionId] = useState(newSessionId());
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  // 最近出現卡片（用於最小間隔過濾）
  const [recents, setRecents] = useState([]); // 最新在前，例如 [lastId, ...]

  // 儲存/載入進度
  function saveProgress(next = {}) {
    const snapshot = {
      version: VERSION,
      questionIds: initialIds,
      queue,
      parked,
      cardState,
      stats,
      config,
      recents,
      meta: { sessionId },
      ...next,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {}
  }

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data || data.version !== VERSION) return false;
      // 題庫一致性：questionIds 必須完全相同
      const equal =
        Array.isArray(data.questionIds) &&
        data.questionIds.length === initialIds.length &&
        data.questionIds.every((x, i) => x === initialIds[i]);
      if (!equal) return false;
      setQueue(Array.isArray(data.queue) ? data.queue : initialIds);
      setParked(Array.isArray(data.parked) ? data.parked : []);
      setCardState((prev) => ({ ...prev, ...(data.cardState || {}) }));
      setStats(
        data.stats && data.stats.day === todayStr()
          ? data.stats
          : { day: todayStr(), reviewedToday: 0 }
      );
      setConfig({ ...DEFAULT_CONFIG, ...(data.config || {}) });
      if (Array.isArray(data.recents)) setRecents(data.recents);
      setSessionId(data.meta?.sessionId || newSessionId());
      return true;
    } catch {
      return false;
    }
  }

  function clearProgress() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  // 首次載入：嘗試還原
  useEffect(() => {
    loadProgress();
  }, []);

  // 是否在本 session 畢業（休眠）
  const isSessionGraduated = (id) => {
    const s = cardState[id];
    return s && s.graduated === "session:" + sessionId;
  };

  const availableIds = queue.filter(
    (id) => !cardState[id]?.graduated && !isSessionGraduated(id)
  );
  const remaining =
    availableIds.length +
    parked.filter((x) => {
      const id = x.id;
      return !cardState[id]?.graduated && !isSessionGraduated(id);
    }).length;
  const studied = Object.values(cardState).reduce((a, s) => a + s.reviews, 0);

  const current = currentId != null ? cardsById.get(currentId) : null;

  // 插入位置帶抖動
  // 軟限制：小於 15 題時，降低冷卻與關閉隨機以穩定體驗
  const deckCount = initialIds.length;
  const softActive = deckCount < 15;
  const econf = {
    ...config,
    cooldownN: softActive ? Math.min(config.cooldownN, 2) : config.cooldownN,
    shuffleWindow: softActive ? 0 : config.shuffleWindow,
    shuffleFrontK: softActive ? 0 : config.shuffleFrontK,
  };

  const withJitter = (pos) => {
    const j = econf.shuffleWindow;
    if (!j) return pos;
    const delta = Math.floor(Math.random() * (2 * j + 1)) - j; // [-j, +j]
    return Math.max(1, Math.min(queue.length, pos + delta));
  };

  // 前窗小洗牌（打亂前 K 張）
  function shuffleFront(q) {
    const K = Math.min(econf.shuffleFrontK || 0, q.length);
    if (!K || K <= 1) return q;
    const head = q.slice(0, K);
    for (let i = head.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [head[i], head[j]] = [head[j], head[i]];
    }
    return [...head, ...q.slice(K)];
  }

  function processParkedAndNext(nextQueue, prevId, baseParked) {
    // 今日上限
    if (stats.reviewedToday >= config.dailyCap) {
      setCurrentId(null);
      setShowBack(false);
      return;
    }
    // 冷卻倒數與釋放
    let q = nextQueue ?? queue;
    let p = baseParked != null ? [...baseParked] : [...parked];
    if (p.length > 0) {
      p = p.map((x) => ({ ...x, remaining: x.remaining - 1 }));
      const release = p.filter((x) => x.remaining <= 0);
      p = p.filter((x) => x.remaining > 0);
      for (const r of release) {
        const idx = withJitter(r.baseOffset || 1);
        const tmp = q.filter((x) => x !== r.id);
        tmp.splice(Math.min(idx, tmp.length), 0, r.id);
        q = tmp;
      }
    }
    // 輕度隨機（前窗 K）
    q = shuffleFront(q);
    // 取下一張可用卡（盡量避免與上一張相同）
    const recentSet = new Set(recents);
    const condBase = (id) =>
      !cardState[id]?.graduated && !isSessionGraduated(id);
    // 先用最小間隔過濾（除非軟限制下題數很少，仍會 fallback）
    const condGap = (id) => condBase(id) && !recentSet.has(id);
    let candidates = q.filter(condGap);
    if (candidates.length === 0) {
      // 放寬，不排除 recents
      candidates = q.filter(condBase);
    }
    // 若因為全都停車而沒有候選，但仍有 parked，強制釋放一張最接近的
    if (candidates.length === 0 && p.length > 0) {
      // 取 remaining 最小者釋放
      const minR = Math.min(...p.map((x) => x.remaining));
      const idxMin = p.findIndex((x) => x.remaining === minR);
      const picked = p[idxMin];
      const idx = withJitter(picked.baseOffset || 1);
      const tmp = q.filter((x) => x !== picked.id);
      tmp.splice(Math.min(idx, tmp.length), 0, picked.id);
      q = tmp;
      // 從 parked 移除該卡
      p = p.filter((_, i) => i !== idxMin);
      // 重新計算候選
      candidates = q.filter(cond);
    }

    let nxt = candidates[0] ?? null;
    if (
      nxt != null &&
      prevId != null &&
      candidates.length > 1 &&
      nxt === prevId
    ) {
      nxt = candidates[1];
    }
    setQueue(q);
    setParked(p);
    setCurrentId(nxt ?? null);
    setShowBack(false);
    // 更新 recents：把上一張加入，長度受 minGap 控制
    const wantSize = Math.max(econf.minGapHard, econf.minGapGood, 1);
    const newRecents = prevId
      ? [prevId, ...recents.filter((x) => x !== prevId)].slice(0, wantSize)
      : recents;
    setRecents(newRecents);
    // 保存當前狀態（queue / parked / recents）
    saveProgress({ queue: q, parked: p, recents: newRecents });
  }

  function rate(rating) {
    if (current == null) return;
    // 更新狀態
    setCardState((prev) => {
      const s = prev[current.id] || { reviews: 0, graduated: false };
      const updated = {
        ...prev,
        [current.id]: { ...s, reviews: s.reviews + 1 },
      };
      return updated;
    });

    // 計算插回位置（純示範邏輯）
    // Again: 很快再遇到；Hard: 稍後；Good: 更晚；Easy: 畢業
    let nextQ = queue;
    let nextP = parked;
    if (rating === "again") {
      // 不直接插回，放入冷卻池（先用局部值，之後統一交給 processParkedAndNext 寫回）
      nextP = [
        ...parked,
        { id: current.id, remaining: econf.cooldownN, baseOffset: 1 },
      ];
      nextQ = queue.filter((x) => x !== current.id);
    } else if (rating === "hard") {
      const pos = withJitter(3);
      nextQ = requeue(queue, current.id, pos);
    } else if (rating === "good") {
      const pos = withJitter(7);
      nextQ = requeue(queue, current.id, pos);
    } else if (rating === "easy") {
      if (config.graduateMode === "session") {
        // 本場休眠
        setCardState((prev) => ({
          ...prev,
          [current.id]: {
            ...prev[current.id],
            graduated: "session:" + sessionId,
          },
        }));
      } else {
        // 永久畢業（本輪）
        setCardState((prev) => ({
          ...prev,
          [current.id]: { ...prev[current.id], graduated: true },
        }));
      }
      nextQ = queue.filter((x) => x !== current.id);
    }
    // 統計今日數量
    setStats((s) => ({ ...s, reviewedToday: s.reviewedToday + 1 }));
    // 下一題前處理 parked、洗牌與選卡
    processParkedAndNext(nextQ, current.id, nextP);
  }

  // 跨天重置今日統計
  useEffect(() => {
    const t = todayStr();
    if (stats.day !== t) {
      setStats({ day: t, reviewedToday: 0 });
      setSessionId(newSessionId());
    }
  }, [stats.day]);

  if (!current) {
    const learned = Object.values(cardState).filter((s) => s.graduated).length;
    return (
      <Page>
        <Header>
          <Title>Anki Demo</Title>
          <Stats>
            完成：{learned}/{SAMPLE_CARDS.length}
          </Stats>
        </Header>
        {softActive && (
          <div style={{ color: "#b26a00", fontSize: 13, margin: "6px 0 8px" }}>
            題目較少（{deckCount}）已自動關閉隨機並降低 again 冷卻，僅供試玩。
          </div>
        )}
        <CardContainer>
          <CardFront style={{ fontSize: 18 }}>🎉 本次學習結束！</CardFront>
          <CardBack style={{ marginTop: 16 }}>
            累積複習次數：{studied}
            <div style={{ marginTop: 6, color: "#666" }}>
              今日：{stats.reviewedToday}/{config.dailyCap}
            </div>
          </CardBack>
          <Actions style={{ marginTop: 16 }}>
            <Btn
              onClick={() => {
                // 重新開始
                setQueue(initialIds);
                setCardState(() => {
                  const init = {};
                  for (const c of SAMPLE_CARDS)
                    init[c.id] = { reviews: 0, graduated: false };
                  return init;
                });
                setParked([]);
                setStats({ day: todayStr(), reviewedToday: 0 });
                setSessionId(newSessionId());
                setCurrentId(initialIds[0] || null);
                setShowBack(false);
                clearProgress();
              }}
            >
              再來一輪
            </Btn>
          </Actions>
        </CardContainer>
      </Page>
    );
  }

  return (
    <Page>
      <Header>
        <Title>Anki Demo</Title>
        <Stats>
          剩餘：{remaining} ｜ 今日：{stats.reviewedToday}/{config.dailyCap} ｜
          累積：{studied}
        </Stats>
      </Header>
      {softActive && (
        <div style={{ color: "#b26a00", fontSize: 13, margin: "6px 0 8px" }}>
          題目較少（{deckCount}）已自動關閉隨機並降低 again 冷卻，僅供試玩。
        </div>
      )}

      <CardContainer>
        {/* 正面：中文提示 */}
        <CardFront>
          <div style={{ marginBottom: 6 }}>
            {current.ch_word}{" "}
            <span style={{ fontSize: 12, color: "#888" }}>
              [{current.type}]
            </span>
          </div>
          {!showBack && (
            <Actions>
              <Btn onClick={() => setShowBack(true)}>顯示答案</Btn>
            </Actions>
          )}
        </CardFront>

        {/* 反面：日文 + 發音 */}
        {showBack && (
          <CardBack>
            <div>
              日文：{current.kanji_jp_word || current.jp_word}
              <Btn
                style={{ marginLeft: 8 }}
                onClick={() => speakJa(current.jp_word)}
              >
                🔊
              </Btn>
            </div>
            {current.kanji_jp_word && (
              <div style={{ marginTop: 4, color: "#666" }}>
                {current.jp_word}
              </div>
            )}
            <Actions>
              <Btn
                onClick={() => rate("again")}
                style={{ borderColor: "#e57373" }}
              >
                Again
              </Btn>
              <Btn
                onClick={() => rate("hard")}
                style={{ borderColor: "#ffb74d" }}
              >
                Hard
              </Btn>
              <Btn
                onClick={() => rate("good")}
                style={{ borderColor: "#64b5f6" }}
              >
                Good
              </Btn>
              <Btn
                onClick={() => rate("easy")}
                style={{ borderColor: "#81c784" }}
              >
                Easy
              </Btn>
            </Actions>
          </CardBack>
        )}
      </CardContainer>

      {/* 簡易設定（便於實驗）*/}
      <Footer>
        <div>
          冷卻N：
          <input
            type="number"
            min={1}
            max={5}
            value={config.cooldownN}
            onChange={(e) => {
              const v = Math.max(1, Math.min(5, Number(e.target.value) || 1));
              setConfig((c) => ({ ...c, cooldownN: v }));
              saveProgress({ config: { ...config, cooldownN: v } });
            }}
            style={{ width: 60, marginLeft: 6 }}
          />
          <span style={{ marginLeft: 12 }}>
            今日上限：
            <input
              type="number"
              min={10}
              max={500}
              value={config.dailyCap}
              onChange={(e) => {
                const v = Math.max(
                  10,
                  Math.min(500, Number(e.target.value) || 10)
                );
                setConfig((c) => ({ ...c, dailyCap: v }));
                saveProgress({ config: { ...config, dailyCap: v } });
              }}
              style={{ width: 80, marginLeft: 6 }}
            />
          </span>
          <span style={{ marginLeft: 12 }}>
            最小間隔（Hard）：
            <input
              type="number"
              min={0}
              max={10}
              value={config.minGapHard}
              onChange={(e) => {
                const v = Math.max(
                  0,
                  Math.min(10, Number(e.target.value) || 0)
                );
                setConfig((c) => ({ ...c, minGapHard: v }));
                saveProgress({ config: { ...config, minGapHard: v } });
              }}
              style={{ width: 60, marginLeft: 6 }}
            />
          </span>
          <span style={{ marginLeft: 12 }}>
            最小間隔（Good）：
            <input
              type="number"
              min={0}
              max={10}
              value={config.minGapGood}
              onChange={(e) => {
                const v = Math.max(
                  0,
                  Math.min(10, Number(e.target.value) || 0)
                );
                setConfig((c) => ({ ...c, minGapGood: v }));
                saveProgress({ config: { ...config, minGapGood: v } });
              }}
              style={{ width: 60, marginLeft: 6 }}
            />
          </span>
          <span style={{ marginLeft: 12 }}>
            輕度隨機：±
            <input
              type="number"
              min={0}
              max={5}
              value={config.shuffleWindow}
              onChange={(e) => {
                const v = Math.max(0, Math.min(5, Number(e.target.value) || 0));
                setConfig((c) => ({ ...c, shuffleWindow: v }));
                saveProgress({ config: { ...config, shuffleWindow: v } });
              }}
              style={{ width: 60, marginLeft: 6 }}
            />
          </span>
          <span style={{ marginLeft: 12 }}>
            畢業：
            <select
              value={config.graduateMode}
              onChange={(e) => {
                const v =
                  e.target.value === "permanent" ? "permanent" : "session";
                setConfig((c) => ({ ...c, graduateMode: v }));
                saveProgress({ config: { ...config, graduateMode: v } });
              }}
              style={{ marginLeft: 6 }}
            >
              <option value="session">本場休眠</option>
              <option value="permanent">本輪畢業</option>
            </select>
          </span>
        </div>
        <div>
          <button
            onClick={() => {
              clearProgress();
              setQueue(initialIds);
              setParked([]);
              setCardState(() => {
                const init = {};
                for (const c of SAMPLE_CARDS)
                  init[c.id] = { reviews: 0, graduated: false };
                return init;
              });
              setStats({ day: todayStr(), reviewedToday: 0 });
              setSessionId(newSessionId());
              setCurrentId(initialIds[0] || null);
              setShowBack(false);
            }}
          >
            清除進度
          </button>
        </div>
      </Footer>

      <Footer>
        <span>小提示：Easy 將此卡畢業，不再出現。</span>
        <span>Demo 僅為示範，未與資料庫同步。</span>
      </Footer>
    </Page>
  );
}
