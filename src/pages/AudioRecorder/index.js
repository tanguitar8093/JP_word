import React, { useState, useRef, useEffect } from 'react';
import {
  ButtonContainer,
  IconButton,
  Status,
  AudioPlayer,
  InfoButton,
  RecordIcon
} from './styles';

const AudioRecorderPage = ({ triggerReset }) => {
  const [permission, setPermission] = useState(false);
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

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

  const getMicrophonePermission = async () => {
    if ('MediaRecorder' in window) {
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({ audio: true });
        setPermission(true);
        setStream(streamData);
      } catch (err) {
        alert(err.message);
      }
    } else {
      alert('您的瀏覽器不支援錄音功能。');
    }
  };

  const startRecording = async () => {
    if (stream === null) {
      await getMicrophonePermission();
    }

    setIsRecording(true);
    if (audioURL) {
      URL.revokeObjectURL(audioURL); // 清掉舊的 URL
    }
    setAudioURL('');
    audioChunks.current = [];

    const media = new MediaRecorder(stream, { type: 'audio/webm' });
    mediaRecorder.current = media;
    mediaRecorder.current.start();

    mediaRecorder.current.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        audioChunks.current.push(event.data);
      }
    };
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        audioChunks.current = [];
      };
    }
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
      {permission && !isRecording && (
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
        <AudioPlayer src={audioURL} controls />
      )}
    </ButtonContainer>
  );
};

export default AudioRecorderPage;
