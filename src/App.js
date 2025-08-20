import React, { useState, useEffect } from "react";
import {
  AppContainer,
  Title,
  Progress,
  SettingsToggle,
  FloatingSettingsPanel
} from "./styled/App";
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
  const [answer, setAnswer] = useState("");

  const q = questions[current];

  // 載入 voices，並初始選擇 Google 日本語
  useEffect(() => {
    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const v = synth.getVoices().filter((voice) => voice.lang.startsWith("ja"));
      if (v.length > 0) {
        setVoices(v);

        if (!selectedVoice) {
          const googleVoice = v.find(
            (voice) => voice.name === "Google 日本語" && voice.lang === "ja-JP"
          );
          setSelectedVoice(googleVoice || v[0]);
        }
      }
    };

    loadVoices();
    synth.onvoiceschanged = loadVoices;
  }, [selectedVoice]);

  const handleSpeak = (text) => {
    if (!selectedVoice) return;
    speak(text, { rate, pitch, voice: selectedVoice });
  };

  const checkAnswer = (answer) => {
    setAnswer(answer);
    setResult(answer === q.ch_word ? "✅" : "❌");
  };

  const next = () => {
    setResult(null);
    setCurrent((prev) => (prev + 1) % questions.length);
  };

  return (
    <AppContainer>
      {/* 設定懸浮視窗 */}
      <SettingsToggle onClick={() => setShowSettings((s) => !s)}>
        ⚙️
      </SettingsToggle>
      {showSettings && voices.length > 0 && (
        <FloatingSettingsPanel>
          <SettingsPanel
            rate={rate}
            setRate={setRate}
            pitch={pitch}
            setPitch={setPitch}
            voices={voices}
            selectedVoice={selectedVoice}
            setSelectedVoice={setSelectedVoice}
          />
        </FloatingSettingsPanel>
      )}

      <Title>日文單字測驗</Title>
      <Progress>
        第 {current + 1} 題 / 共 {questions.length} 題
      </Progress>

      <QuestionCard
        q={q}
        onCheckAnswer={checkAnswer}
        result={result}
        onNext={next}
        speak={handleSpeak}
        selectedAnswer={answer}
      />
    </AppContainer>
  );
}
