import React from "react";
import {
  CardContainer,
  WordText,
  ExampleText,
  ButtonGroup,
  ActionButton,
} from "./styles";

export default function WordCard({ word, onRating }) {
  const { jp_word, kanji_jp_word, ch_word, jp_ex_statement, status } = word;

  return (
    <CardContainer>
      <WordText>
        <div>{jp_word}</div>
        {kanji_jp_word && <div>{kanji_jp_word}</div>}
        <div>{ch_word}</div>
      </WordText>

      {jp_ex_statement && <ExampleText>{jp_ex_statement}</ExampleText>}

      <ButtonGroup>
        {status === "review" ? (
          <>
            <ActionButton onClick={() => onRating("again")}>Again</ActionButton>
            <ActionButton onClick={() => onRating("hard")}>Hard</ActionButton>
            <ActionButton onClick={() => onRating("good")}>Good</ActionButton>
            <ActionButton onClick={() => onRating("easy")}>Easy</ActionButton>
          </>
        ) : (
          <>
            <ActionButton onClick={() => onRating("again")}>Again</ActionButton>
            <ActionButton onClick={() => onRating("good")}>Good</ActionButton>
            <ActionButton onClick={() => onRating("easy")}>Easy</ActionButton>
          </>
        )}
      </ButtonGroup>
    </CardContainer>
  );
}
