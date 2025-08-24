import styled from 'styled-components';

export const CardContainer = styled.div`
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #ffffff;
  margin-bottom: 16px;
  text-align: center;
`;

export const WordContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 30px;
  margin-bottom: 20px;
`;

export const AnswerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
`;

export const ActionButton = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #ccc;

  &.hard {
    background-color: #ffc107;
  }
  &.good {
    background-color: #007bff;
    color: white;
  }
  &.easy {
    background-color: #28a745;
    color: white;
  }
`;

export const ShowAnswerButton = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 6px;
  cursor: pointer;
`;
