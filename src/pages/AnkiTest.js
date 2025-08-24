import React, { useState, useEffect, useMemo } from 'react';

// --- 1. Hardcode 的初始資料與常數 ---
// 為了演示，我們手動設定幾張不同狀態的卡片
const ONE_MINUTE_MS = 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const now = Date.now();

// 先定義好演算法常數，資料才能使用它
const INITIAL_EASE_FACTOR = 2.5;

const INITIAL_CARDS = [
  {
    id: 1,
    question: 'Apple',
    answer: '蘋果',
    // --- Anki Metadata ---
    status: 'new', // 狀態: new, learning, review
    due: now,      // 到期時間 (timestamp)
    interval: 0,   // 間隔天數
    easeFactor: INITIAL_EASE_FACTOR, // 正確使用常數來設定初始值
    reps: 0,       // 複習次數
    lapses: 0,     // 遺忘次數
    learningStep: 1, // 學習階段 (1代表第一步)
  },
  {
    id: 2,
    question: 'Book',
    answer: '書',
    status: 'review',
    due: now - ONE_DAY_MS, // 昨天就到期了，所以今天必須複習
    interval: 5,
    easeFactor: 2.6, // 複習卡的 easeFactor 會變動，不使用初始值
    reps: 3,
    lapses: 0,
    learningStep: 1,
  },
  {
    id: 3,
    question: 'Car',
    answer: '車',
    status: 'learning',
    due: now - (5 * ONE_MINUTE_MS), // 5分鐘前就到期了，在學習中
    interval: 0,
    easeFactor: 2.5, // 學習中卡片的 easeFactor 可能還沒變，或已變動
    reps: 1,
    lapses: 0,
    learningStep: 2, // 在學習的第二步
  },
  {
    id: 4,
    question: 'Dog',
    answer: '狗',
    status: 'new',
    due: now,
    interval: 0,
    easeFactor: INITIAL_EASE_FACTOR, // 正確使用常數來設定初始值
    reps: 0,
    lapses: 0,
    learningStep: 1,
  },
  {
    id: 5,
    question: 'Cat',
    answer: '貓',
    status: 'review',
    due: now + ONE_DAY_MS, // 明天才到期，今天不該出現
    interval: 3,
    easeFactor: 2.35, // 複習卡的 easeFactor 會變動
    reps: 2,
    lapses: 1,
    learningStep: 1,
  },
];


// --- 2. Anki 演算法常數 ---
const LEARNING_STEPS_MS = [ONE_MINUTE_MS, 10 * ONE_MINUTE_MS]; // 1m, 10m
const GRADUATING_INTERVAL_DAYS = 1;
const LAPSE_INTERVAL_MS = ONE_MINUTE_MS;


// --- 3. 核心演算法函式 ---
function calculateNextState(card, rating) {
  const updatedCard = { ...card };
  updatedCard.reps += 1;
  const now = Date.now();

  if (card.status === 'learning' || card.status === 'new') {
    switch (rating) {
      case 'again':
        updatedCard.learningStep = 1;
        updatedCard.due = now + LEARNING_STEPS_MS[0];
        updatedCard.status = 'learning';
        break;
      case 'good':
        // Anki 2.1+ 的 learningStep 是從 0 開始的 index, 這裡為了簡化用步驟數 (1, 2...)
        if (updatedCard.learningStep < LEARNING_STEPS_MS.length) {
          updatedCard.due = now + LEARNING_STEPS_MS[updatedCard.learningStep];
          updatedCard.learningStep += 1;
          updatedCard.status = 'learning';
        } else {
          // --- 畢業 ---
          updatedCard.status = 'review';
          updatedCard.interval = GRADUATING_INTERVAL_DAYS;
          updatedCard.due = now + (updatedCard.interval * ONE_DAY_MS);
        }
        break;
      case 'easy':
        // 在學習階段按 Easy 直接畢業，間隔設為 4 天
        updatedCard.status = 'review';
        updatedCard.interval = 4;
        updatedCard.due = now + (updatedCard.interval * ONE_DAY_MS);
        break;
      // 'hard' 在學習中通常不提供，或視同 'good' 的前一步
      case 'hard':
         updatedCard.due = now + LEARNING_STEPS_MS[0]; // 簡單處理，視為重回第一步
         updatedCard.status = 'learning';
         break;
      default:
        break;
    }
  } else if (card.status === 'review') {
    switch (rating) {
      case 'again':
        // --- 遺忘 (Lapse) ---
        updatedCard.lapses += 1;
        updatedCard.easeFactor = Math.max(1.3, card.easeFactor - 0.2);
        updatedCard.status = 'learning';
        updatedCard.learningStep = 1;
        updatedCard.interval = 0;
        updatedCard.due = now + LAPSE_INTERVAL_MS;
        break;
      case 'hard':
        updatedCard.easeFactor = Math.max(1.3, card.easeFactor - 0.15);
        updatedCard.interval = Math.ceil(card.interval * 1.2);
        updatedCard.due = now + (updatedCard.interval * ONE_DAY_MS);
        break;
      case 'good':
        updatedCard.interval = Math.ceil(card.interval * card.easeFactor);
        updatedCard.due = now + (updatedCard.interval * ONE_DAY_MS);
        break;
      case 'easy':
        updatedCard.easeFactor += 0.15;
        updatedCard.interval = Math.ceil(card.interval * card.easeFactor * 1.3);
        updatedCard.due = now + (updatedCard.interval * ONE_DAY_MS);
        break;
      default:
        break;
    }
  }

  return updatedCard;
}

