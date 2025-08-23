import React, { useState, useRef } from 'react';
import {
  ButtonContainer,
  IconButton,
  Status,
  AudioPlayer,
  InfoButton,
  RecordIcon
} from './styles';

const AudioRecorderPage = () => {
  const [permission, setPermission] = useState(false);
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

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
    setAudioURL(''); // 清空之前的錄音
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
    mediaRecorder.current.stop();

    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioURL(audioUrl);
      audioChunks.current = [];
    };
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
