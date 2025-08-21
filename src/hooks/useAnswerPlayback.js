import correctSound from "../assets/sounds/correct.mp3";
import wrongSound from "../assets/sounds/wrong.mp3";

export function useAnswerPlayback({ rate, pitch, voices }) {
  // 固定 Google 日文 / 中文
  const getVoice = (lang) => {
    if (lang.startsWith("ja")) {
      return voices.find(
        (v) => v.name === "Google 日本語" && v.lang === "ja-JP"
      );
    }
    if (lang.startsWith("zh")) {
      return voices.find(
        (v) => v.name === "Google 國語（臺灣）" && v.lang === "zh-TW"
      );
    }
    return null;
  };

  // 播放單個文字
  const speakText = (text, lang) =>
    new Promise((resolve) => {
      if (!text) return resolve();

      const msg = new SpeechSynthesisUtterance(text);
      msg.voice = getVoice(lang);
      msg.lang = lang;
      msg.rate = rate;
      msg.pitch = pitch;
      msg.onend = resolve;

      speechSynthesis.speak(msg);
    });

  // 播放音效
  const playSound = (result) =>
    new Promise((resolve) => {
      const audio = new Audio(result === "✅" ? correctSound : wrongSound);
      audio.onended = resolve;
      audio.play();
    });

  // 播放結果對應語音
  const playAfterResult = async (
    result,
    q,
    options,
    { skipSound = false } = {}
  ) => {
    if (!q) return;

    // 先播音效（只有作答結果且 skipSound 為 false 才播）
    if (!skipSound && result) {
      await playSound(result);
    }

    // 依播放選項順序播語音
    if (options.jp && q.jp_word) await speakText(q.jp_word, "ja-JP");
    if (options.ch && q.ch_word) await speakText(q.ch_word, "zh-TW");
    if (options.jpEx && q.jp_ex_statement)
      await speakText(q.jp_ex_statement, "ja-JP");
    if (options.chEx && q.ch_ex_statement)
      await speakText(q.ch_ex_statement, "zh-TW");
  };

  return { speakText, playAfterResult };
}
