import styled from "styled-components";

const proficiencyColors = {
  1: "#007bff", // blue
  2: "#ffc107", // orange
  3: "#dc3545", // red
};

// 容器
export const CardContainer = styled.div`
  position: relative;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #ffffff;
  margin-bottom: 16px;
  box-shadow: rgba(0, 0, 0, 0.08) 0px 8px 24px;
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

export const ProficiencyBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 6px;
  border: 1px solid ${(props) => proficiencyColors[props.level] || "#ccc"};
  color: ${(props) => proficiencyColors[props.level] || "#ccc"};
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
`;

// 平假名 toggle 容器
export const HiraganaToggleContainer = styled.div`
  margin-top: 15px;
  margin-bottom: 8px;
  display: flex;
  justify-content: center; /* 水平置中 */
`;

// 平假名文字容器
export const HiraganaTextContainer = styled.div`
  display: flex;
  justify-content: center; /* 水平置中 */
  margin-bottom: 8px;
`;

// toggle 按鈕
export const ToggleButton = styled.button`
  font-size: 14px;
  margin-right: 8px;
  cursor: pointer;
  border: none;
  background: none;
  padding: 0 !important;

  &:hover {
    opacity: 0.8;
  }
`;

// 平假名文字
export const HiraganaText = styled.span`
  font-size: 20px;
  font-weight: bold;
`;

// 主題文字 + 發音
export const WordContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 30px;
  justify-content: center; /* 水平置中 */
  margin-top: 20px;
`;

export const SpeakButton = styled.span`
  cursor: pointer;
  user-select: none;
  transition: transform 0.1s;

  &:active {
    transform: scale(0.9);
  }
`;

// 選項按鈕
export const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
`;

export const OptionButton = styled.button`
  padding: 16px 20px;
  font-size: 17px;
  border: 2px solid #e0e0e0;
  border-radius: 14px;
  background: #fff;
  color: #222;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.4, 2, 0.6, 1);
  position: relative;
  overflow: hidden;
  width: 100%;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  font-weight: 500;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  z-index: 1;

  &:before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 6px;
    background: linear-gradient(180deg, #007bff 0%, #00c6ff 100%);
    border-radius: 14px 0 0 14px;
    opacity: 0;
    transition: opacity 0.22s;
    z-index: 2;
  }

  &:hover,
  &:focus {
    border-color: #007bff;
    background: linear-gradient(90deg, #f0f6ff 0%, #f8f9ff 100%);
    color: #007bff;
    box-shadow: 0 4px 16px rgba(0, 123, 255, 0.1);
    outline: none;
  }
  &:hover:before,
  &:focus:before {
    opacity: 1;
  }

  &:active {
    background: #e6f0ff;
    color: #0056b3;
    transform: scale(0.98);
  }

  @media (max-width: 600px) {
    font-size: 16px;
    padding: 12px 10px;
    border-radius: 10px;
    &:before {
      border-radius: 10px 0 0 10px;
    }
  }
`;

// 結果區塊
export const ResultContainer = styled.div`
  border-top: 1px solid #e0e0e0;
  text-align: center;
`;

// 答案文字
export const AnswerText = styled.div`
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  margin-top: 5px;
  color: ${(props) => (props.correct ? "green" : "red")};
`;

export const NextButton = styled.button`
  margin-top: 10px;
  padding: 12px 16px;
  font-size: 16px;
  border: 1px solid #007bff;
  border-radius: 6px;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;

  &:hover {
    background-color: #007bff;
    color: white;
  }
`;

export const SubCard = styled.div`
  margin-top: 5px;
  display: flex;
  flex-direction: column;
  align-items: center; /* 🔹 全部置中 */
  gap: 4px; /* 🔹 間距稍微小一點 */
  padding: 10px 16px;
  // background-color: #f9f9f9; /* 🔹 淺灰底色 */
  border-radius: 8px; /* 🔹 圓角 */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); /* 🔹 陰影 */
`;

export const ProficiencyControlContainer = styled.div`
  display: flex;
  gap: 2px;
  position: absolute;
  right: 5px;
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
