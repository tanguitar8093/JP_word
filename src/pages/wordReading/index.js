import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/contexts/AppContext';
import { startSession, answerCard, nextCard, updateCard } from './reducer/actions';
import Flashcard from './components/Flashcard';
import {
  AppContainer,
  Title,
  SettingsToggle,
  FloatingSettingsPanel,
  Overlay,
  InfoToggle,
} from '../../components/App/styles';
import styled from 'styled-components';
import { speak } from '../../services/speechService';
import SettingsPanel from '../../components/SettingsPanel';
import Modal from '../../components/Modal';
import {
  setPlaybackOptions,
  setPlaybackSpeed,
  setProficiencyFilter, // New import
  setAutoProceed, // New import
  setStartQuestionIndex, // New import
  setWordRangeCount, // New import
  setSortOrder, // New import
  setLearningSteps, // New import
  setGraduatingInterval, // New import
  setLapseInterval, // New import
} from '../../pages/systemSettings/reducer/actions';
import correctSound from '../../assets/sounds/correct.mp3';
import wrongSound from '../../assets/sounds/wrong.mp3';
import { calculateNextState } from '../../services/ankiService';

import { CounterContainer, CounterItem } from './styles';

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
  const { playbackOptions, playbackSpeed, proficiencyFilter, startQuestionIndex, wordRangeCount, sortOrder, learningSteps, graduatingInterval, lapseInterval, autoProceed } = state.systemSettings || {};
  const [showSettings, setShowSettings] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const navigate = useNavigate();

  const currentNotebook = notebooks.find(n => n.id === currentNotebookId);
  const notebookName = currentNotebook ? currentNotebook.name : '';

  const selectedProficiencies = Object.entries(proficiencyFilter)
    .filter(([, value]) => value)
    .map(([key]) => proficiencyMap[key])
    .join(', ');

  // Recalculate 'now' on each render to ensure accurate due date comparison for counters
  const currentTimestamp = Date.now();
  const newCount = cards.filter(card => card.status === 'new').length;
  const learningCount = cards.filter(card => card.status === 'learning' && card.due <= currentTimestamp).length;
  const reviewCount = cards.filter(card => card.status === 'review' && card.due <= currentTimestamp).length;

    useEffect(() => {
    // Only initialize session if it's not already active or if notebook/filters change
    if (sessionState === 'ready') { // Simplified condition for now
      const currentNotebook = notebooks.find(n => n.id === currentNotebookId);
      if (currentNotebook) {
        let filteredCards = currentNotebook.context.filter(card => {
          if (!card.jp_word) return false;
          return proficiencyFilter[card.proficiency];
        }).map(card => {
          // Initialize Anki fields if they don't exist
          return {
            ...card,
            status: card.status || 'new',
            due: card.due || Date.now(), // New cards are due immediately
            interval: card.interval || 0,
            easeFactor: card.easeFactor || 2.5,
            reps: card.reps || 0,
            lapses: card.lapses || 0,
            learningStep: card.learningStep || 0,
          };
        });

        const startIndex = Math.max(0, startQuestionIndex - 1);
        const endIndex = Math.min(filteredCards.length, startIndex + wordRangeCount);
        filteredCards = filteredCards.slice(startIndex, endIndex);

        // Categorize cards into Anki queues
        const now = Date.now();
        let reviewQueue = [];
        let newQueue = [];
        let learningQueue = [];

        filteredCards.forEach(card => {
          if (card.status === 'review' && card.due <= now) {
            reviewQueue.push(card);
          } else if (card.status === 'new') {
            newQueue.push(card);
          } else if (card.status === 'learning' && card.due <= now) {
            learningQueue.push(card);
          }
          // Cards not due yet are implicitly excluded from the current session
        });

        // Prioritize queues: Review -> New -> Learning
        const sessionCards = [...reviewQueue, ...newQueue, ...learningQueue];

        if (sessionCards.length > 0) {
          dispatch(startSession(sessionCards, sortOrder));
        } else {
          // Handle case where no cards are due for review/learning/new
          console.log("No cards are due for review, learning, or are new cards.");
          // You might want to display a "Session Finished" or "No cards today" message
        }
      }
    }
  }, [currentNotebookId, notebooks, dispatch, proficiencyFilter, startQuestionIndex, wordRangeCount, sortOrder, sessionState]); // Removed 'cards' from dependency, added 'sessionState'

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
    // Dispatch an action to update the card proficiency and schedule it
    dispatch(answerCard(cardId, rating, state.systemSettings)); // Let the reducer handle calculateNextState and state update

    // Play content based on playbackOptions
    // Note: playCardSequence should ideally use the *updated* card state after reducer processes it.
    // However, for immediate feedback, we might need to pass currentCard or fetch it from state after dispatch.
    // For now, we'll use currentCard for speech, as the actual state update happens asynchronously.
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
          <HomeIcon onClick={() => { console.log('Home icon clicked!'); navigate('/'); }}>↩️</HomeIcon>
          <InfoToggle onClick={() => setIsInfoModalOpen(true)}>ℹ️</InfoToggle>
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
              proficiencyFilter={proficiencyFilter} // Pass proficiencyFilter
              setProficiencyFilter={newFilter => dispatch(setProficiencyFilter(newFilter))} // Pass setProficiencyFilter
              autoProceed={autoProceed} // Pass autoProceed
              setAutoProceed={newAutoProceed => dispatch(setAutoProceed(newAutoProceed))} // Pass setAutoProceed
              startQuestionIndex={startQuestionIndex} // Pass startQuestionIndex
              setStartQuestionIndex={newIndex => dispatch(setStartQuestionIndex(newIndex))} // Pass setStartQuestionIndex
              wordRangeCount={wordRangeCount} // Pass wordRangeCount
              setWordRangeCount={newCount => dispatch(setWordRangeCount(newCount))} // Pass setWordRangeCount
              sortOrder={sortOrder} // Pass sortOrder
              setSortOrder={newOrder => dispatch(setSortOrder(newOrder))} // Pass setSortOrder
              learningSteps={learningSteps}
              setLearningSteps={newSteps => dispatch(setLearningSteps(newSteps))}
              graduatingInterval={graduatingInterval}
              setGraduatingInterval={newInterval => dispatch(setGraduatingInterval(newInterval))}
              lapseInterval={lapseInterval}
              setLapseInterval={newInterval => dispatch(setLapseInterval(newInterval))}
              isQuizContext={true} // To hide some options
            />
          </FloatingSettingsPanel>
        </>
      )}
      <Title>單字朗讀</Title>
      
      <Flashcard
        card={currentCard}
        onAnswer={handleAnswer}
        speak={speakManually}
        newCount={newCount}
        learningCount={learningCount}
        reviewCount={reviewCount}
      />
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
