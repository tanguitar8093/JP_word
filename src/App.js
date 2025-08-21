import React, { useState, useEffect } from "react";
import {
  AppContainer,
  Title,
  Progress,
  SettingsToggle,
  FloatingSettingsPanel,
} from "./styled/App";
import { questions } from "./data/questions";
import QuestionCard from "./components/QuestionCard";
import SettingsPanel from "./components/SettingsPanel";
import { useAnswerPlayback } from "./hooks/useAnswerPlayback";

export default function App() {
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState(null);
  const [rate, setRate] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const [answer, setAnswer] = useState("");

  const [playbackOptions, setPlaybackOptions] = useState({
    jp: true,
    ch: true,
    jpEx: false,
    chEx: false,
    autoNext: true,
  });

  const q = questions[current];

  const { playAfterResult } = useAnswerPlayback({
    rate,
  });

  const checkAnswer = (answer) => {
    setAnswer(answer);
    setResult(answer === q.ch_word ? "✅" : "❌");
  };

  const next = () => {
    setResult(null);
    setCurrent((prev) => (prev + 1) % questions.length);
    setAnswer("");
  };

  return (
    <AppContainer>
      <SettingsToggle onClick={() => setShowSettings((s) => !s)}>
        ⚙️
      </SettingsToggle>
      {showSettings && (
        <FloatingSettingsPanel>
          <SettingsPanel
            rate={rate}
            setRate={setRate}
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
        selectedAnswer={answer}
        autoNext={playbackOptions.autoNext}
        playbackOptions={playbackOptions}
        rate={rate}
        playAfterResult={playAfterResult}
      />
    </AppContainer>
  );
}
