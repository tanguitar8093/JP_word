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
    if (playbackRef.current) {
      playbackRef.current.cancelled = true;
    }
    window.speechSynthesis.cancel();
  }, []);

  // Cleanup function for speech synthesis on unmount
  useEffect(() => {
    return () => {
      cancelPlayback();
    };
  }, [cancelPlayback]);

  const speakText = useCallback(
    (text, lang) => {
      return speak(text, { rate, lang });
    },
    [rate]
  );

  const playSound = useCallback((soundResult) => {
    return new Promise((resolve) => {
      const audio = new Audio(soundResult === "⭕" ? correctSound : wrongSound);
      audio.onended = resolve;
      audio.play();
    });
  }, []);

  const playSequence = useCallback(
    async (soundResult, q, options, { skipSound = false } = {}) => {
      if (!q) return;

      // Cancel any previously running sequence
      if (playbackRef.current) {
        playbackRef.current.cancelled = true;
      }

      const playbackId = { cancelled: false };
      playbackRef.current = playbackId;

      const isCancelled = () => playbackId.cancelled;

      // We still need to cancel the browser's queue
      window.speechSynthesis.cancel();

      try {
        if (isCancelled()) return;
        if (!skipSound && soundResult) await playSound(soundResult);

        if (isCancelled()) return;
        if (options.jp && q.jp_word) await speakText(q.jp_word, "ja-JP");

        if (isCancelled()) return;
        if (options.ch && q.ch_word) await speakText(q.ch_word, "zh-TW");

        if (isCancelled()) return;
        if (options.jpEx && q.jp_ex_statement)
          await speakText(q.jp_ex_statement, "ja-JP");

        if (isCancelled()) return;
        if (options.chEx && q.ch_ex_statement)
          await speakText(q.ch_ex_statement, "zh-TW");
      } finally {
        // If this sequence is still the current one, clear the ref.
        if (playbackRef.current === playbackId) {
          playbackRef.current = null;
        }
      }
    },
    [speakText, playSound]
  );

  // Main effect to handle the flow after an answer is given
  useEffect(() => {
    if (!result || playedForResult.current) return;

    const run = async () => {
      playedForResult.current = true;
      await playSequence(result, question, playbackOptions);

      // If the ref is null, our sequence finished without being interrupted.
      if (playbackRef.current === null) {
        if (autoProceed) {
          onNext();
        }
      }
    };
    run();
  }, [result, question, playbackOptions, onNext, playSequence, autoProceed]);

  return { playSequence, cancelPlayback };
}