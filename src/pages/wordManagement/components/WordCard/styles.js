import styled from 'styled-components';

export const CardContainer = styled.div`
  padding: 20px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 16px;
`;

export const WordText = styled.div`
  font-size: 24px;
  margin-bottom: 16px;
  text-align: center;
  
  > div {
    margin: 8px 0;
  }
`;

export const ExampleText = styled.div`
  font-size: 16px;
  color: #666;
  margin: 16px 0;
  text-align: center;
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
`;

export const ActionButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  background: #4CAF50;
  color: white;
  
  &:hover {
    background: #45a049;
  }
`;
