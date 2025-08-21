import { useEffect, useRef, useState } from "react";

export function useVoices(langPrefix = "ja") {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const hasSetDefaultRef = useRef(false);

  useEffect(() => {
    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const all = synth.getVoices();
      const list = all.filter(
        (v) => v.lang && v.lang.toLowerCase().startsWith(langPrefix)
      );
      setVoices(list);

      if (!hasSetDefaultRef.current && list.length) {
        const preferredNames = ["Google 日本語 (ja-JP)", "Google 日本語"];
        const google =
          list.find((v) => preferredNames.includes(v.name)) ||
          list.find(
            (v) => v.name.includes("Google") && v.lang.startsWith("ja")
          );
        setSelectedVoice(google || list[0]); // ✅ 永遠存 SpeechSynthesisVoice 物件
        hasSetDefaultRef.current = true;
      }
    };

    loadVoices();
    synth.onvoiceschanged = loadVoices;

    return () => {
      if (synth.onvoiceschanged === loadVoices) synth.onvoiceschanged = null;
    };
  }, [langPrefix]);

  return { voices, selectedVoice, setSelectedVoice };
}
