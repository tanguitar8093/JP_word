import styled from "styled-components";

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
`;

export const TableHeader = styled.tr`
  background: #f4f4f4;

  th {
    padding: 12px;
    text-align: left;
    font-weight: bold;
    border-bottom: 2px solid #ddd;
  }
`;

export const TableRow = styled.tr`
  cursor: pointer;
  background: ${(props) => (props.isOverdue ? "#fff3f3" : "white")};

  &:hover {
    background: ${(props) => (props.isOverdue ? "#ffe6e6" : "#f8f8f8")};
  }
`;

export const TableCell = styled.td`
  padding: 12px;
  border-bottom: 1px solid #eee;
`;
