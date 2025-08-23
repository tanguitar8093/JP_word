import React from 'react';
import {
  ModalOverlay,
  ModalContainer,
  ModalContent,
  ModalActions,
  ModalButton,
} from './styles';

const Modal = ({ message, onConfirm, onCancel, isVisible, disableCancel }) => {
  if (!isVisible) return null;

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalContent>{message}</ModalContent>
        <ModalActions>
          <ModalButton onClick={onConfirm}>確定</ModalButton>
          {!disableCancel && (
            <ModalButton onClick={onCancel} cancel>
              取消
            </ModalButton>
          )}
        </ModalActions>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default Modal;
