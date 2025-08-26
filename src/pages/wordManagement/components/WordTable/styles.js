import styled from "styled-components";

export const TableContainer = styled.div`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
  overflow: hidden;
  position: relative;
`;

export const TableWrapper = styled.div`
  max-height: 600px;
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

export const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
`;

export const TableHeader = styled.tr`
  background: #f8f9fa;
  position: sticky;
  top: 0;
  z-index: 1;

  th {
    padding: 16px;
    text-align: left;
    font-weight: 600;
    color: #2c3e50;
    font-size: 0.9em;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #e9ecef;

    &:first-child {
      padding-left: 24px;
    }

    &:last-child {
      padding-right: 24px;
    }
  }
`;

export const TableRow = styled.tr`
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${(props) => (props.isOverdue ? "#fff5f5" : "white")};

  &:hover {
    background: ${(props) => (props.isOverdue ? "#ffe3e3" : "#f8f9fa")};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const TableCell = styled.td`
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
  color: #2c3e50;
  font-size: 0.95em;

  &:first-child {
    padding-left: 24px;
    font-weight: 500;
  }

  &:last-child {
    padding-right: 24px;
  }

  // 日文單字樣式
  &:nth-child(1) {
    font-size: 1.1em;
  }

  // 漢字樣式
  &:nth-child(2) {
    font-family: "Noto Sans JP", sans-serif;
    color: #34495e;
  }

  // 中文樣式
  &:nth-child(3) {
    color: #7f8c8d;
  }

  // 狀態樣式
  &:nth-child(4) {
    font-weight: 500;
  }

  // 熟練度樣式
  &:nth-child(5) {
    text-align: center;

    &[data-proficiency="1"] {
      color: #e74c3c;
    }
    &[data-proficiency="2"] {
      color: #f39c12;
    }
    &[data-proficiency="3"] {
      color: #27ae60;
    }
  }

  // 下次複習樣式
  &:nth-child(6) {
    font-size: 0.9em;
    color: ${(props) => (props.isOverdue ? "#e74c3c" : "#7f8c8d")};
  }
`;
