import styled from "styled-components";

export const PanelContainer = styled.div`
  margin-top: 10px;
  padding: 12px 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fdfdfd;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const LabelGroup = styled.label`
  display: flex;
  flex-direction: column;
  font-size: 14px;
  color: #333;
`;

export const RangeInput = styled.input`
  margin-top: 4px;
  width: 100%;
`;

export const SelectInput = styled.select`
  margin-top: 4px;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    border-color: #007bff;
  }
`;

export const ValueText = styled.span`
  margin-left: 8px;
  font-weight: bold;
`;
