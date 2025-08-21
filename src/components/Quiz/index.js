import React, { useState, useCallback } from "react";
import {
  AppContainer,
  Title,
  Progress,
  SettingsToggle,
  FloatingSettingsPanel,
} from "../App/styles";
import QuestionCard from "../QuestionCard";
import SettingsPanel from "../SettingsPanel";
import { useAnswerPlayback } from "../../hooks/useAnswerPlayback";
import { useQuizGame } from "../../hooks/useQuizGame";

export default function Quiz() {
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

  const { playSequence } = useAnswerPlayback({
    result,
    question,
    onNext: next,
    playbackOptions,
    rate,
  });

  const speakManually = useCallback(
    (text, lang) => {
      const options = {};
      if (lang === "ja") {
        options.jp = true;
        playSequence(null, { jp_word: text }, options, { skipSound: true });
      } else if (lang === "zh") {
        options.ch = true;
        playSequence(null, { ch_word: text }, options, { skipSound: true });
      }
    },
    [playSequence]
  );

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
