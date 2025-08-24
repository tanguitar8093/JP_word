import React, { useEffect } from 'react';
import { useApp } from '../../store/contexts/AppContext';
import { startSession, answerCard, nextCard } from './reducer/actions';
import Flashcard from './components/Flashcard';
import { AppContainer, Title } from '../../components/App/styles';
import { speak } from '../../services/speechService';

const WordReadingPage = () => {
  const { state, dispatch } = useApp();
  const { currentNotebookId, notebooks } = state.shared;
  const { cards, currentCard, sessionState } = state.wordReading;

  useEffect(() => {
    const currentNotebook = notebooks.find(n => n.id === currentNotebookId);
    if (currentNotebook) {
      dispatch(startSession(currentNotebook.context));
    }
  }, [currentNotebookId, notebooks, dispatch]);

  const handleAnswer = (cardId, rating) => {
    dispatch(answerCard(cardId, rating));
    // For now, just move to the next card after a short delay
    setTimeout(() => {
      dispatch(nextCard());
    }, 500);
  };

  if (sessionState === 'finished') {
    return (
      <AppContainer>
        <Title>Session Finished!</Title>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <Title>單字朗讀</Title>
      <Flashcard card={currentCard} onAnswer={handleAnswer} speak={speak} />
    </AppContainer>
  );
};

export default WordReadingPage;