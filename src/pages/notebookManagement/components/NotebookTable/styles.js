import styled from "styled-components";

export const TableContainer = styled.div`
  width: 100%;
  height: calc(100vh - 280px); // 减去header、标题和其他元素的高度
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
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 8px;
`;

export const TableHeader = styled.tr`
  background: #f8f9fa;

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
  background: ${(props) => (props.isSelected ? "#e8f5e9" : "white")};

  &:hover {
    background: ${(props) => (props.isSelected ? "#e8f5e9" : "#f8f9fa")};
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
`;

export const NoDataMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #7f8c8d;
  font-size: 0.95em;
`;

export const ActionsCell = styled(TableCell)`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

export const ActionButton = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.9em;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  ${(props) => {
    if (props.variant === "edit") {
      return `
        background: #f8f9fa;
        color: #2c3e50;
        border: 1px solid #e9ecef;
        
        &:hover {
          background: #e9ecef;
        }
      `;
    } else if (props.variant === "delete") {
      return `
        background: #fff5f5;
        color: #e53e3e;
        border: 1px solid #fee2e2;
        
        &:hover {
          background: #fee2e2;
        }
      `;
    }
  }}

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;
