import React, { useState, useEffect, forwardRef } from "react";
import { useApp } from "../../../../store/contexts/AppContext"; // Changed from useQuiz
import { nextQuestionGame } from "../../../quiz/reducer/actions"; // Import quiz actions
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
import AudioRecorderPage from "../../../AudioRecorder";

const ReadingCard = forwardRef(
  (
    {
      speakManually,
      question,
      studyMode,
      playbackOptions,
      playSequence,
      isPaused,
    },
    ref
  ) => {
    const { state, dispatch } = useApp(); // Changed from useQuiz
    const { questions, currentQuestionIndex, result } = state.quiz;
    const { pendingProficiencyUpdates } = state.shared;
    const { wordType } = state.systemSettings;
    const q = questions[currentQuestionIndex];

    const [showHiragana, setShowHiragana] = useState(false);
    const [isAnswerVisible, setIsAnswerVisible] = useState(
      studyMode === "auto"
    );

    useEffect(() => {
      setShowHiragana(false);
      // Reset answer visibility when question changes or mode changes
      setIsAnswerVisible(studyMode === "auto");
    }, [q, studyMode]);

    const handleNextQuestion = () => {
      dispatch(nextQuestionGame());
    };

    const handleProficiencyChange = (proficiency) => {
      dispatch(updatePendingProficiency(question.id, proficiency));
    };

    const handleCardClick = async () => {
      if (studyMode === "manual" && !isAnswerVisible) {
        setIsAnswerVisible(true);
        if (studyMode === "manual") {
          // In manual mode, play sounds for the current card before moving to the next
          await playSequence(null, q, playbackOptions, { skipSound: true });
        }
      }
    };

    const currentProficiency =
      pendingProficiencyUpdates[question.id] || question.proficiency;

    if (!q) {
      return null; // Don't render if there is no question
    }

    return (
      <CardContainer
        onClick={handleCardClick}
        style={{ visibility: isPaused ? "hidden" : "visible" }}
      >
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

        {studyMode === "auto" && (
          <AudioRecorderPage ref={ref} triggerReset={currentQuestionIndex} />
        )}

        {isAnswerVisible && (
          <ResultContainer>
            <SubCard>
              <AnswerText correct>
                {q.ch_word} [{q.type}]
              </AnswerText>
            </SubCard>
            <ExampleSentence
              jp_ex={q.jp_ex_statement}
              ch_ex={q.ch_ex_statement}
              speak={speakManually}
              jp_ex_context={q.jp_ex_statement_context}
            />
            <NextButton onClick={handleNextQuestion}>下一題</NextButton>
          </ResultContainer>
        )}
      </CardContainer>
    );
  }
);

export default ReadingCard;
