import { useEffect, useRef, useState } from "react";

export function useVoices() {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  // 確保「只預設一次」，不會覆蓋使用者後續選擇
  const hasSetDefaultRef = useRef(false);

  useEffect(() => {
    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const all = synth.getVoices();
      const jaVoices = all.filter((v) => v.lang && v.lang.startsWith("ja"));
      setVoices(jaVoices);

      if (!hasSetDefaultRef.current && jaVoices.length > 0) {
        // 只在第一次載入 voices 時挑預設
        const preferredNames = ["Google 日本語 (ja-JP)", "Google 日本語"];
        const google = jaVoices.find((v) => preferredNames.includes(v.name));
        const fallback = jaVoices[0];
        setSelectedVoice((google || fallback).name);
        hasSetDefaultRef.current = true;
      }
    };

    // 先跑一次，之後等事件觸發
    loadVoices();
    synth.onvoiceschanged = loadVoices;

    return () => {
      // 清理事件（有的瀏覽器不是必要，但保險）
      if (synth.onvoiceschanged === loadVoices) {
        synth.onvoiceschanged = null;
      }
    };
  }, []);

  return { voices, selectedVoice, setSelectedVoice };
}
