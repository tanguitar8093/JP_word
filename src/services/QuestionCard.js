import React from "react";
import ExampleSentence from "./ExampleSentence";

export default function QuestionCard({
  q,
  onCheckAnswer,
  result,
  onNext,
  speak,
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "20px" }}>{q.jp_word}</span>
        <span
          onClick={() => speak(q.jp_word)}
          style={{ cursor: "pointer", fontSize: "20px" }}
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
