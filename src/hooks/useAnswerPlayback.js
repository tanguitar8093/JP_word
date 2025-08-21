import { speakSequential } from "../services/speechService";
import correctSound from "../assets/sounds/correct.mp3";
import wrongSound from "../assets/sounds/wrong.mp3";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export function useAnswerPlayback({ rate, pitch, voice, options }) {
  const EFFECTS = {
    correct: correctSound,
    wrong: wrongSound,
  };

  const playAnswerEffect = (result) => {
    const key = result === "✅" ? "correct" : "wrong";
    const audio = new Audio(EFFECTS[key]);
    audio.preload = "auto";

    return new Promise((resolve) => {
      audio.onended = resolve;
      audio.onerror = resolve;

      try {
        audio.play();
      } catch {
        resolve();
      }
    });
  };

  const playAfterResult = async (result, q) => {
    if (!voice) return;

    // 1) 答題音效
    await playAnswerEffect(result);

    // 2) 間隔
    await delay(200);

    // 3) 語音播放
    const steps = [];
    if (options?.jp)
      steps.push({ text: q.jp_word, options: { voice, lang: "ja-JP" } });
    if (options?.ch)
      steps.push({ text: q.ch_word, options: { lang: "zh-CN" } });
    if (options?.jpEx)
      steps.push({
        text: q.jp_ex_statement,
        options: { voice, lang: "ja-JP" },
      });
    if (options?.chEx)
      steps.push({ text: q.ch_ex_statement, options: { lang: "zh-CN" } }); // 新增中文例句

    await speakSequential(steps, { rate, pitch });
  };

  return { playAfterResult };
}
