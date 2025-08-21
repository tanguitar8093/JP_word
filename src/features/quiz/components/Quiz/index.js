import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { QuizContext, useQuiz } from "../../../../contexts/QuizContext";
import { useQuizGame } from "../../../../hooks/useQuizGame";
import { useAnswerPlayback } from "../../../../hooks/useAnswerPlayback";
import QuestionCard from "../QuestionCard";
import SettingsPanel from "../SettingsPanel";
import StatisticsPage from '../StatisticsPage'; // Import StatisticsPage
import {
  AppContainer,
  Title,
  Progress,
  SettingsToggle,
  FloatingSettingsPanel,
} from "../../../../components/layout/App/styles";

// The actual UI component that consumes the context
function QuizContent() {
  const [rate, setRate] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackOptions, setPlaybackOptions] = useState({
    jp: true,
    ch: true,
    jpEx: false,
    chEx: false,
    autoNext: true,
  });

  // Correct: Get state and dispatch from the context using useQuiz hook
  const { state, dispatch } = useQuiz();
  const { questions, currentQuestionIndex, result } = state;
  const question = questions[currentQuestionIndex];

  const { playSequence } = useAnswerPlayback({
    result,
    question,
    onNext: () => dispatch({ type: "NEXT_QUESTION" }),
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
        第 {currentQuestionIndex + 1} 題 / 共 {questions.length} 題
      </Progress>

      {/* Pass speakManually down as it's not part of the quiz context */}
      <QuestionCard speakManually={speakManually} />
    </AppContainer>
  );
}

// The component that provides the context
export default function Quiz() {
  const { state, dispatch } = useQuizGame();

  if (state.quizCompleted) {
    return (
      <StatisticsPage
        answeredQuestions={state.answeredQuestions}
        correctAnswersCount={state.correctAnswersCount}
      />
    );
  }

  return (
    <QuizContext.Provider value={{ state, dispatch }}>
      <QuizContent />
    </QuizContext.Provider>
  );
}
