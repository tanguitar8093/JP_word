import styled from "styled-components";

// 容器
export const CardContainer = styled.div`
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #ffffff;
  margin-bottom: 16px;
`;

// 平假名 toggle 容器
export const HiraganaToggleContainer = styled.div`
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
  padding: 0;

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
  margin-bottom: 5px;
  font-size: 30px;
  justify-content: center; /* 水平置中 */
`;

export const SpeakButton = styled.span`
  cursor: pointer;
`;

// 選項按鈕
export const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
`;

export const OptionButton = styled.button`
  padding: 10px 16px;
  font-size: 16px;
  border: 1px solid #007bff;
  border-radius: 6px;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #007bff;
    color: white;
  }

  &:active {
    background-color: #0056b3;
    color: white;
  }
`;

// 結果區塊
export const ResultContainer = styled.div`
  border-top: 1px solid #e0e0e0;
  text-align:center;
`;

// 答案文字
export const AnswerText = styled.p`
  font-size: 22px;
  font-weight: bold;
  text-align: center; /* 置中 */
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
  width: 100%; /* 滿寬撐滿父容器 */

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
  padding: 12px 16px;
  // background-color: #f9f9f9; /* 🔹 淺灰底色 */
  border-radius: 8px; /* 🔹 圓角 */
  box-shadow: 0 2px 6px rgba(0,0,0,0.1); /* 🔹 陰影 */
`;