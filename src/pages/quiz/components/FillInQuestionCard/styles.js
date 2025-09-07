import styled from "styled-components";

export const CardContainer = styled.div`
  width: 100%;
  max-width: 720px;
  margin: 16px auto;
  padding: 25px 24px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  position: relative; /* 讓熟練度控制可絕對定位 */
`;

export const ProficiencyControlsContainer = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  gap: 4px;
  z-index: 10;
`;

export const TinyButton = styled.button`
  padding: 2px 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f0f0f0;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 11px;
  line-height: 1.2;
  min-width: 22px;

  &:hover {
    background-color: #e7e7e7;
  }

  &.active {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
  }
`;

export const Prompt = styled.div`
  font-size: 20px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  strong {
    font-weight: 700;
  }
  .speak {
    margin-left: 8px;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    padding: 6px 10px;
    background: #fafafa;
    cursor: pointer;
  }
`;

export const BlanksRow = styled.div`
  display: flex;
  gap: 8px;
  margin: 16px 0 8px;
  flex-wrap: wrap;
`;

export const BlankBox = styled.div`
  min-width: 34px;
  min-height: 42px;
  padding: 6px 10px;
  border-radius: 10px;
  border: 2px dashed #d0d0d0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  background: #fcfcfc;
  &.ok {
    border-color: #4caf50;
    background: #e8f5e9;
  }
  &.bad {
    border-color: #e53935;
    background: #ffebee;
  }
`;

export const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0 16px;
  button {
    border: 1px solid #ddd;
    border-radius: 12px;
    padding: 6px 12px;
    background: #fff;
    cursor: pointer;
  }
  .hint {
    color: #e53935;
    margin-left: auto;
    font-size: 13px;
  }
`;

export const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
  gap: 8px;
`;

export const OptionButton = styled.button`
  border: 1px solid #e0e0e0;
  background: #fafafa;
  border-radius: 10px;
  padding: 8px 6px;
  font-size: 18px;
  cursor: pointer;
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    background: #f0f0f0;
  }
`;

// 熟練度控制（與 Quiz 一致）
export const ProficiencyControlContainer = styled.div`
  display: flex;
  gap: 2px;
  position: absolute;
  right: 5px;
  top: 6px; /* 固定在卡片右上，避免與 Prompt 內容重疊 */
`;

export const ProficiencyButton = styled.button`
  padding: 2px 4px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f0f0f0;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 10px;

  &:hover {
    background-color: #ddd;
  }

  &.active {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
  }
`;
