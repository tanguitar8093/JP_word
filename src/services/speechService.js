import { Capacitor } from "@capacitor/core";
// TextToSpeech 插件（原生）
// 安裝套件後可用：@capacitor-community/text-to-speech
import { TextToSpeech } from "@capacitor-community/text-to-speech";

let voices = [];
let onVoicesLoaded = [];

const isNative = Capacitor?.isNativePlatform?.() === true;

const isSpeechSupported =
  !isNative &&
  typeof window !== "undefined" &&
  "speechSynthesis" in window &&
  typeof window.SpeechSynthesisUtterance !== "undefined";

if (isSpeechSupported) {
  window.speechSynthesis.onvoiceschanged = () => {
    voices = window.speechSynthesis.getVoices();
    onVoicesLoaded.forEach((cb) => cb());
    onVoicesLoaded = [];
  };
}

const getVoices = () => {
  if (!isSpeechSupported) return Promise.resolve([]);
  if (voices.length > 0) {
    return Promise.resolve(voices);
  }
  voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    return Promise.resolve(voices);
  }
  return new Promise((resolve) => {
    onVoicesLoaded.push(() => resolve(window.speechSynthesis.getVoices()));
  });
};

const getVoice = (lang, loadedVoices) => {
  if (!loadedVoices || loadedVoices.length === 0) return null;
  if (lang && lang.startsWith("ja")) {
    return loadedVoices.find(
      (v) => v.name === "Google 日本語" && v.lang === "ja-JP"
    );
  }
  if (lang && lang.startsWith("zh")) {
    return loadedVoices.find(
      (v) => v.name === "Google 國語（臺灣）" && v.lang === "zh-TW"
    );
  }
  return null;
};

export const speak = async (text, { rate = 1.0, lang } = {}) => {
  if (!text) return Promise.resolve();

  // 原生：使用 TextToSpeech 插件
  if (isNative && typeof TextToSpeech?.speak === "function") {
    try {
      await TextToSpeech.speak({
        text,
        rate,
        locale: lang || "",
        pitch: 1.0,
        volume: 1.0,
        category: "ambient",
      });
      return;
    } catch (_) {
      // 原生 TTS 失敗時，安靜退回
      return;
    }
  }

  // Web：使用 speechSynthesis
  if (!isSpeechSupported) return Promise.resolve();
  const loadedVoices = await getVoices();
  return new Promise((resolve) => {
    const msg = new SpeechSynthesisUtterance(text);
    msg.voice = getVoice(lang || "", loadedVoices);
    if (lang) msg.lang = lang;
    msg.rate = rate;
    msg.onend = resolve;
    try {
      window.speechSynthesis.speak(msg);
    } catch (_) {
      resolve();
    }
  });
};