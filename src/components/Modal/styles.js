import styled from 'styled-components';

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Transparent black */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalContainer = styled.div`
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  text-align: center;
  max-width: 400px;
  width: 90%;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const ModalContent = styled.p`
  font-size: 1.1em;
  color: #333;
  margin: 0;
`;

export const ModalActions = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
`;

export const ModalButton = styled.button`
  padding: 10px 25px;
  font-size: 1em;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  background-color: ${(props) => (props.cancel ? '#ccc' : '#007bff')};
  color: ${(props) => (props.cancel ? '#333' : 'white')};

  &:hover {
    background-color: ${(props) => (props.cancel ? '#bbb' : '#0056b3')};
  }
`;
