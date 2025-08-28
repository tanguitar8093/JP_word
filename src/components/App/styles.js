import styled from "styled-components";

// 容器
export const AppContainer = styled.div`
  max-width: 600px;
  margin: 60px auto;
  padding: 20px;
`;

// 標題
export const Title = styled.h2`
  text-align: center;
  margin-bottom: 16px;
  user-select: none;
`;

// 進度文字
export const Progress = styled.p`
  text-align: center;
  margin-bottom: 24px;
  font-size: 16px;
  color: #555;
  user-select: none;
`;

// 設定按鈕
export const SettingsToggle = styled.span`
  cursor: pointer;
  font-size: 20px;
  user-select: none;
  transition: all 0.2s ease, transform 0.1s;
  position: absolute;
  top: 10px;
  right: 55px; /* 改成右上角 */
  z-index: 100;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    transform: scale(0.9);
  }
`;

// info 按鈕
export const InfoToggle = styled.span`
  cursor: pointer;
  font-size: 20px;
  user-select: none;
  transition: all 0.2s ease, transform 0.1s;
  position: absolute;
  top: 10px;
  right: 30px;
  z-index: 100;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    transform: scale(0.9);
  }
`;

export const BackPage = styled.span`
  cursor: pointer;
  font-size: 20px;
  user-select: none;
  transition: all 0.2s ease, transform 0.1s;
  position: absolute;
  top: 10px;
  right: 80px;
  z-index: 100;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    transform: scale(0.9);
  }
`;

// 懸浮設定面板
export const FloatingSettingsPanel = styled.div`
  position: absolute;
  top: 56px;
  right: 10px;
  background: #fff;
  padding: 5px 10px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  z-index: 99;
`;

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 98; /* lower than FloatingSettingsPanel and SettingsToggle */
`;
