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
  InfoToggle, // New import
} from '../../components/App/styles';
import styled from 'styled-components';
import { speak } from '../../services/speechService';
import SettingsPanel from '../../components/SettingsPanel';
import Modal from '../../components/Modal';
import {
  setPlaybackOptions,
  setPlaybackSpeed,
} from '../../pages/systemSettings/reducer/actions';
import correctSound from '../../assets/sounds/correct.mp3';
import wrongSound from '../../assets/sounds/wrong.mp3';

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

const proficiencyMap = {
  1: '低',
  2: '中',
  3: '高',
};

const sortOrderMap = {
  random: '隨機',
  aiueo: 'あいうえお',
  none: '預設',
};

const WordReadingPage = () => {
  const { state, dispatch } = useApp();
  const { currentNotebookId, notebooks } = state.shared;
  const { cards, currentCard, sessionState, queue } = state.wordReading;
  const { playbackOptions, playbackSpeed, proficiencyFilter, startQuestionIndex, wordRangeCount, sortOrder } = state.systemSettings;
  const [showSettings, setShowSettings] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const navigate = useNavigate();

  const currentNotebook = notebooks.find(n => n.id === currentNotebookId);
  const notebookName = currentNotebook ? currentNotebook.name : '';

  const selectedProficiencies = Object.entries(proficiencyFilter)
    .filter(([, value]) => value)
    .map(([key]) => proficiencyMap[key])
    .join(', ');

  useEffect(() => {
    const currentNotebook = notebooks.find(n => n.id === currentNotebookId);
    if (currentNotebook) {
      let filteredCards = currentNotebook.context.filter(card => {
        if (!card.jp_word) return false;
        return proficiencyFilter[card.proficiency];
      });

      const startIndex = Math.max(0, startQuestionIndex - 1);
      const endIndex = Math.min(filteredCards.length, startIndex + wordRangeCount);
      filteredCards = filteredCards.slice(startIndex, endIndex);

      if (filteredCards.length > 0) {
        dispatch(startSession(filteredCards, sortOrder));
      } else {
        // Handle case where no cards match filter, similar to quiz
        // For now, just log or set a state to show a message
        console.log("No cards match the current filter settings.");
        // You might want to add a state here to display a message to the user
        // e.g., setNoCardsFound(true);
      }
    }
  }, [currentNotebookId, notebooks, dispatch, proficiencyFilter, startQuestionIndex, wordRangeCount, sortOrder]); // Added new dependencies

  const speakCardText = useCallback(
    (text, lang) => {
      return speak(text, { rate: playbackSpeed, lang });
    },
    [playbackSpeed]
  );

  const playCardSequence = useCallback(
    async (card, options) => {
      if (!card) return;

      window.speechSynthesis.cancel(); // Cancel any ongoing speech

      if (options.jp && card.jp_word) await speakCardText(card.jp_word, "ja-JP");
      if (options.ch && card.ch_word) await speakCardText(card.ch_word, "zh-TW");
      if (options.jpEx && card.jp_ex_statement)
        await speakCardText(card.jp_ex_statement, "ja-JP");
      if (options.chEx && card.ch_ex_statement)
        await speakCardText(card.ch_ex_statement, "zh-TW");
    },
    [speakCardText]
  );

  const handleAnswer = (cardId, rating) => {
    dispatch(answerCard(cardId, rating));
    // Play content based on playbackOptions
    playCardSequence(currentCard, playbackOptions).then(() => {
      // Only proceed to next card after speech finishes
      dispatch(nextCard());
    });
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
          <InfoToggle onClick={() => setIsInfoModalOpen(true)}>ℹ️</InfoToggle> {/* Moved and using InfoToggle */}
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
      <Modal
        isVisible={isInfoModalOpen}
        onConfirm={() => setIsInfoModalOpen(false)}
        disableCancel
        message={ // Combined title and content
          <div style={{ textAlign: 'left' }}>
            <h3>功能說明</h3>
            <p>筆記本名稱: {notebookName}</p>
            <p>熟練度: {selectedProficiencies}</p>
            <p>排序: {sortOrderMap[sortOrder]}</p>
            <p>單字起始索引: {startQuestionIndex}</p>
            <p>單字範圍: {wordRangeCount}</p>
            <br />
            <p>點擊卡片可以聆聽單字發音。</p>
            <p>使用下方按鈕可以切換單字卡。</p>
          </div>
        }
      />
    </AppContainer>
  );
};

export default WordReadingPage;