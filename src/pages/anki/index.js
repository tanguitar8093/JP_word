import React, { useMemo, useState } from "react";
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

export default function AnkiDemo() {
  // 卡片基礎資料
  const cardsById = useMemo(() => {
    const m = new Map();
    for (const c of SAMPLE_CARDS) m.set(c.id, c);
    return m;
  }, []);

  // 初始佇列：依資料順序
  const [queue, setQueue] = useState(() => SAMPLE_CARDS.map((c) => c.id));
  const [currentId, setCurrentId] = useState(queue[0] || null);
  const [showBack, setShowBack] = useState(false);

  // 每張卡的學習狀態（簡化）：{ reviews, graduated }
  const [cardState, setCardState] = useState(() => {
    const init = {};
    for (const c of SAMPLE_CARDS) init[c.id] = { reviews: 0, graduated: false };
    return init;
  });

  const remaining = queue.filter((id) => !cardState[id]?.graduated).length;
  const studied = Object.values(cardState).reduce((a, s) => a + s.reviews, 0);

  const current = currentId != null ? cardsById.get(currentId) : null;

  function gotoNext(nextQueue) {
    const q = nextQueue ?? queue;
    const nxt = q.find((id) => !cardState[id]?.graduated) ?? null;
    setCurrentId(nxt);
    setShowBack(false);
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
    if (rating === "again") {
      nextQ = requeue(queue, current.id, 1);
    } else if (rating === "hard") {
      nextQ = requeue(queue, current.id, 3);
    } else if (rating === "good") {
      nextQ = requeue(queue, current.id, 7);
    } else if (rating === "easy") {
      // 標記畢業，不再插回
      setCardState((prev) => ({
        ...prev,
        [current.id]: { ...prev[current.id], graduated: true },
      }));
      nextQ = queue.filter((x) => x !== current.id);
    }
    setQueue(nextQ);
    // 移動到下一張
    const after = nextQ.filter((id) => !cardState[id]?.graduated);
    setCurrentId(after[0] ?? null);
    setShowBack(false);
  }

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
        <CardContainer>
          <CardFront style={{ fontSize: 18 }}>🎉 本次學習結束！</CardFront>
          <CardBack style={{ marginTop: 16 }}>累積複習次數：{studied}</CardBack>
          <Actions style={{ marginTop: 16 }}>
            <Btn
              onClick={() => {
                // 重新開始
                setQueue(SAMPLE_CARDS.map((c) => c.id));
                setCardState(() => {
                  const init = {};
                  for (const c of SAMPLE_CARDS)
                    init[c.id] = { reviews: 0, graduated: false };
                  return init;
                });
                setCurrentId(SAMPLE_CARDS[0].id);
                setShowBack(false);
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
          剩餘：{remaining} ｜ 已複習：{studied}
        </Stats>
      </Header>

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
                假名：{current.jp_word}
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

      <Footer>
        <span>小提示：Easy 將此卡畢業，不再出現。</span>
        <span>Demo 僅為示範，未與資料庫同步。</span>
      </Footer>
    </Page>
  );
}
