import React, { useState } from "react";
import {
  AppContainer,
  Title,
  Progress,
  SettingsToggle,
  FloatingSettingsPanel,
} from "./styles";
import QuestionCard from "../QuestionCard";
import SettingsPanel from "../SettingsPanel";
import { useAnswerPlayback } from "../../hooks/useAnswerPlayback";
import { useQuizGame } from "../../hooks/useQuizGame";

export default function App() {
  const [rate, setRate] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackOptions, setPlaybackOptions] = useState({
    jp: true,
    ch: true,
    jpEx: false,
    chEx: false,
    autoNext: true,
  });

  const {
    current,
    question,
    result,
    selectedAnswer,
    totalQuestions,
    checkAnswer,
    next,
  } = useQuizGame();

  const { speakManually } = useAnswerPlayback({
    result,
    question,
    onNext: next,
    playbackOptions,
    rate,
  });

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
        第 {current + 1} 題 / 共 {totalQuestions} 題
      </Progress>

      <QuestionCard
        q={question}
        onCheckAnswer={checkAnswer}
        result={result}
        onNext={next}
        selectedAnswer={selectedAnswer}
        speakManually={speakManually}
      />
    </AppContainer>
  );
}
