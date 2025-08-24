import React, { useState, useEffect, useMemo } from 'react';

// --- 1) 初始資料與常數 ---
const ONE_MINUTE_MS = 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const now = Date.now();

const INITIAL_EASE_FACTOR = 2.5;

const INITIAL_CARDS = [
  {
    id: 1,
    question: 'Apple',
    answer: '蘋果',
    status: 'new', // new | learning | review
    due: now,
    interval: 0,
    easeFactor: INITIAL_EASE_FACTOR,
    reps: 0,
    lapses: 0,
    learningStep: 1,
  },
  {
    id: 2,
    question: 'Book',
    answer: '書',
    status: 'review',
    due: now - ONE_DAY_MS, // 昨天就到期 → 今天必須複習
    interval: 5,
    easeFactor: 2.6,
    reps: 3,
    lapses: 0,
    learningStep: 1,
  },
  {
    id: 3,
    question: 'Car',
    answer: '車',
    status: 'learning',
    due: now - 5 * ONE_MINUTE_MS, // 5 分鐘前到期（學習中）
    interval: 0,
    easeFactor: 2.5,
    reps: 1,
    lapses: 0,
    learningStep: 2,
  },
  {
    id: 4,
    question: 'Dog',
    answer: '狗',
    status: 'new',
    due: now,
    interval: 0,
    easeFactor: INITIAL_EASE_FACTOR,
    reps: 0,
    lapses: 0,
    learningStep: 1,
  },
  {
    id: 5,
    question: 'Cat',
    answer: '貓',
    status: 'review',
    due: now + ONE_DAY_MS, // 明天到期 → 今天不應出現
    interval: 3,
    easeFactor: 2.35,
    reps: 2,
    lapses: 1,
    learningStep: 1,
  },
];

// --- 2) 演算法常數（簡化版） ---
const LEARNING_STEPS_MS = [ONE_MINUTE_MS, 10 * ONE_MINUTE_MS]; // 1m, 10m
const GRADUATING_INTERVAL_DAYS = 1;
const LAPSE_INTERVAL_MS = ONE_MINUTE_MS; // lapse 後的重新學習間隔

// --- 3) 核心演算法 ---
function calculateNextState(card, rating) {
  const updatedCard = { ...card };
  updatedCard.reps += 1;
  const now = Date.now();

  if (card.status === 'learning' || card.status === 'new') {
    switch (rating) {
      case 'again': {
        updatedCard.learningStep = 1;
        updatedCard.due = now + LEARNING_STEPS_MS[0];
        updatedCard.status = 'learning';
        break;
      }
      case 'good': {
        // 這裡用 1,2... 表示步驟（非 0-based index）
        if (updatedCard.learningStep < LEARNING_STEPS_MS.length) {
          // 仍在學習流程中 → 推進到下一步
          updatedCard.due = now + LEARNING_STEPS_MS[updatedCard.learningStep];
          updatedCard.learningStep += 1;
          updatedCard.status = 'learning';
        } else {
          // 完成學習 → 畢業到 review
          updatedCard.status = 'review';
          updatedCard.interval = GRADUATING_INTERVAL_DAYS;
          updatedCard.due = now + updatedCard.interval * ONE_DAY_MS;
        }
        break;
      }
      case 'easy': {
        // 學習階段按 Easy 直接畢業，預設間隔 4 天（簡化）
        updatedCard.status = 'review';
        updatedCard.interval = 4;
        updatedCard.due = now + updatedCard.interval * ONE_DAY_MS;
        break;
      }
      case 'hard': {
        // 簡化：視為回第一步（Anki 實際邏輯更複雜）
        updatedCard.status = 'learning';
        updatedCard.learningStep = 1;
        updatedCard.due = now + LEARNING_STEPS_MS[0];
        break;
      }
      default:
        break;
    }
  } else if (card.status === 'review') {
    switch (rating) {
      case 'again': {
        // 遺忘（lapse）
        updatedCard.lapses += 1;
        updatedCard.easeFactor = Math.max(1.3, card.easeFactor - 0.2);
        updatedCard.status = 'learning';
        updatedCard.learningStep = 1;
        updatedCard.interval = 0;
        updatedCard.due = now + LAPSE_INTERVAL_MS;
        break;
      }
      case 'hard': {
        updatedCard.easeFactor = Math.max(1.3, card.easeFactor - 0.15);
        updatedCard.interval = Math.ceil(card.interval * 1.2);
        updatedCard.due = now + updatedCard.interval * ONE_DAY_MS;
        break;
      }
      case 'good': {
        updatedCard.interval = Math.ceil(card.interval * card.easeFactor);
        updatedCard.due = now + updatedCard.interval * ONE_DAY_MS;
        break;
      }
      case 'easy': {
        updatedCard.easeFactor = card.easeFactor + 0.15;
        updatedCard.interval = Math.ceil(card.interval * updatedCard.easeFactor * 1.3);
        updatedCard.due = now + updatedCard.interval * ONE_DAY_MS;
        break;
      }
      default:
        break;
    }
  }

  return updatedCard;
}

