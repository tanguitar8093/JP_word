import { useCallback } from "react";
import correctSound from "../assets/sounds/correct.mp3";
import wrongSound from "../assets/sounds/wrong.mp3";
import { speak } from "../services/speechService";

export function useAnswerPlayback({ rate }) {
  const speakText = useCallback(
    (text, lang) => {
      return speak(text, { rate, lang });
    },
    [rate]
  );

  const playSound = (result) =>
    new Promise((resolve) => {
      const audio = new Audio(result === "✅" ? correctSound : wrongSound);
      audio.onended = resolve;
      audio.play();
    });

  const playAfterResult = useCallback(
    async (result, q, options, { skipSound = false } = {}) => {
      if (!q) return;

      if (!skipSound && result) {
        await playSound(result);
      }

      if (options.jp && q.jp_word) await speakText(q.jp_word, "ja-JP");
      if (options.ch && q.ch_word) await speakText(q.ch_word, "zh-TW");
      if (options.jpEx && q.jp_ex_statement)
        await speakText(q.jp_ex_statement, "ja-JP");
      if (options.chEx && q.ch_ex_statement)
        await speakText(q.ch_ex_statement, "zh-TW");
    },
    [speakText]
  );

  return { playAfterResult };
}
