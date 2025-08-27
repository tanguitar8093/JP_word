import { useCallback, useEffect, useRef } from "react";
import correctSound from "../assets/sounds/correct.mp3";
import wrongSound from "../assets/sounds/wrong.mp3";
import { speak } from "../services/speechService";

export function useAnswerPlayback({
  result,
  question,
  onNext,
  playbackOptions,
  rate,
  autoProceed,
}) {
  const playedForResult = useRef(false);
  const playbackRef = useRef(null);

  // Reset played flag when question changes
  useEffect(() => {
    playedForResult.current = false;
  }, [question]);

  const cancelPlayback = useCallback(() => {
    console.log("???");
    window.speechSynthesis.cancel();
    if (playbackRef.current) {
      console.log("!!!");
      playbackRef.current.cancelled = true;
    }
  }, []);

  // Cleanup function for speech synthesis on unmount
  useEffect(() => {
    return () => {
      cancelPlayback();
    };
  }, [cancelPlayback]);

  // Also cancel speech if result or question changes to prevent overlapping speech
  useEffect(() => {
    cancelPlayback();
  }, [result, question, cancelPlayback]);

  const speakText = useCallback(
    (text, lang) => {
      return speak(text, { rate, lang });
    },
    [rate]
  );

  const playSound = (soundResult) =>
    new Promise((resolve) => {
      const audio = new Audio(soundResult === "⭕" ? correctSound : wrongSound);
      audio.onended = resolve;
      audio.play();
    });

  const playSequence = useCallback(
    async (soundResult, q, options, { skipSound = false } = {}) => {
      if (!q) return;
      // Cancel any ongoing speech before starting a new sequence
      window.speechSynthesis.cancel();

      if (!skipSound && soundResult) {
        await playSound(soundResult);
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

  // Main effect to handle the flow after an answer is given
  useEffect(() => {
    if (!result || playedForResult.current) return;

    const run = async () => {
      playedForResult.current = true;
      const playbackId = { cancelled: false };
      playbackRef.current = playbackId;

      await playSequence(result, question, playbackOptions);

      if (playbackRef.current === playbackId && !playbackId.cancelled) {
        if (autoProceed) {
          // Use autoProceed here
          onNext();
        }
      }
      playbackRef.current = null;
    };
    run();
  }, [result, question, playbackOptions, onNext, playSequence, autoProceed]); // Add autoProceed to dependencies

  return { playSequence, cancelPlayback };
}
