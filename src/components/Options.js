import React from "react";
import styled from "styled-components";

const OptionsContainer = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
`;

const OptionButton = styled.button`
  padding: 12px 20px;
  font-size: 16px;
  border: 2px solid #007bff;
  border-radius: 8px;
  background-color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #007bff;
    color: white;
  }

  &:active {
    background-color: #0056b3;
    color: white;
  }
`;

export default function Options({ options, checkAnswer }) {
  return (
    <OptionsContainer>
      {options.map((opt, i) => (
        <OptionButton key={i} onClick={() => checkAnswer(opt)}>
          {opt}
        </OptionButton>
      ))}
    </OptionsContainer>
  );
}
