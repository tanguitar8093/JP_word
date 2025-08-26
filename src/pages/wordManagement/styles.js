import styled from "styled-components";

export const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, -apple-system, sans-serif;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

export const Title = styled.h2`
  margin: 0;
  font-size: 1.6em;
  color: #2c3e50;
  font-weight: 600;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

export const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: ${(props) => (props.secondary ? "#f8f9fa" : "#4caf50")};
  color: ${(props) => (props.secondary ? "#2c3e50" : "white")};
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid ${(props) => (props.secondary ? "#e9ecef" : "#4caf50")};

  &:hover {
    background: ${(props) => (props.secondary ? "#e9ecef" : "#45a049")};
    transform: translateY(-1px);
  }
`;

export const ContentArea = styled.div`
  flex: 1;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  min-height: 0; // Important for nested scrolling

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  &:active {
    transform: translateY(0);
  }
`;

export const NotebookList = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: calc(100vh - 140px);
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

export const WordList = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: calc(100vh - 140px); // 固定高度，减去header和padding的高度
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
  height: calc(100vh - 140px);
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

export const NotebookInfo = styled.div`
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;

  b {
    margin-right: 8px;
    color: #2c3e50;
  }
`;

export const FilterGroup = styled.div`
  margin-bottom: 20px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const FilterButton = styled(Button)`
  padding: 8px 16px;
  background: ${(props) => (props.active ? "#4CAF50" : "#f8f9fa")};
  color: ${(props) => (props.active ? "white" : "#2c3e50")};
  border: 1px solid ${(props) => (props.active ? "#4CAF50" : "#e9ecef")};

  &:hover {
    background: ${(props) => (props.active ? "#45a049" : "#e9ecef")};
  }
`;
