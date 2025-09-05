import styled from "styled-components";
import { SettingsToggle } from "../../../../components/App/styles";

export const IconContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 100;
`;

export const IconGroup = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: row-reverse;
`;

export const HomeIcon = styled(SettingsToggle)`
  right: 5px;
`;

export const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const RightPanel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const TinyButton = styled.button`
  padding: 2px 6px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f0f0f0;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  line-height: 1.4;

  &:hover {
    background-color: #e7e7e7;
  }

  &.active {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
  }
`;
