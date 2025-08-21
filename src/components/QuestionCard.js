import React, { useState, useEffect, useRef } from "react";
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
  selectedAnswer,
  autoNext,
  playbackOptions,
  rate,
  playAfterResult,
}) {
  const [showHiragana, setShowHiragana] = useState(false);
  const playedForResult = useRef(false);

  useEffect(() => {
    setShowHiragana(false);
    playedForResult.current = false;
  }, [q]);

  useEffect(() => {
    if (!result || playedForResult.current) return;

    const run = async () => {
      playedForResult.current = true;
      await playAfterResult(result, q, playbackOptions); // 自動播放結果含音效
      if (autoNext) {
        onNext();
      }
    };
    run();
  }, [result, autoNext, onNext, q, playAfterResult, playbackOptions]);

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
        <SpeakButton
          onClick={async () => {
            await playAfterResult(
              null,
              { jp_word: q.jp_word },
              { jp: true },
              { skipSound: true } // 單播單字不播音效
            );
          }}
        >
          🔊
        </SpeakButton>
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
            speak={async (text, lang) => {
              if (lang === "ja")
                await playAfterResult(
                  null,
                  { jp_ex_statement: text },
                  { jpEx: true },
                  { skipSound: true }
                );
              if (lang === "zh")
                await playAfterResult(
                  null,
                  { ch_ex_statement: text },
                  { chEx: true },
                  { skipSound: true }
                );
            }}
          />
          <NextButton onClick={onNext}>下一題</NextButton>
          <AnswerSound result={result} />
        </ResultContainer>
      )}
    </CardContainer>
  );
}
