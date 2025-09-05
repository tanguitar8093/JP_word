import styled from "styled-components";
import { SettingsToggle } from "../../../../components/App/styles";

export const QuizContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 10px;

  @media (max-width: 768px) {
    margin-bottom: 12px;
  }
`;

export const QuizTitle = styled.h1`
  font-size: 1.5em;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.2em;
  }
`;

export const ProgressBar = styled.div`
  background: #e0e0e0;
  height: 6px;
  border-radius: 3px;
  margin: 12px 0;
  overflow: hidden;

  @media (max-width: 768px) {
    height: 4px;
    margin: 8px 0;
  }
`;

export const ProgressFill = styled.div`
  background: #4caf50;
  height: 100%;
  width: ${(props) => props.progress}%;
  transition: width 0.3s ease;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;

  @media (max-width: 768px) {
    gap: 8px;
  }
`;

export const IconButton = styled.button`
  background: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background: #f5f5f5;
  }

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 1em;
  }
`;

export const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
`;

export const QuestionArea = styled.div`
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 12px;
  }
`;

export const AnswerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

export const AnswerButton = styled.button`
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;

  &:hover {
    background: #f8f8f8;
    border-color: #4caf50;
  }

  &[data-correct="true"] {
    background: #4caf50;
    color: white;
    border-color: #4caf50;
  }

  &[data-wrong="true"] {
    background: #ff5252;
    color: white;
    border-color: #ff5252;
  }

  @media (max-width: 768px) {
    padding: 12px;
    font-size: 0.9em;
    border-radius: 8px;
  }
`;

export const ResultArea = styled.div`
  text-align: center;
  margin-top: 20px;

  @media (max-width: 768px) {
    margin-top: 12px;
  }
`;

// Moved from index.js
export const IconContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px; /* Keep it on the right side */
  z-index: 100;
`;

export const IconGroup = styled.div`
  display: flex;
  gap: 10px; /* Adjust gap between icons */
  flex-direction: row-reverse; /* Reverse the order to put HomeIcon on the right */
`;

export const HomeIcon = styled(SettingsToggle)`
  right: 5px;
`;

export const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const RightPanel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const TinyButton = styled.button`
  padding: 2px 6px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f0f0f0;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  line-height: 1.4;

  &:hover {
    background-color: #e7e7e7;
  }

  &.active {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
  }
`;
