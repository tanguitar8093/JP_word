import React, { useState, useEffect } from "react";
import {
  AppContainer,
  Title,
  Progress,
  SettingsToggle,
  FloatingSettingsPanel,
} from "./styled/App";
import { questions } from "./data/questions";
import { speakSequential } from "./services/speechService";
import QuestionCard from "./components/QuestionCard";
import SettingsPanel from "./components/SettingsPanel";
import { useAnswerPlayback } from "./hooks/useAnswerPlayback";

export default function App() {
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState(null);
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [answer, setAnswer] = useState("");

  const [playbackOptions, setPlaybackOptions] = useState({
    jp: true,
    ch: true,
    jpEx: true,
    chEx: true,
  });

  const q = questions[current];

  // 載入 voices
  useEffect(() => {
    const synth = window.speechSynthesis;
    const loadVoices = () => {
      const v = synth
        .getVoices()
        .filter((voice) => voice.lang.startsWith("ja"));
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

  const { playAfterResult } = useAnswerPlayback({
    rate,
    pitch,
    voice: selectedVoice,
    options: playbackOptions,
  });

  const checkAnswer = (answer) => {
    setAnswer(answer);
    setResult(answer === q.ch_word ? "✅" : "❌");
  };

  useEffect(() => {
    if (result) {
      playAfterResult(result, q);
    }
  }, [result]);

  const next = () => {
    setResult(null);
    setCurrent((prev) => (prev + 1) % questions.length);
  };

  return (
    <AppContainer>
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
            playbackOptions={playbackOptions}
            setPlaybackOptions={setPlaybackOptions}
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
        speak={(t) =>
          speakSequential(
            [{ text: t, options: { voice: selectedVoice, lang: "ja-JP" } }],
            { rate, pitch }
          )
        }
        selectedAnswer={answer}
      />
    </AppContainer>
  );
}
