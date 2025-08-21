import {
  Container,
  LabelRow,
  TextRow,
  SpeakButton,
} from "../styled/ExampleSentence";

export default function ExampleSentence({ jp_ex, ch_ex, speak }) {
  return (
    <Container>
      <LabelRow>例句（日）:</LabelRow>
      <TextRow>
        {jp_ex}
        <SpeakButton onClick={() => speak(jp_ex, "ja")}>🔊</SpeakButton>
      </TextRow>
      <LabelRow>{ch_ex}</LabelRow>
    </Container>
  );
}
