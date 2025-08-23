import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: #f0f2f5;
  height: 100vh;
`;

export const Title = styled.h1`
  color: #333;
  margin-bottom: 2rem;
`;

export const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

export const Button = styled.button`
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

export const Status = styled.p`
  font-size: 1.2rem;
  color: #dc3545;
  margin-top: 1rem;
`;

export const AudioPlayer = styled.audio`
  margin-top: 2rem;
  width: 100%;
  max-width: 500px;
`;
