import React, { useEffect, useMemo, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import { VoiceRecorder } from "capacitor-voice-recorder";

const Row = ({ label, value }) => (
  <div style={{ display: "flex", gap: 8, margin: "6px 0" }}>
    <div style={{ width: 160, color: "#666" }}>{label}</div>
    <div style={{ fontFamily: "monospace" }}>{String(value)}</div>
  </div>
);

const Box = ({ title, children }) => (
  <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, marginTop: 12 }}>
    <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>
    {children}
  </div>
);

export default function DiagnosticsPage() {
  const [logs, setLogs] = useState([]);
  const [ttsOk, setTtsOk] = useState(null);
  const [webTtsOk, setWebTtsOk] = useState(null);
  const [vrPerm, setVrPerm] = useState(null);
  const [vrOk, setVrOk] = useState(null);
  const [vrErr, setVrErr] = useState("");
  const [recUrl, setRecUrl] = useState("");
  const [webRecOk, setWebRecOk] = useState(null);
  const [webRecErr, setWebRecErr] = useState("");
  const audioRef = useRef(null);

  const isNative = Capacitor?.isNativePlatform?.() === true;
  const platform = Capacitor?.getPlatform?.() || "unknown";
  const isTTSPluginAvailable =
    isNative && typeof Capacitor?.isPluginAvailable === "function"
      ? Capacitor.isPluginAvailable("TextToSpeech")
      : false;
  const isVRPluginAvailable =
    isNative && typeof Capacitor?.isPluginAvailable === "function"
      ? Capacitor.isPluginAvailable("VoiceRecorder")
      : false;

  const isWebSpeech =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof window.SpeechSynthesisUtterance !== "undefined";

  const isWebMediaSupported =
    typeof navigator !== "undefined" &&
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function" &&
    typeof window !== "undefined" &&
    "MediaRecorder" in window;

  const log = (m) => setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${m}`]);

  useEffect(() => {
    const unlock = () => {
      try { const a = new Audio(); a.play().catch(() => {}); } catch (_) {}
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("click", unlock);
    };
    window.addEventListener("touchstart", unlock, { once: true });
    window.addEventListener("click", unlock, { once: true });
    return () => {
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("click", unlock);
    };
  }, []);

  const testNativeTTS = async () => {
    setTtsOk(null);
    try {
      if (!isTTSPluginAvailable) {
        log("TTS 外掛不可用 (可能未 sync 或未重裝 APK)");
        setTtsOk(false);
        return;
      }
      await TextToSpeech.speak({ text: "こんにちは。これはテストです。", lang: "ja-JP", rate: 1.0 });
      await TextToSpeech.speak({ text: "您好，這是一段中文測試。", lang: "zh-TW", rate: 1.0 });
      setTtsOk(true);
      log("原生 TTS 播放成功");
    } catch (e) {
      setTtsOk(false);
      log(`原生 TTS 失敗: ${e?.message || e}`);
    }
  };

  const testWebTTS = async () => {
    setWebTtsOk(null);
    try {
      if (!isWebSpeech) {
        setWebTtsOk(false);
        log("Web speechSynthesis 不可用");
        return;
      }
      const u1 = new SpeechSynthesisUtterance("こんにちは。テストです。");
      u1.lang = "ja-JP"; u1.rate = 1.0;
      const p1 = new Promise((res) => { u1.onend = res; });
      window.speechSynthesis.speak(u1);
      await p1;

      const u2 = new SpeechSynthesisUtterance("您好，這是一段中文測試。");
      u2.lang = "zh-TW"; u2.rate = 1.0;
      const p2 = new Promise((res) => { u2.onend = res; });
      window.speechSynthesis.speak(u2);
      await p2;

      setWebTtsOk(true);
      log("Web TTS 播放成功");
    } catch (e) {
      setWebTtsOk(false);
      log(`Web TTS 失敗: ${e?.message || e}`);
    }
  };

  const checkVRPermission = async () => {
    try {
      if (!isVRPluginAvailable) {
        setVrPerm(false);
        log("VoiceRecorder 外掛不可用");
        return;
      }
      const has = await VoiceRecorder.hasAudioRecordingPermission();
      setVrPerm(!!has?.value);
      log(`原生錄音權限: ${!!has?.value}`);
    } catch (e) {
      setVrPerm(false);
      log(`檢查原生錄音權限失敗: ${e?.message || e}`);
    }
  };

  const requestVRPermission = async () => {
    try {
      if (!isVRPluginAvailable) { setVrPerm(false); log("VoiceRecorder 外掛不可用"); return; }
      await VoiceRecorder.requestAudioRecordingPermission();
      await checkVRPermission();
    } catch (e) {
      log(`請求原生錄音權限失敗: ${e?.message || e}`);
    }
  };

  const testNativeRecord = async () => {
    setVrErr(""); setVrOk(null); setRecUrl("");
    try {
      if (!isVRPluginAvailable) { setVrOk(false); setVrErr("外掛不可用"); return; }
      const has = await VoiceRecorder.hasAudioRecordingPermission();
      if (!has?.value) { setVrOk(false); setVrErr("未授權"); return; }
      await VoiceRecorder.startRecording();
      log("開始原生錄音 1.5 秒…");
      await new Promise((r) => setTimeout(r, 1500));
      const res = await VoiceRecorder.stopRecording();
      const { recordDataBase64, mimeType } = res?.value || {};
      if (recordDataBase64) {
        const mime = mimeType || "audio/aac";
        const url = `data:${mime};base64,${recordDataBase64}`;
        setRecUrl(url);
        setVrOk(true);
        log(`原生錄音成功 mime=${mime} len=${recordDataBase64.length}`);
      } else {
        setVrOk(false);
        setVrErr("stopRecording 無資料");
      }
    } catch (e) {
      setVrOk(false);
      setVrErr(e?.message || String(e));
      log(`原生錄音失敗: ${e?.message || e}`);
    }
  };

  const testWebRecord = async () => {
    setWebRecErr(""); setWebRecOk(null); setRecUrl("");
    if (!isWebMediaSupported) { setWebRecOk(false); setWebRecErr("瀏覽器不支援 MediaRecorder"); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      let media;
      try { media = new MediaRecorder(stream, { mimeType: "audio/webm" }); } catch (_) { media = new MediaRecorder(stream); }
      const parts = [];
      media.ondataavailable = (ev) => { if (ev.data && ev.data.size > 0) parts.push(ev.data); };
      media.start();
      log("開始 Web 錄音 1.5 秒…");
      await new Promise((r) => setTimeout(r, 1500));
      await new Promise((r) => { media.onstop = r; media.stop(); });
      const blob = new Blob(parts, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      setRecUrl(url);
      setWebRecOk(true);
      log(`Web 錄音成功 size=${blob.size}`);
    } catch (e) {
      setWebRecOk(false);
      setWebRecErr(e?.message || String(e));
      log(`Web 錄音失敗: ${e?.message || e}`);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>診斷工具</h2>

      <Box title="平台狀態">
        <Row label="isNative">{isNative ? "true" : "false"}</Row>
        <Row label="platform">{platform}</Row>
        <Row label="TTS 外掛可用">{isTTSPluginAvailable ? "true" : "false"}</Row>
        <Row label="VoiceRecorder 外掛可用">{isVRPluginAvailable ? "true" : "false"}</Row>
        <Row label="Web Speech 可用">{isWebSpeech ? "true" : "false"}</Row>
        <Row label="Web MediaRecorder 可用">{isWebMediaSupported ? "true" : "false"}</Row>
      </Box>

      <Box title="文字轉語音 (TTS)">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={testNativeTTS}>測原生 TTS</button>
          <button onClick={testWebTTS}>測 Web TTS</button>
        </div>
        <div style={{ marginTop: 6 }}>
          原生 TTS 結果：{ttsOk === null ? "(未測)" : ttsOk ? "成功" : "失敗"}
        </div>
        <div>
          Web TTS 結果：{webTtsOk === null ? "(未測)" : webTtsOk ? "成功" : "失敗"}
        </div>
        <div style={{ color: "#666", marginTop: 6 }}>
          提示：請在系統設定安裝/啟用 Google 文字轉語音，並下載 ja-JP / zh-TW 語音資料。
        </div>
      </Box>

      <Box title="錄音">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={checkVRPermission}>查原生錄音權限</button>
          <button onClick={requestVRPermission}>請求原生錄音權限</button>
          <button onClick={testNativeRecord}>測原生錄音</button>
          <button onClick={testWebRecord}>測 Web 錄音</button>
        </div>
        <div style={{ marginTop: 6 }}>
          原生權限：{vrPerm === null ? "(未知)" : vrPerm ? "允許" : "未允許"}
        </div>
        <div>原生錄音：{vrOk === null ? "(未測)" : vrOk ? "成功" : `失敗${vrErr ? ` - ${vrErr}` : ""}`}</div>
        <div>Web 錄音：{webRecOk === null ? "(未測)" : webRecOk ? "成功" : `失敗${webRecErr ? ` - ${webRecErr}` : ""}`}</div>
        {recUrl && (
          <div style={{ marginTop: 8 }}>
            <audio ref={audioRef} src={recUrl} controls />
          </div>
        )}
      </Box>

      <Box title="日誌">
        <pre style={{ whiteSpace: "pre-wrap" }}>{logs.join("\n")}</pre>
      </Box>
    </div>
  );
}
