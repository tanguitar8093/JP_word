export function speak(text, { rate = 1, pitch = 1, voice } = {}) {
  if (!text) return;

  if (!(voice instanceof SpeechSynthesisVoice)) {
    console.warn("No valid voice provided. Speech not played.");
    return;
  }

  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "ja-JP";
  msg.rate = rate;
  msg.pitch = pitch;
  msg.voice = voice;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(msg);
}
