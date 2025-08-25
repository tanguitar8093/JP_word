import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  ButtonContainer,
  IconButton,
  Status,
  AudioPlayer,
  InfoButton,
  RecordIcon
} from './styles';

const AudioRecorderPage = forwardRef(({ triggerReset }, ref) => {
  const [permission, setPermission] = useState(false);
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const audioPlayerRef = useRef(null);
  const stopResolver = useRef(null);
  const playResolver = useRef(null);

  const getMicrophonePermission = async () => {
    if ('MediaRecorder' in window) {
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({ audio: true });
        setPermission(true);
        setStream(streamData);
        return streamData; // Return stream on success
      } catch (err) {
        alert(err.message);
        return null; // Return null on error
      }
    } else {
      alert('您的瀏覽器不支援錄音功能。');
      return null;
    }
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
    play: () => {
      return new Promise((resolve) => {
        if (audioPlayerRef.current) {
          playResolver.current = resolve;
          audioPlayerRef.current.play();
        } else {
          resolve();
        }
      });
    },
    getMicrophonePermission,
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
      setAudioURL('');
      audioChunks.current = [];
    } else {
      // 沒有權限 → 完全回到初始狀態
      setPermission(false);
      setStream(null);
      setIsRecording(false);
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
      setAudioURL('');
      audioChunks.current = [];
    }
  };

  // 父層觸發 reset
  useEffect(() => {
    if (triggerReset) {
      resetRecorder();
    }
  }, [triggerReset]);

  const startRecording = async () => {
    let currentStream = stream;
    if (currentStream === null) {
      currentStream = await getMicrophonePermission();
    }

    if (!currentStream) return; // Don't start if permission is denied

    setIsRecording(true);
    if (audioURL) {
      URL.revokeObjectURL(audioURL); // 清掉舊的 URL
    }
    setAudioURL('');
    audioChunks.current = [];

    const media = new MediaRecorder(currentStream, { type: 'audio/webm' });
    mediaRecorder.current = media;
    mediaRecorder.current.start();

    mediaRecorder.current.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        audioChunks.current.push(event.data);
      }
    };
  };

  const stopRecordingInternal = () => {
    setIsRecording(false);
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        audioChunks.current = [];
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
      {/* 未取得權限 */}
      {!permission && (
        <InfoButton onClick={getMicrophonePermission}>
          🎤 點擊取得錄音權限
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
