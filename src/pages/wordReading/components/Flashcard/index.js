import React, { useState, useEffect } from 'react';
import {
  CardContainer,
  WordContainer,
  AnswerContainer,
  ActionButtons,
  ActionButton,
  ShowAnswerButton,
} from './styles';
import { SpeakButton } from '../../../quiz/components/QuestionCard/styles'; // reuse speak button
import AudioRecorderPage from '../../../AudioRecorder';

const Flashcard = ({ card, onAnswer, speak }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [triggerReset, setTriggerReset] = useState(false);

  useEffect(() => {
    setShowAnswer(false);
    setTriggerReset(true);
    const timer = setTimeout(() => setTriggerReset(false), 100);
    return () => clearTimeout(timer);
  }, [card]);

  if (!card) {
    return <CardContainer>No more cards.</CardContainer>;
  }

  const handleAnswer = (rating) => {
    onAnswer(card.id, rating);
  };

  return (
    <CardContainer>
      <WordContainer>
        <span>{card.jp_word}</span>
        <SpeakButton onClick={() => speak(card.jp_word, 'ja')}>🔊</SpeakButton>
      </WordContainer>
      <AudioRecorderPage triggerReset={triggerReset} />

      {showAnswer ? (
        <AnswerContainer>
          <p>{card.ch_word}</p>
          <p>
            {card.jp_ex_statement}
            {card.jp_ex_statement && ( // Only show button if statement exists
              <SpeakButton onClick={() => speak(card.jp_ex_statement, 'ja')}>🔊</SpeakButton>
            )}
          </p>
          <p>
            {card.ch_ex_statement}
            {card.ch_ex_statement && ( // Only show button if statement exists
              <SpeakButton onClick={() => speak(card.ch_ex_statement, 'zh')}>🔊</SpeakButton>
            )}
          </p>
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
