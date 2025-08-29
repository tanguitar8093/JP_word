import { Capacitor } from "@capacitor/core";
// TextToSpeech 插件（原生）
// 安裝套件後可用：@capacitor-community/text-to-speech
import { TextToSpeech } from "@capacitor-community/text-to-speech";

let voices = [];
let onVoicesLoaded = [];

const isNative = Capacitor?.isNativePlatform?.() === true;
const isTTSPluginAvailable =
  isNative && typeof Capacitor?.isPluginAvailable === "function"
    ? Capacitor.isPluginAvailable("TextToSpeech")
    : false;

// 在原生環境也允許使用 Web speech 作為後援
const isSpeechSupported =
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
    const exact = loadedVoices.find(
      (v) => v.name === "Google 日本語" && v.lang === "ja-JP"
    );
    if (exact) return exact;
    // 後援：挑選任一符合語系的 voice
    const anyJa = loadedVoices.find((v) => v.lang?.startsWith("ja"));
    if (anyJa) return anyJa;
  }
  if (lang && lang.startsWith("zh")) {
    const exact = loadedVoices.find(
      (v) => v.name === "Google 國語（臺灣）" && v.lang === "zh-TW"
    );
    if (exact) return exact;
    const anyZh = loadedVoices.find((v) => v.lang?.startsWith("zh"));
    if (anyZh) return anyZh;
  }
  return null;
};

export const speak = async (text, { rate = 1.0, lang } = {}) => {
  if (!text) return Promise.resolve();

  // 將 rate 夾在安全範圍內（外掛與瀏覽器都能接受）
  const safeRate = Math.min(2, Math.max(0.1, Number(rate) || 1.0));

  // 原生：使用 TextToSpeech 外掛（需可用）
  if (isTTSPluginAvailable && typeof TextToSpeech?.speak === "function") {
    try {
      await TextToSpeech.speak({
        text,
        rate: safeRate,
        // 修正：插件使用 lang，而非 locale
        lang: lang || undefined,
        pitch: 1.0,
        volume: 1.0,
      });
      return;
    } catch (e) {
      // 外掛呼叫失敗則回退 Web
    }
  }

  // Web 後援
  if (!isSpeechSupported) return Promise.resolve();
  const loadedVoices = await getVoices();
  return new Promise((resolve) => {
    const msg = new SpeechSynthesisUtterance(text);
    msg.voice = getVoice(lang || "", loadedVoices);
    if (lang) msg.lang = lang;
    msg.rate = safeRate;
    msg.onend = resolve;
    try {
      window.speechSynthesis.speak(msg);
    } catch (_) {
      resolve();
    }
  });
};