import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  margin-top: 5px;
  flex-direction: column;
  align-items: center; /* 🔹 全部置中 */
  gap: 4px; /* 🔹 間距稍微小一點 */
  padding: 6px 16px;
  border-radius: 8px; /* 🔹 圓角 */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); /* 🔹 陰影 */
`;

export const LabelRow = styled.p`
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0; /* 🔹 去掉段落上下 margin */
`;

export const TextRow = styled.p`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  text-align: center; /* 🔹 文字置中 */
  margin: 0;
`;

export const SpeakButton = styled.span`
  cursor: pointer;
  font-size: 18px;
  user-select: none;
  transition: transform 0.1s;

  &:hover {
    color: #007bff;
  }

  &:active {
    transform: scale(0.9);
  }
`;
