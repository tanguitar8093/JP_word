import React, { useState, useEffect } from "react";
import ExampleSentence from "./ExampleSentence";

export default function QuestionCard({
  q,
  onCheckAnswer,
  result,
  onNext,
  speak,
}) {
  const [showHiragana, setShowHiragana] = useState(false);

  // 每次 q 改變時，重置平假名為隱藏
  useEffect(() => {
    setShowHiragana(false);
  }, [q]);

  return (
    <div>
      {q.kanji_jp_word && (
        <div style={{ marginBottom: 5 }}>
          <button
            onClick={() => setShowHiragana((prev) => !prev)}
            style={{ fontSize: 14, marginRight: 8 }}
          >
            {showHiragana ? "◀️ 平" : "▶️ 平"}
          </button>
          {showHiragana && (
            <span style={{ fontSize: 20, fontWeight: "bold" }}>
              {q.jp_word}
            </span>
          )}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {q.kanji_jp_word ? (
          <span style={{ fontSize: 20 }}>{q.kanji_jp_word}</span>
        ) : (
          <span style={{ fontSize: 20 }}>{q.jp_word}</span>
        )}
        <span
          onClick={() => speak(q.jp_word)}
          style={{ cursor: "pointer", fontSize: 20 }}
        >
          🔊
        </span>
      </div>

      <div>
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => onCheckAnswer(opt)}
            style={{ margin: 5 }}
          >
            {opt}
          </button>
        ))}
      </div>
      <hr />
      {result && (
        <div style={{ marginTop: 10 }}>
          <p>{result}</p>
          <p>詞性：{q.type}</p>
          <ExampleSentence
            jp_ex={q.jp_ex_statement}
            ch_ex={q.ch_ex_statement}
            speak={speak}
          />
          <button onClick={onNext} style={{ marginTop: 10 }}>
            下一題
          </button>
        </div>
      )}
    </div>
  );
}
