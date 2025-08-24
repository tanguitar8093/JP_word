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
  border: 1px solid #e0e0e0; /* Added border */
  border-radius: 8px; /* Added border-radius for rounded corners */
  padding: 15px; /* Added padding */
  background-color: #f9f9f9; /* Slightly different background for distinction */
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

  &.again {
    background-color: #dc3545; /* Red */
    color: white;
  }
  &.hard {
    background-color: #007bff; /* Blue */
    color: white;
  }
  &.good {
    background-color: #28a745; /* Green */
    color: white;
  }
  &.easy {
    background-color: #6f42c1; /* Purple */
    color: white;
  }
`;

export const ShowAnswerButton = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 6px;
  cursor: pointer;
`;
