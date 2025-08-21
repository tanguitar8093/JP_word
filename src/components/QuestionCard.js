import React, { useState, useEffect } from "react";
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
} from "../styled/QuestionCard";
import ExampleSentence from "./ExampleSentence";
import AnswerSound from "./AnswerSound";
export default function QuestionCard({
  q,
  onCheckAnswer,
  result,
  onNext,
  speak,
  selectedAnswer,
}) {
  const [showHiragana, setShowHiragana] = useState(false);

  useEffect(() => {
    setShowHiragana(false);
  }, [q]);

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
        <SpeakButton onClick={() => speak(q.jp_word)}>🔊</SpeakButton>
      </WordContainer>

      {!result && (
        <OptionsContainer>
          {q.options.map((opt, i) => (
            <OptionButton key={i} onClick={() => onCheckAnswer(opt)}>
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
            speak={speak}
          />
          <NextButton onClick={onNext}>下一題</NextButton>
          <AnswerSound result={result} />
        </ResultContainer>
      )}
    </CardContainer>
  );
}
