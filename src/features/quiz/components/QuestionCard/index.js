import React, { useState, useEffect, useCallback } from "react";
import { useQuiz } from "../../../../contexts/QuizContext";
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
} from "./styles";
import ExampleSentence from "../ExampleSentence";
import AnswerSound from "../AnswerSound";

// Note: This component no longer receives props. It gets everything from context.
export default function QuestionCard({ speakManually }) {
  const { state, dispatch } = useQuiz();
  const {
    questions,
    currentQuestionIndex,
    selectedAnswer,
    result,
  } = state;
  const q = questions[currentQuestionIndex];

  const [showHiragana, setShowHiragana] = useState(false);

  useEffect(() => {
    setShowHiragana(false);
  }, [q]);

  const handleCheckAnswer = (answer) => {
    dispatch({ type: "CHECK_ANSWER", payload: answer });
  };

  const handleNextQuestion = () => {
    dispatch({ type: "NEXT_QUESTION" });
  };

  

  return (
    <CardContainer>
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
            <AnswerText correct={result === "✅"}>{q.ch_word}</AnswerText>
            <AnswerText correct={result === "✅"}>
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
