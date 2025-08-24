import React, { useState, useEffect } from "react";
import { useApp } from "../../../../store/contexts/AppContext"; // Changed from useQuiz
import { checkAnswer, nextQuestionGame } from "../../../quiz/reducer/actions"; // Import quiz actions
import { updatePendingProficiency } from "../../../../store/reducer/actions"; // Import updatePendingProficiency
import {
  CardContainer,
  HiraganaToggleContainer,
  HiraganaTextContainer,
  ToggleButton,
  HiraganaText,
  WordContainer,
  SpeakButton,
  ResultContainer,
  AnswerText,
  NextButton,
  SubCard,
  ProficiencyControlContainer,
  ProficiencyButton,
} from "./styles";
import ExampleSentence from "../ExampleSentence";
import AnswerSound from "../AnswerSound";
import AudioRecorderPage from "../../../AudioRecorder";

export default function QuestionCard({ speakManually, question }) {
  const { state, dispatch } = useApp(); // Changed from useQuiz
  const { questions, currentQuestionIndex, result } = state.quiz;
  const { pendingProficiencyUpdates } = state.shared;
  const { wordType } = state.systemSettings;
  const q = questions[currentQuestionIndex];

  const [showHiragana, setShowHiragana] = useState(false);
  const [showInfo, setInfo] = useState(false);
  useEffect(() => {
    setShowHiragana(false);
  }, [q]);

  const handleCheckAnswer = (answer) => {
    dispatch(checkAnswer(answer));
  };

  const handleNextQuestion = () => {
    dispatch(nextQuestionGame());
  };

  const handleProficiencyChange = (proficiency) => {
    dispatch(updatePendingProficiency(question.id, proficiency));
  };

  const currentProficiency =
    pendingProficiencyUpdates[question.id] || question.proficiency;

  return (
    <CardContainer>
      {/* 熟練度 */}
      <ProficiencyControlContainer>
        <ProficiencyButton
          className={currentProficiency === 1 ? "active" : ""}
          onClick={() => handleProficiencyChange(1)}
        >
          低
        </ProficiencyButton>
        <ProficiencyButton
          className={currentProficiency === 2 ? "active" : ""}
          onClick={() => handleProficiencyChange(2)}
        >
          中
        </ProficiencyButton>
        <ProficiencyButton
          className={currentProficiency === 3 ? "active" : ""}
          onClick={() => handleProficiencyChange(3)}
        >
          高
        </ProficiencyButton>
      </ProficiencyControlContainer>

      {wordType == "jp_word" && (
        <>
          <HiraganaToggleContainer>
            <ToggleButton onClick={() => setShowHiragana((prev) => !prev)}>
              {showHiragana ? "🔽漢" : "▶️漢"}
            </ToggleButton>
          </HiraganaToggleContainer>
          {showHiragana && (
            <HiraganaTextContainer>
              <HiraganaText>{q.kanji_jp_word}</HiraganaText>
            </HiraganaTextContainer>
          )}
        </>
      )}

      {q.kanji_jp_word && wordType == "kanji_jp_word" && (
        <>
          <HiraganaToggleContainer>
            <ToggleButton onClick={() => setShowHiragana((prev) => !prev)}>
              {showHiragana ? "🔽平/片" : "▶️平/片"}
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
        {wordType == "kanji_jp_word" && (
          <span>{q.kanji_jp_word || q.jp_word}</span>
        )}
        {wordType == "jp_word" && <span>{q.jp_word}</span>}
        <SpeakButton onClick={() => speakManually(q.jp_word, "ja")}>
          🔊
        </SpeakButton>
      </WordContainer>
      <AudioRecorderPage triggerReset={currentQuestionIndex} />
      {!showInfo && (
        <NextButton
          onClick={() => {
            setInfo(true);
            speakManually(null, null, q);
          }}
        >
          顯示細節
        </NextButton>
      )}
      {showInfo && (
        <ResultContainer>
          <SubCard>
            <AnswerText correct={"⭕"}>
              {q.ch_word} [{q.type}]
            </AnswerText>
          </SubCard>
          <ExampleSentence
            jp_ex={q.jp_ex_statement}
            ch_ex={q.ch_ex_statement}
            speak={speakManually}
          />
          <NextButton onClick={() => setInfo(false)}>隱藏細節</NextButton>
        </ResultContainer>
      )}
      <NextButton onClick={handleNextQuestion}>下一題</NextButton>
    </CardContainer>
  );
}
