import React, { useState, useEffect, forwardRef } from "react";
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
import AudioRecorderPage from "../../../AudioRecorder";

const ReadingCard = forwardRef(({ speakManually, question }, ref) => {
  const { state, dispatch } = useApp(); // Changed from useQuiz
  const { questions, currentQuestionIndex, selectedAnswer, result } =
    state.quiz;
  const { pendingProficiencyUpdates } = state.shared;
  const { wordType } = state.systemSettings;
  const q = questions[currentQuestionIndex];

  const [showHiragana, setShowHiragana] = useState(false);

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
        {wordType == "jp_context" && (
          <span>
            {q.jp_context.map((part, index) =>
              part.kanji ? (
                <ruby key={index}>
                  {part.kanji}
                  <rt>{part.hiragana}</rt>
                </ruby>
              ) : (
                <span key={index}>{part.hiragana}</span>
              )
            )}
          </span>
        )}
        <SpeakButton onClick={() => speakManually(q.jp_word, "ja")}>
          🔊
        </SpeakButton>
      </WordContainer>
      <AudioRecorderPage ref={ref} triggerReset={currentQuestionIndex} />

      <ResultContainer>
        <SubCard>
          <AnswerText correct={result === "⭕"}> 
            {q.ch_word} [{q.type}]
          </AnswerText>
        </SubCard>
        <ExampleSentence
          jp_ex={q.jp_ex_statement}
          ch_ex={q.ch_ex_statement}
          speak={speakManually}
        />
        <NextButton onClick={handleNextQuestion}>下一題</NextButton>
      </ResultContainer>
    </CardContainer>
  );
});

export default ReadingCard;