export default function AnkiSimulator() {
  const [cards, setCards] = useState(INITIAL_CARDS);
  const [currentCard, setCurrentCard] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionFinished, setSessionFinished] = useState(false);

  // --- 4) 佇列計算（只在 cards 變時重算） ---
  const sessionQueues = useMemo(() => {
    const now = Date.now();

    // 修正重點：review 與 learning 的到期判斷使用「現在時間」
    const reviewQueue = cards
      .filter((c) => c.status === 'review' && c.due <= now)
      .sort((a, b) => a.due - b.due);

    const learningQueue = cards
      .filter((c) => c.status === 'learning' && c.due <= now)
      .sort((a, b) => a.due - b.due);

    // new 卡片：這裡不做每日上限（保持簡化）。
    const newQueue = cards.filter((c) => c.status === 'new');

    return { reviewQueue, learningQueue, newQueue };
  }, [cards]);

  // --- 5) 選卡邏輯（優先順序符合 Anki：review > learning > new） ---
  const pickNextCard = () => {
    const { reviewQueue, learningQueue, newQueue } = sessionQueues;
    if (reviewQueue.length > 0) return reviewQueue[0];
    if (learningQueue.length > 0) return learningQueue[0];
    if (newQueue.length > 0) return newQueue[0];
    return null;
  };

  // --- 6) 當隊列變更時，決定是否結束 session 或顯示下一張卡 ---
  useEffect(() => {
    const nextCard = pickNextCard();

    if (nextCard) {
      setSessionFinished(false);
      setCurrentCard(nextCard);
    } else {
      const { reviewQueue, learningQueue, newQueue } = sessionQueues;
      const noMoreCards =
        reviewQueue.length === 0 && learningQueue.length === 0 && newQueue.length === 0;
      if (noMoreCards) {
        setCurrentCard(null);
        setSessionFinished(true);
      }
    }
  }, [sessionQueues]);

  const handleShowAnswer = () => setShowAnswer(true);

  const handleRate = (rating) => {
    if (!currentCard) return;
    const updatedCard = calculateNextState(currentCard, rating);
    setCards((prev) => prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
    setShowAnswer(false);
  };

  // --- 7) UI ---
  if (sessionFinished) {
    return (
      <div style={styles.container}>
        <h2 style={styles.congrats}>🎉 今日任務完成！ 🎉</h2>
      </div>
    );
  }

  if (!currentCard) {
    return <div style={styles.container}>載入中或沒有待辦卡片...</div>;
  }

  return (
    <div style={styles.container}>
      {/* 統計（new / learning / review） */}
      <div style={styles.statsContainer}>
        <span title="New" style={{ ...styles.stat, color: '#007bff' }}>
          {sessionQueues.newQueue.length}
        </span>
        <span title="Learning" style={{ ...styles.stat, color: '#dc3545' }}>
          {sessionQueues.learningQueue.length}
        </span>
        <span title="Review (due)" style={{ ...styles.stat, color: '#28a745' }}>
          {sessionQueues.reviewQueue.length}
        </span>
      </div>

      <div style={styles.card}>
        <div style={styles.question}>{currentCard.question}</div>
        <hr style={styles.hr} />
        {showAnswer ? (
          <div style={styles.answer}>{currentCard.answer}</div>
        ) : (
          <div style={styles.answerPlaceholder}>點擊下方按鈕顯示答案</div>
        )}
      </div>

      <div style={styles.buttonContainer}>
        {showAnswer ? (
          <>
            <button onClick={() => handleRate('again')} style={{ ...styles.button, ...styles.btnAgain }}>
              Again
            </button>
            <button onClick={() => handleRate('hard')} style={{ ...styles.button, ...styles.btnHard }}>
              Hard
            </button>
            <button onClick={() => handleRate('good')} style={{ ...styles.button, ...styles.btnGood }}>
              Good
            </button>
            <button onClick={() => handleRate('easy')} style={{ ...styles.button, ...styles.btnEasy }}>
              Easy
            </button>
          </>
        ) : (
          <button
            onClick={handleShowAnswer}
            style={{ ...styles.button, backgroundColor: '#17a2b8', width: '100%' }}
          >
            顯示答案
          </button>
        )}
      </div>
    </div>
  );
}

// --- 8) 樣式 ---
const styles = {
  container: {
    position: 'relative',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '500px',
    margin: '40px auto',
    padding: '20px',
    textAlign: 'center',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  statsContainer: { position: 'absolute', top: '15px', left: '20px', display: 'flex', gap: '8px' },
  stat: { fontWeight: 'bold', fontSize: '18px' },
  card: {
    minHeight: '200px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    fontSize: '32px',
    backgroundColor: '#f9f9f9',
    marginTop: '30px',
  },
  question: { marginBottom: '10px' },
  answer: { color: '#333' },
  answerPlaceholder: { color: '#aaa', fontSize: '20px' },
  hr: { width: '80%', margin: '10px auto', border: '0', borderTop: '1px solid #eee' },
  buttonContainer: { marginTop: '20px', display: 'flex', justifyContent: 'space-around', gap: '10px' },
  button: {
    flex: 1,
    padding: '12px 0',
    fontSize: '16px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    color: 'white',
    transition: 'opacity 0.2s',
  },
  btnAgain: { backgroundColor: '#dc3545' },
  btnHard: { backgroundColor: '#ffc107', color: 'black' },
  btnGood: { backgroundColor: '#28a745' },
  btnEasy: { backgroundColor: '#007bff' },
  congrats: { color: '#28a745' },
};
