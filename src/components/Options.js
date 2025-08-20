import React from "react";
import styled from "styled-components";

// 容器
const OptionsContainer = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column; /* 每行一個選項 */
  gap: 8px; /* 每個選項間距 */
`;

// 選項按鈕
const OptionButton = styled.button`
  padding: 10px 16px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #e0f0ff;
    border-color: #80c0ff;
  }

  &:active {
    background-color: #cce6ff;
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