// --- 4. React 元件 ---
export default function AnkiSimulator() {
  const [cards, setCards] = useState(INITIAL_CARDS);
  const [currentCard, setCurrentCard] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionFinished, setSessionFinished] = useState(false);

  // 使用 useMemo 來計算佇列和計數，只有在 cards 變動時才重算
  const sessionQueues = useMemo(() => {
    const now = Date.now();
    const startOfDay = new Date().setHours(0, 0, 0, 0);

    const reviewQueue = cards.filter(c => c.status === 'review' && c.due <= startOfDay);
    const learningQueue = cards.filter(c => c.status === 'learning' && c.due <= now);
    const newQueue = cards.filter(c => c.status === 'new');
    
    // 排序以確保一致性
    reviewQueue.sort((a, b) => a.due - b.due);
    learningQueue.sort((a, b) => a.due - b.due);

    return { reviewQueue, learningQueue, newQueue };
  }, [cards]);

  // 決定下一張卡片的邏輯
  const pickNextCard = () => {
    const { reviewQueue, learningQueue, newQueue } = sessionQueues;

    // 優先級: 複習 -> 新卡 -> 學習中
    if (reviewQueue.length > 0) return reviewQueue[0];
    if (newQueue.length > 0) return newQueue[0];
    if (learningQueue.length > 0) return learningQueue[0];
    
    return null; // 沒有更多卡片了
  };

  // 初始化或更新 session
  useEffect(() => {
    const nextCard = pickNextCard();
    if (nextCard) {
      setCurrentCard(nextCard);
    } else {
      // 確保不是一開始就沒卡
      if (cards.some(c => c.status !== 'review' || c.due > new Date().setHours(0, 0, 0, 0))) {
        setSessionFinished(true);
      }
    }
  }, [sessionQueues]);


  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleRate = (rating) => {
    if (!currentCard) return;

    // 1. 計算卡片新狀態
    const updatedCard = calculateNextState(currentCard, rating);

    // 2. 更新總卡片列表 (這是觸發重新渲染和計算的關鍵)
    const newCardsList = cards.map(c => c.id === updatedCard.id ? updatedCard : c);
    setCards(newCardsList);

    // 3. 準備下一張卡
    setShowAnswer(false);
  };

  if (sessionFinished) {
    return <div style={styles.container}>
      <h2 style={styles.congrats}>🎉 今日任務完成！ 🎉</h2>
    </div>;
  }

  if (!currentCard) {
    return <div style={styles.container}>載入中或沒有待辦卡片...</div>;
  }

  return (
    <div style={styles.container}>
      {/* --- 5. UI 介面 --- */}
      <div style={styles.statsContainer}>
        <span style={{...styles.stat, color: '#007bff'}}>
          {sessionQueues.newQueue.length}
        </span>
        <span style={{...styles.stat, color: '#dc3545'}}>
          {sessionQueues.learningQueue.length}
        </span>
        <span style={{...styles.stat, color: '#28a745'}}>
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
            <button onClick={() => handleRate('again')} style={{...styles.button, ...styles.btnAgain}}>Again</button>
            <button onClick={() => handleRate('hard')} style={{...styles.button, ...styles.btnHard}}>Hard</button>
            <button onClick={() => handleRate('good')} style={{...styles.button, ...styles.btnGood}}>Good</button>
            <button onClick={() => handleRate('easy')} style={{...styles.button, ...styles.btnEasy}}>Easy</button>
          </>
        ) : (
          <button onClick={handleShowAnswer} style={{...styles.button, backgroundColor: '#17a2b8', width: '100%'}}>顯示答案</button>
        )}
      </div>
    </div>
  );
}

// --- 簡單的樣式 ---
const styles = {
  container: { position: 'relative', fontFamily: 'Arial, sans-serif', maxWidth: '500px', margin: '40px auto', padding: '20px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  statsContainer: { position: 'absolute', top: '15px', left: '20px', display: 'flex', gap: '8px' },
  stat: { fontWeight: 'bold', fontSize: '18px' },
  card: { minHeight: '200px', border: '1px solid #ccc', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', fontSize: '32px', backgroundColor: '#f9f9f9', marginTop: '30px' },
  question: { marginBottom: '10px' },
  answer: { color: '#333' },
  answerPlaceholder: { color: '#aaa', fontSize: '20px' },
  hr: { width: '80%', margin: '10px auto', border: '0', borderTop: '1px solid #eee' },
  buttonContainer: { marginTop: '20px', display: 'flex', justifyContent: 'space-around', gap: '10px' },
  button: { flex: 1, padding: '12px 0', fontSize: '16px', borderRadius: '5px', border: 'none', cursor: 'pointer', color: 'white', transition: 'opacity 0.2s' },
  btnAgain: { backgroundColor: '#dc3545' },
  btnHard: { backgroundColor: '#ffc107', color: 'black' },
  btnGood: { backgroundColor: '#28a745' },
  btnEasy: { backgroundColor: '#007bff' },
  congrats: { color: '#28a745' },
};