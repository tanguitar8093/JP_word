import { Capacitor } from "@capacitor/core";
import { TextToSpeech } from "@capacitor-community/text-to-speech";

let voices = [];
let onVoicesLoaded = [];

const isNative = Capacitor?.isNativePlatform?.() === true;
const isTTSPluginAvailable =
  isNative && typeof Capacitor?.isPluginAvailable === "function"
    ? Capacitor.isPluginAvailable("TextToSpeech")
    : false;

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
  if (voices.length > 0) return Promise.resolve(voices);
  voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) return Promise.resolve(voices);
  return new Promise((resolve) => {
    onVoicesLoaded.push(() => resolve(window.speechSynthesis.getVoices()));
  });
};

const getVoice = (lang, loadedVoices) => {
  if (!loadedVoices || loadedVoices.length === 0) return null;
  if (lang && lang.startsWith("ja")) {
    return (
      loadedVoices.find((v) => v.name === "Google 日本語" && v.lang === "ja-JP") ||
      loadedVoices.find((v) => v.lang?.startsWith("ja")) ||
      null
    );
  }
  if (lang && lang.startsWith("zh")) {
    return (
      loadedVoices.find((v) => v.name === "Google 國語（臺灣）" && v.lang === "zh-TW") ||
      loadedVoices.find((v) => v.lang?.startsWith("zh")) ||
      null
    );
  }
  return null;
};

export const speak = async (text, { rate = 1.0, lang } = {}) => {
  if (!text) return Promise.resolve();

  const safeRate = Math.min(2, Math.max(0.1, Number(rate) || 1.0));

  if (isTTSPluginAvailable && typeof TextToSpeech?.speak === "function") {
    try {
      await TextToSpeech.speak({ text, rate: safeRate, lang: lang || undefined, pitch: 1.0, volume: 1.0 });
      return;
    } catch (_) {}
  }

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