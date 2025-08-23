import styled, { keyframes, css } from 'styled-components';

export const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  max-width: 400px;
  margin:5px;
`;

export const IconButton = styled.button`
  height: 28px;
  padding-left: 5px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  border: ${(props) => (props.round ? '2px solid #333' : '2px solid #333')};
  border-radius: ${(props) => (props.round ? '50%' : '4px')};

  background: #fff;
  transition: background-color 0.2s;

  &:active {
    background-color: #eee;
  }
`;

export const InfoButton = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: #333;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 2px 6px;
  cursor: pointer;

  &:hover {
    background-color: #f5f5f5;
  }
`;

export const Status = styled.span`
  font-size: 0.8rem;
  color: #dc3545;
  margin-left: 0.5rem;
  white-space: nowrap;
`;

export const AudioPlayer = styled.audio`
  flex: 1;
  height: 28px;
`;

// keyframes
const blink = keyframes`
  0%, 50%, 100% { opacity: 1; }
  25%, 75% { opacity: 0; }
`;

// 正確寫法，用 css helper
export const RecordIcon = styled.div`
  width: 14px;
  height: 14px;
  background: red;
  border-radius: 50%;
  ${(props) =>
    props.recording &&
    css`
      animation: ${blink} 1s infinite;
    `}
`;
