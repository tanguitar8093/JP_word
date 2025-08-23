
import React, { useState, useRef } from 'react';
import {
  Button,
  Status,
  AudioPlayer,
  ButtonContainer,RecordButton,RecordIcon
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
        const streamData = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        setPermission(true);
        setStream(streamData);
      } catch (err) {
        alert(err.message);
      }
    } else {
      alert('The MediaRecorder API is not supported in your browser.');
    }
  };

  const startRecording = async () => {
    if (stream === null) {
      await getMicrophonePermission();
    }
    
    setIsRecording(true);
    setAudioURL('');
    audioChunks.current = [];

    const media = new MediaRecorder(stream, { type: 'audio/webm' });
    mediaRecorder.current = media;
    mediaRecorder.current.start();

    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === 'undefined') return;
      if (event.data.size === 0) return;
      audioChunks.current.push(event.data);
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
    <>
      <main>
        <ButtonContainer>
          {!permission ? (
            <span onClick={getMicrophonePermission}>載入錄音權限</span>
          ) : null}
          {permission && !isRecording ? (
            <span onClick={startRecording} disabled={isRecording}>
              錄音
            </span>
          ) : null}
          {isRecording ? (
            <span onClick={stopRecording} disabled={!isRecording}>
              停止
            </span>
          ) : null}
          {isRecording && <Status>錄音中...</Status>}
          {audioURL && (
            <AudioPlayer src={audioURL} controls />
        )}
        </ButtonContainer>
      </main>
    </>
  );
};

export default AudioRecorderPage;
