import React, { useState, useEffect } from "react";
import { useApp } from "../../../../store/contexts/AppContext"; // Changed from useQuiz
import {
  checkAnswer,
  nextQuestionGame,
} from "../../../../pages/quiz/reducer/actions"; // Import quiz actions
import {
  updatePendingProficiency,
  updateWordInNotebook,
} from "../../../../store/reducer/actions"; // Import actions
import notebookService from "../../../../services/notebookService";
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
  ProficiencyControlsContainer,
  TinyButton,
} from "./styles";
import ExampleSentence from "../ExampleSentence";

export default function QuestionCard({
  speakManually,
  question,
  cancelPlayback,
}) {
  const { state, dispatch } = useApp(); // Changed from useQuiz
  const { questions, currentQuestionIndex, selectedAnswer, result } =
    state.quiz;
  const { pendingProficiencyUpdates } = state.shared;
  const { wordType } = state.systemSettings;
  const q = questions[currentQuestionIndex];

  const [showHiragana, setShowHiragana] = useState(false);
  const [isBug, setIsBug] = useState(() =>
    question ? !!question.word_bug : false
  );

  useEffect(() => {
    setIsBug(question ? !!question.word_bug : false);
  }, [question?.id, question?.word_bug]);

  useEffect(() => {
    setShowHiragana(false);
    if (q && q.jp_word) {
      speakManually(q.jp_word, "ja");
    }
  }, [q, speakManually]);

  // controls moved out of the card

  const handleCheckAnswer = (answer) => {
    dispatch(checkAnswer(answer));
  };

  const handleNextQuestion = () => {
    cancelPlayback();
    dispatch(nextQuestionGame());
  };

  const handleProficiencyChange = (proficiency) => {
    dispatch(updatePendingProficiency(question.id, proficiency));
  };

  // removed proficiency and bug controls here

  return (
    <CardContainer>
      {/* 熟練度控制 - 左上角 */}
      {question && (
        <ProficiencyControlsContainer>
          <TinyButton
            className={
              (state.shared.pendingProficiencyUpdates[question.id] ||
                question.proficiency) === 1
                ? "active"
                : ""
            }
            onClick={(e) => {
              e.stopPropagation();
              dispatch(updatePendingProficiency(question.id, 1));
            }}
            title="設為低熟練度"
          >
            低
          </TinyButton>
          <TinyButton
            className={
              (state.shared.pendingProficiencyUpdates[question.id] ||
                question.proficiency) === 2
                ? "active"
                : ""
            }
            onClick={(e) => {
              e.stopPropagation();
              dispatch(updatePendingProficiency(question.id, 2));
            }}
            title="設為中熟練度"
          >
            中
          </TinyButton>
          <TinyButton
            className={
              (state.shared.pendingProficiencyUpdates[question.id] ||
                question.proficiency) === 3
                ? "active"
                : ""
            }
            onClick={(e) => {
              e.stopPropagation();
              dispatch(updatePendingProficiency(question.id, 3));
            }}
            title="設為高熟練度"
          >
            高
          </TinyButton>
          <TinyButton
            className={isBug ? "active" : ""}
            onClick={async (e) => {
              e.stopPropagation();
              try {
                const nbId = state.shared.currentNotebookId;
                const newVal = !isBug;
                setIsBug(newVal); // optimistic
                await notebookService.updateWordInNotebook(nbId, question.id, {
                  word_bug: newVal,
                });
                dispatch(
                  updateWordInNotebook(nbId, question.id, {
                    word_bug: newVal,
                  })
                );
              } catch (e) {
                console.error("toggle bug (QuestionCard) failed", e);
                setIsBug((prev) => !prev); // revert on failure
              }
            }}
            title="標記為錯誤/取消"
          >
            錯
          </TinyButton>
        </ProficiencyControlsContainer>
      )}

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
      {!result && (
        <OptionsContainer>
          {q.options.map((opt, i) => (
            <OptionButton key={i} onClick={() => handleCheckAnswer(opt)}>
              {opt}
            </OptionButton>
          ))}
        </OptionsContainer>
      )}

      {result && (
        <ResultContainer>
          <SubCard>
            <AnswerText correct={result === "⭕"}>
              {q.ch_word} [{q.type}]
            </AnswerText>
            <AnswerText correct={result === "⭕"}>
              {selectedAnswer} {result}
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
