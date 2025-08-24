let voices = [];
let onVoicesLoaded = [];

window.speechSynthesis.onvoiceschanged = () => {
  voices = window.speechSynthesis.getVoices();
  onVoicesLoaded.forEach((cb) => cb());
  onVoicesLoaded = [];
};

const getVoices = () => {
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
  if (lang.startsWith("ja")) {
    return loadedVoices.find(
      (v) => v.name === "Google 日本語" && v.lang === "ja-JP"
    );
  }
  if (lang.startsWith("zh")) {
    return loadedVoices.find(
      (v) => v.name === "Google 國語（臺灣）" && v.lang === "zh-TW"
    );
  }
  return null;
};

export const speak = async (text, { rate = 1.0, lang }) => {
  const loadedVoices = await getVoices();
  return new Promise((resolve) => {
    if (!text) return resolve();

    const msg = new SpeechSynthesisUtterance(text);
    msg.voice = getVoice(lang, loadedVoices);
    msg.lang = lang;
    msg.rate = rate;
    msg.onend = resolve;

    window.speechSynthesis.speak(msg);
  });
};
