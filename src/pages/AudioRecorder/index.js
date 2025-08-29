import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  ButtonContainer,
  IconButton,
  Status,
  AudioPlayer,
  InfoButton,
  RecordIcon,
} from "./styles";
import { Capacitor } from "@capacitor/core";
import { VoiceRecorder } from "capacitor-voice-recorder";

const AudioRecorderPage = forwardRef(({ triggerReset }, ref) => {
  const [permission, setPermission] = useState(false);
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [error, setError] = useState("");
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const audioPlayerRef = useRef(null);
  const stopResolver = useRef(null);
  const playResolver = useRef(null);

  const isNative = Capacitor?.isNativePlatform?.() === true;
  const isVRPluginAvailable =
    isNative && typeof Capacitor?.isPluginAvailable === "function"
      ? Capacitor.isPluginAvailable("VoiceRecorder")
      : false;

  // 嘗試在首次互動時解鎖 WebView 的音訊播放限制
  useEffect(() => {
    const unlock = () => {
      try {
        const a = new Audio();
        a.play().catch(() => {});
      } catch (_) {}
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

  const requestNativeMicPermission = async () => {
    try {
      const has = await VoiceRecorder.hasAudioRecordingPermission();
      if (!has.value) {
        await VoiceRecorder.requestAudioRecordingPermission();
      }
      const finalHas = await VoiceRecorder.hasAudioRecordingPermission();
      return finalHas.value;
    } catch (e) {
      // 簡化訊息（不顯示診斷性警告）
      return false;
    }
  };

  const getMicrophonePermission = async () => {
    setError("");
    if (isNative) {
      if (!isVRPluginAvailable) {
        setPermission(false);
        return null;
      }
      const granted = await requestNativeMicPermission();
      setPermission(!!granted);
      return granted ? true : null;
    }
    if (!isMediaSupported) {
      setError("此裝置或 WebView 不支援錄音功能。");
      return null;
    }
    try {
      // 建議加入明確 constraints
      const streamData = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      setPermission(true);
      setStream(streamData);
      return streamData; // Return stream on success
    } catch (err) {
      setError(err && err.message ? err.message : "無法取得麥克風權限");
      setPermission(false);
      setStream(null);
      return null; // Return null on error
    }
  };

  const primePlayback = async () => {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      await ctx.resume().catch(() => {});
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0.0001; // 幾乎靜音
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (_) {}
  };

  // Expose functions to parent component
  useImperativeHandle(ref, () => ({
    startRecording,
    stopRecording: () => {
      return new Promise((resolve) => {
        stopResolver.current = resolve;
        stopRecordingInternal();
      });
    },
    // 改良：等待 audio 元素就緒再播放，確保自動流程能播出剛錄的音
    play: async () => {
      const waitForAudio = () =>
        new Promise((resolve) => {
          const start = Date.now();
          const tick = () => {
            const a = audioPlayerRef.current;
            if (
              a &&
              a.src &&
              (a.readyState >= 3 || a.duration > 0)
            ) {
              resolve(a);
              return;
            }
            if (Date.now() - start > 4000) {
              resolve(a || null);
              return;
            }
            requestAnimationFrame(tick);
          };
          tick();
        });

      const a = await waitForAudio();
      return new Promise((resolve) => {
        if (a) {
          playResolver.current = resolve;
          try {
            a.currentTime = 0;
            const p = a.play();
            if (p && typeof p.then === "function") {
              p.catch(() => resolve());
            }
          } catch (_) {
            resolve();
          }
        } else {
          resolve();
        }
      });
    },
    getMicrophonePermission,
    prime: primePlayback,
  }));

  // Reset function
  const resetRecorder = () => {
    // 停止 recorder
    if (mediaRecorder.current) {
      try {
        mediaRecorder.current.stop();
      } catch (e) {
        // 已經停止就忽略
      }
      mediaRecorder.current = null;
    }

    // 如果已經有權限，就只 reset 錄音相關
    if (permission) {
      if (audioURL) {
        URL.revokeObjectURL(audioURL); // 釋放 blob URL
      }
      setIsRecording(false);
      setAudioURL("");
      audioChunks.current = [];
    } else {
      // 沒有權限 → 完全回到初始狀態
      setPermission(false);
      setStream(null);
      setIsRecording(false);
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
      setAudioURL("");
      audioChunks.current = [];
    }
  };

  useEffect(() => {
    if (triggerReset) {
      resetRecorder();
    }
  }, [triggerReset]);

  const startRecording = async () => {
    if (isNative) {
      if (!isVRPluginAvailable) {
        // 不顯示診斷性警告
        return;
      }
      const granted = await getMicrophonePermission();
      if (!granted) {
        setError("未取得麥克風權限");
        return;
      }
      try {
        await VoiceRecorder.startRecording();
        setIsRecording(true);
      } catch (e) {
        setError("原生錄音啟動失敗");
      }
      return;
    }

    let currentStream = stream;
    if (currentStream === null) {
      currentStream = await getMicrophonePermission();
    }
    if (!currentStream) return; // Don't start if permission is denied

    setIsRecording(true);
    if (audioURL) {
      URL.revokeObjectURL(audioURL); // 清掉舊的 URL
    }
    setAudioURL("");
    audioChunks.current = [];

    try {
      // 優先指定 mimeType，失敗則退回預設
      let media;
      try {
        media = new MediaRecorder(currentStream, { mimeType: "audio/webm" });
      } catch (_) {
        media = new MediaRecorder(currentStream);
      }
      mediaRecorder.current = media;
      mediaRecorder.current.start();

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };
    } catch (e) {
      setError("此裝置不支援瀏覽器錄音");
      setIsRecording(false);
    }
  };

  const stopRecordingInternal = async () => {
    if (isNative) {
      try {
        const result = await VoiceRecorder.stopRecording();
        const { recordDataBase64, mimeType } = (result && result.value) || {};
        if (recordDataBase64) {
          const mime = mimeType || "audio/aac";
          const audioUrl = `data:${mime};base64,${recordDataBase64}`;
          setAudioURL(audioUrl);
        }
      } catch (e) {
        setError("原生錄音停止失敗");
      } finally {
        setIsRecording(false);
        if (stopResolver.current) {
          stopResolver.current();
          stopResolver.current = null;
        }
      }
      return;
    }

    setIsRecording(false);
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        audioChunks.current = [];
        if (stopResolver.current) {
          stopResolver.current();
          stopResolver.current = null;
        }
      };
    } else {
      if (stopResolver.current) {
        stopResolver.current();
        stopResolver.current = null;
      }
    }
  };

  const stopRecording = () => {
    stopRecordingInternal();
  };

  return (
    <ButtonContainer>
      {error && <Status style={{ color: "#e53935" }}>{error}</Status>}

      {/* 未取得權限 - 只在權限被拒絕時顯示（簡化提示文字） */}
      {!permission && (
        <InfoButton onClick={getMicrophonePermission}>
          🎤 點擊允許錄音功能
        </InfoButton>
      )}

      {/* 已取得權限但尚未錄音 */}
      {permission && !isRecording && !audioURL && (
        <InfoButton onClick={startRecording}>
          <RecordIcon recording={false} /> 點擊開始錄音
        </InfoButton>
      )}

      {/* 錄音中 */}
      {permission && isRecording && (
        <>
          <IconButton onClick={stopRecording}> ⏹ 點擊停止錄音</IconButton>
          <RecordIcon recording={true} />
          <Status>錄音中... </Status>
        </>
      )}

      {/* 播放 bar，只在錄音完成後顯示 */}
      {permission && !isRecording && audioURL && (
        <AudioPlayer
          ref={audioPlayerRef}
          src={audioURL}
          controls
          onCanPlayThrough={() => {
            if (stopResolver.current) {
              stopResolver.current();
              stopResolver.current = null;
            }
          }}
          onEnded={() => {
            if (playResolver.current) {
              playResolver.current();
              playResolver.current = null;
            }
          }}
        />
      )}
    </ButtonContainer>
  );
});

export default AudioRecorderPage;
