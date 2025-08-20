import React from "react";

export default function ExampleSentence({ jp_ex, ch_ex, speak }) {
  return (
    <div style={{ marginTop: 10 }}>
      <p>
        例句（日）：{jp_ex}{" "}
        <span
          onClick={() => speak(jp_ex)}
          style={{ cursor: "pointer", fontSize: "18px" }}
        >
          🔊
        </span>
      </p>
      <p>例句（中）：{ch_ex}</p>
    </div>
  );
}
