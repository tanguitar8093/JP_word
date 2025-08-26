import styled from "styled-components";

export const CardContainer = styled.div`
  padding: 24px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

export const WordText = styled.div`
  margin-bottom: 20px;
  text-align: center;

  > div {
    margin: 12px 0;

    &:first-child {
      font-size: 28px;
      font-weight: 600;
      color: #2c3e50;
    }

    &:nth-child(2) {
      font-size: 20px;
      color: #34495e;
    }

    &:nth-child(3) {
      font-size: 18px;
      color: #7f8c8d;
    }
  }
`;

export const ExampleText = styled.div`
  font-size: 16px;
  color: #7f8c8d;
  margin: 20px 0;
  text-align: center;
  line-height: 1.5;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
`;

export const ActionButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  ${(props) => {
    if (props.variant === "easy") {
      return `
        background: #2ecc71;
        color: white;
        &:hover {
          background: #27ae60;
        }
      `;
    } else if (props.variant === "medium") {
      return `
        background: #f1c40f;
        color: #2c3e50;
        &:hover {
          background: #f39c12;
        }
      `;
    } else if (props.variant === "hard") {
      return `
        background: #e74c3c;
        color: white;
        &:hover {
          background: #c0392b;
        }
      `;
    } else {
      return `
        background: #4caf50;
        color: white;
        &:hover {
          background: #45a049;
        }
      `;
    }
  }}

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;
