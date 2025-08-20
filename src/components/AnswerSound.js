import { useEffect } from "react";
import correctAudioFile from "../sounds/correct.mp3";
import wrongAudioFile from "../sounds/wrong.mp3";

export default function AnswerSound({ result }) {
  useEffect(() => {
    if (!result) return;

    const audio = new Audio(result === "✅" ? correctAudioFile : wrongAudioFile);
    audio.play();
  }, [result]);

  return null;
}
