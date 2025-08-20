import React, { useState, useEffect } from "react";
import { questions } from "./data/questions";
import { speak } from "./services/speechService";
import QuestionCard from "./components/QuestionCard";
import SettingsPanel from "./components/SettingsPanel";

export default function App() {
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState(null);
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const q = questions[current];

  // 載入 voices，並初始選擇 Google 日本語
  useEffect(() => {
    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const v = synth
        .getVoices()
        .filter((voice) => voice.lang.startsWith("ja"));
      if (v.length > 0) {
        setVoices(v);

        // 只在 selectedVoice 為 null 時設定預設
        if (!selectedVoice) {
          const googleVoice = v.find(
            (voice) => voice.name === "Google 日本語" && voice.lang === "ja-JP"
          );
          setSelectedVoice(googleVoice || v[0]);
        }
      }
    };

    // 嘗試立即加載
    loadVoices();

    // voices 改變事件
    synth.onvoiceschanged = loadVoices;
  }, [selectedVoice]);

  const handleSpeak = (text) => {
    if (!selectedVoice) return;
    speak(text, { rate, pitch, voice: selectedVoice });
  };

  const checkAnswer = (answer) => {
    setResult(answer === q.ch_word ? "正確 ✅" : "錯誤 ❌");
  };

  const next = () => {
    setResult(null);
    setCurrent((prev) => (prev + 1) % questions.length);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>日文單字小測驗</h2>
      <p>
        第 {current + 1} 題 / 共 {questions.length} 題
      </p>
      <hr />
      <QuestionCard
        q={q}
        onCheckAnswer={checkAnswer}
        result={result}
        onNext={next}
        speak={handleSpeak}
      />
      <hr />
      <div style={{ marginTop: 20 }}>
        <span
          style={{ cursor: "pointer", fontSize: "18px" }}
          onClick={() => setShowSettings((s) => !s)}
        >
          ⚙️ 設定
        </span>

        {showSettings && voices.length > 0 && (
          <SettingsPanel
            rate={rate}
            setRate={setRate}
            pitch={pitch}
            setPitch={setPitch}
            voices={voices}
            selectedVoice={selectedVoice}
            setSelectedVoice={setSelectedVoice}
          />
        )}
      </div>
    </div>
  );
}
