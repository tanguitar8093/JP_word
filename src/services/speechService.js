export function speak(text, { rate = 1, pitch = 1, voice, lang } = {}) {
  if (!text) return;

  const msg = new SpeechSynthesisUtterance(text);

  // ✅ lang 有指定就用 lang，否則用 voice.lang 或預設日文
  msg.lang = lang || (voice ? voice.lang : "ja-JP");
  msg.rate = rate;
  msg.pitch = pitch;
  if (voice) msg.voice = voice;

  return new Promise((resolve) => {
    msg.onend = resolve;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(msg);
  });
}

export async function speakSequential(texts, defaultOptions) {
  for (const t of texts) {
    if (!t) continue;
    const { text, options } =
      typeof t === "string" ? { text: t, options: {} } : t;
    await speak(text, { ...defaultOptions, ...options });
  }
}
