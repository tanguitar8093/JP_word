import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "../../../../store/contexts/AppContext"; // Changed from useQuiz
import {
  checkAnswer,
  nextQuestionGame,
} from "../../../../pages/quiz/reducer/actions"; // Import quiz actions
import { updatePendingProficiency } from "../../../../store/reducer/actions"; // Import updatePendingProficiency
import {
  CardContainer,
  HiraganaToggleContainer,
  HiraganaTextContainer,
  ToggleButton,
  HiraganaText,
  WordContainer,
  SpeakButton,
  OptionsContainer,
  OptionButton,
  ResultContainer,
  AnswerText,
  NextButton,
  SubCard,
  ProficiencyControlContainer,
  ProficiencyButton,
} from "./styles";
import ExampleSentence from "../ExampleSentence";
import AnswerSound from "../AnswerSound";
import AudioRecorderPage from '../../../AudioRecorder'

// Note: This component no longer receives props. It gets everything from context.
export default function QuestionCard({ speakManually, question }) {
  const { state, dispatch } = useApp(); // Changed from useQuiz
  const { questions, currentQuestionIndex, selectedAnswer, result } =
    state.quiz; // Access quiz state
  const { pendingProficiencyUpdates } = state.shared; // Get pendingProficiencyUpdates
  const q = questions[currentQuestionIndex];

  console.log("QuestionCard - question.id:", question.id); // Add this log

  const [showHiragana, setShowHiragana] = useState(false);

  useEffect(() => {
    setShowHiragana(false);
  }, [q]);


  const handleCheckAnswer = (answer) => {
    dispatch(checkAnswer(answer)); // Changed dispatch type
  };

  const handleNextQuestion = () => {
    dispatch(nextQuestionGame()); // Changed dispatch type
  };

  const handleProficiencyChange = (proficiency) => { // Removed wordId from params, use question.id directly
    dispatch(updatePendingProficiency(question.id, proficiency)); // Dispatch to pending updates
  };

  // Determine the current proficiency to highlight the button
  const currentProficiency = pendingProficiencyUpdates[question.id] || question.proficiency;

  return (
    <CardContainer>
      {/* Replace ProficiencyBadge with buttons */}
      <ProficiencyControlContainer>
        <ProficiencyButton
          className={currentProficiency === 1 ? 'active' : ''}
          onClick={() => handleProficiencyChange(1)}>低</ProficiencyButton>
        <ProficiencyButton
          className={currentProficiency === 2 ? 'active' : ''}
          onClick={() => handleProficiencyChange(2)}>中</ProficiencyButton>
        <ProficiencyButton
          className={currentProficiency === 3 ? 'active' : ''}
          onClick={() => handleProficiencyChange(3)}>高</ProficiencyButton>
      </ProficiencyControlContainer>

      {q.kanji_jp_word && (
        <>
          <HiraganaToggleContainer>
            <ToggleButton onClick={() => setShowHiragana((prev) => !prev)}>
              {showHiragana ? "🔽 平" : "▶️ 平"}
            </ToggleButton>
          </HiraganaToggleContainer>
          {showHiragana && (
            <HiraganaTextContainer>
              <HiraganaText>{q.jp_word}</HiraganaText>
            </HiraganaTextContainer>
          )}
        </>
      )}

      <WordContainer>
        <span>{q.kanji_jp_word || q.jp_word}</span>
        <SpeakButton onClick={() => speakManually(q.jp_word, "ja")}>
          🔊
        </SpeakButton>
      </WordContainer>
      <AudioRecorderPage triggerReset={currentQuestionIndex}/>
      {!result && (
        <OptionsContainer>
          {q.options.map((opt, i) => (
            <OptionButton key={i} onClick={() => 
              handleCheckAnswer(opt)
              }>
              {opt}
            </OptionButton>
          ))}
        </OptionsContainer>
      )}

      {result && (
        <ResultContainer>
          <SubCard>
            <AnswerText correct={result === "⭕"}>{q.ch_word}</AnswerText>
            <AnswerText correct={result === "⭕"}>
              {selectedAnswer} {result}
            </AnswerText>
          </SubCard>
          <SubCard>
            <div>詞性：{q.type}</div>
          </SubCard>
          <ExampleSentence
            jp_ex={q.jp_ex_statement}
            ch_ex={q.ch_ex_statement}
            speak={speakManually}
          />
          <NextButton onClick={handleNextQuestion}>下一題</NextButton>
          <AnswerSound result={result} />
        </ResultContainer>
      )}
    </CardContainer>
  );
}
