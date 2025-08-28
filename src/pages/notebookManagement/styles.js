import styled from "styled-components";
import { AppContainer } from "../../components/App/styles";

export const Container = styled(AppContainer)`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: transparent;
  border: none;
  box-shadow: none;

  @media (max-width: 768px) {
    padding: 12px 8px;
    width: 100%;
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  width: 100%;

  h1 {
    margin: 0;
    font-size: 1.8em;
    color: #333;
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 1.5em;
    }
  }
`;

export const BackButton = styled.button`
  background: transparent;
  border: 1px solid #4caf50;
  color: #4caf50;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #4caf50;
    color: white;
  }
`;

export const Section = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  h2 {
    margin: 0 0 16px 0;
    color: #333;
    font-size: 1.4em;
  }

  @media (max-width: 768px) {
    padding: 12px;
    h2 {
      font-size: 1.2em;
    }
  }
`;

export const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 8px;
  width: ${(props) => (props.fullWidth ? "100%" : "auto")};
  max-width: ${(props) => (props.fullWidth ? "100%" : "300px")};

  @media (max-width: 768px) {
    margin-bottom: 8px;
    width: 100%;
  }
`;

export const Button = styled.button`
  background: #4caf50;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 4px;

  &:hover {
    background: #45a049;
  }

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }

  ${(props) =>
    props.secondary &&
    `
    background: white;
    border: 1px solid #4CAF50;
    color: #4CAF50;

    &:hover {
      background: #f0f0f0;
    }
  `}

  ${(props) =>
    props.danger &&
    `
    background: #ff4444;
    
    &:hover {
      background: #cc0000;
    }
  `}

  @media (max-width: 768px) {
    width: 100%;
    margin: 4px 0;
  }
`;

export const FlexContainer = styled.div`
  display: flex;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const SidePanel = styled.div`
  width: 30%;
  min-width: 250px;

  @media (max-width: 768px) {
    width: 100%;
    min-width: unset;
  }
`;

export const MainPanel = styled.div`
  flex: 1;
`;

export const NotebookList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const NotebookItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  margin-bottom: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${(props) => (props.selected ? "#e8f5e9" : "transparent")};

  &:hover {
    background: #f5f5f5;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
`;
export const TextArea = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f8f8f8;
  font-family: monospace;
  margin-bottom: 12px;
  resize: vertical;
`;

export const FilterButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

export const WordList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const WordItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background: #f8f8f8;
  border-radius: 4px;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
`;

export const ProficiencyBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  background: ${(props) => {
    switch (props.level) {
      case 1:
        return "#ffebee";
      case 2:
        return "#fff3e0";
      case 3:
        return "#e8f5e9";
      default:
        return "#f5f5f5";
    }
  }};
  color: ${(props) => {
    switch (props.level) {
      case 1:
        return "#c62828";
      case 2:
        return "#ef6c00";
      case 3:
        return "#2e7d32";
      default:
        return "#333";
    }
  }};
`;

// 新增：固定高度可滾動的表格樣式（支援手機）
export const WordTableWrapper = styled.div`
  border: 1px solid #ddd;
  border-radius: 6px;
  max-height: 420px; /* 固定高度 */
  overflow-y: auto; /* 垂直捲動 */
  overflow-x: auto; /* 小螢幕可橫向捲動 */
  background: #fff;
  scrollbar-width: none;
`;

export const WordTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead th {
    position: sticky;
    top: 0;
    background: #fafafa;
    z-index: 1;
    border-bottom: 1px solid #eee;
  }

  th,
  td {
    padding: 10px 8px;
    border-bottom: 1px solid #f0f0f0;
    text-align: left;
    font-size: 12px;
    vertical-align: middle;
  }

  th:nth-child(1) {
    width: 25%;
  }
  th:nth-child(2) {
    width: 20%;
  }
  th:nth-child(3) {
    width: 10%;
  }
  th:nth-child(4) {
    width: 30%;
    text-align: right;
  }

  tbody tr:hover {
    background: #fafafa;
  }

  @media (max-width: 768px) {
    th,
    td {
      font-size: 12px;
      padding: 4px 3px;
    }
  }
`;
