import {
  Container,
  LabelRow,
  TextRow,
  SpeakButton,
  ToggleRow,
  ToggleButton,
} from "./styles";
import React from "react";

export default function ExampleSentence({
  jp_ex,
  ch_ex,
  speak,
  jp_ex_context,
}) {
  const [showContext, setShowContext] = React.useState(true);
  const hasContext = Array.isArray(jp_ex_context) && jp_ex_context.length > 0;

  return (
    <Container>
      <LabelRow>
        例句:
        {hasContext && (
          <ToggleRow>
            <ToggleButton onClick={() => setShowContext((v) => !v)}>
              {showContext ? "🔽標註" : "▶️標註"}
            </ToggleButton>
          </ToggleRow>
        )}
      </LabelRow>
      <TextRow>
        {showContext &&
          jp_ex_context?.map((part, index) =>
            part.kanji ? (
              <ruby key={index}>
                {part.kanji}
                <rt>{part.hiragana}</rt>
              </ruby>
            ) : (
              <span key={index}>{part.hiragana}</span>
            )
          )}
        {!showContext && <span>{jp_ex}</span>}
        <SpeakButton onClick={() => speak(jp_ex, "ja")}>🔊</SpeakButton>
      </TextRow>
      <LabelRow>{ch_ex}</LabelRow>
    </Container>
  );
}
