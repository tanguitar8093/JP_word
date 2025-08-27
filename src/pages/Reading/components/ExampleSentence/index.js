import { Container, LabelRow, TextRow, SpeakButton } from "./styles";

export default function ExampleSentence({
  jp_ex,
  ch_ex,
  speak,
  jp_ex_context,
  wordType,
}) {
  return (
    <Container>
      <LabelRow>例句（日）:</LabelRow>
      <TextRow>
        {wordType == "jp_context" &&
          jp_ex_context.map((part, index) =>
            part.kanji ? (
              <ruby key={index}>
                {part.kanji}
                <rt>{part.hiragana}</rt>
              </ruby>
            ) : (
              <span key={index}>{part.hiragana}</span>
            )
          )}
        {wordType != "jp_context" && <span>{jp_ex}</span>}
        <SpeakButton onClick={() => speak(jp_ex, "ja")}>🔊</SpeakButton>
      </TextRow>
      <LabelRow>{ch_ex}</LabelRow>
    </Container>
  );
}
