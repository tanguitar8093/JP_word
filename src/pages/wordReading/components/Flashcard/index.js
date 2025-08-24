import React, { useState } from 'react';
import {
  CardContainer,
  WordContainer,
  AnswerContainer,
  ActionButtons,
  ActionButton,
  ShowAnswerButton,
} from './styles';
import { SpeakButton } from '../../../quiz/components/QuestionCard/styles'; // reuse speak button

const Flashcard = ({ card, onAnswer, speak }) => {
  const [showAnswer, setShowAnswer] = useState(false);

  if (!card) {
    return <CardContainer>No more cards.</CardContainer>;
  }

  const handleAnswer = (rating) => {
    onAnswer(card.id, rating);
    setShowAnswer(false);
  };

  return (
    <CardContainer>
      <WordContainer>
        <span>{card.jp_word}</span>
        <SpeakButton onClick={() => speak(card.jp_word, 'ja')}>🔊</SpeakButton>
      </WordContainer>

      {showAnswer ? (
        <AnswerContainer>
          <p>{card.ch_word}</p>
          <p>{card.jp_ex_statement}</p>
          <p>{card.ch_ex_statement}</p>
          <ActionButtons>
            <ActionButton className="hard" onClick={() => handleAnswer('hard')}>Hard</ActionButton>
            <ActionButton className="good" onClick={() => handleAnswer('good')}>Good</ActionButton>
            <ActionButton className="easy" onClick={() => handleAnswer('easy')}>Easy</ActionButton>
          </ActionButtons>
        </AnswerContainer>
      ) : (
        <ShowAnswerButton onClick={() => setShowAnswer(true)}>Show Answer</ShowAnswerButton>
      )}
    </CardContainer>
  );
};

export default Flashcard;
