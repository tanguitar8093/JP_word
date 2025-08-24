import styled from "styled-components";

export const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: sans-serif;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

export const Title = styled.h2`
  margin: 0;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

export const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #4caf50;
  color: white;
  cursor: pointer;

  &:hover {
    background: #45a049;
  }
`;

export const NotebookInfo = styled.div`
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f8f8;
  border-radius: 4px;

  b {
    margin-right: 8px;
  }
`;

export const FilterGroup = styled.div`
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
`;

export const FilterButton = styled(Button)`
  background: ${(props) => (props.active ? "#4CAF50" : "#ddd")};

  &:hover {
    background: ${(props) => (props.active ? "#45a049" : "#ccc")};
  }
`;
