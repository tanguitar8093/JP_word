import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/contexts/AppContext';
import { startSession, answerCard, nextCard } from './reducer/actions';
import Flashcard from './components/Flashcard';
import {
  AppContainer,
  Title,
  Progress,
  SettingsToggle,
  FloatingSettingsPanel,
  Overlay,
} from '../../components/App/styles';
import styled from 'styled-components';
import { speak } from '../../services/speechService';
import SettingsPanel from '../../components/SettingsPanel';
import {
  setPlaybackOptions,
  setPlaybackSpeed,
} from '../../pages/systemSettings/reducer/actions';

const IconContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 100;
`;

const IconGroup = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: row-reverse;
`;

const HomeIcon = styled(SettingsToggle)`
  right: 5px;
`;

const WordReadingPage = () => {
  const { state, dispatch } = useApp();
  const { currentNotebookId, notebooks } = state.shared;
  const { cards, currentCard, sessionState, queue } = state.wordReading;
  const { playbackOptions, playbackSpeed } = state.systemSettings;
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentNotebook = notebooks.find(n => n.id === currentNotebookId);
    if (currentNotebook) {
      dispatch(startSession(currentNotebook.context));
    }
  }, [currentNotebookId, notebooks, dispatch]);

  const handleAnswer = (cardId, rating) => {
    dispatch(answerCard(cardId, rating));
    setTimeout(() => {
      dispatch(nextCard());
    }, 500);
  };

  const speakManually = useCallback(
    (text, lang) => {
      speak(text, { rate: playbackSpeed, lang });
    },
    [playbackSpeed]
  );

  if (sessionState === 'finished' || !currentCard) {
    return (
      <AppContainer>
        <Title>Session Finished!</Title>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <IconContainer>
        <IconGroup>
          <SettingsToggle onClick={() => setShowSettings(s => !s)}>
            ⚙️
          </SettingsToggle>
          <HomeIcon onClick={() => navigate('/')}>↩️</HomeIcon>
        </IconGroup>
      </IconContainer>
      {showSettings && (
        <>
          <Overlay onClick={() => setShowSettings(false)} />
          <FloatingSettingsPanel>
            <SettingsPanel
              playbackSpeed={playbackSpeed}
              setPlaybackSpeed={newSpeed => dispatch(setPlaybackSpeed(newSpeed))}
              playbackOptions={playbackOptions}
              setPlaybackOptions={newOptions =>
                dispatch(setPlaybackOptions(newOptions))
              }
              isQuizContext={true} // To hide some options
            />
          </FloatingSettingsPanel>
        </>
      )}
      <Title>單字朗讀</Title>
      <Progress>
        第 {cards.length - queue.length + 1} 題 / 共 {cards.length} 題
      </Progress>
      <Flashcard card={currentCard} onAnswer={handleAnswer} speak={speakManually} />
    </AppContainer>
  );
};

export default WordReadingPage;
