import styled from "styled-components";
import { SettingsToggle } from "../../components/App/styles";

export const GameBox = styled.div`
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 16px;
  margin-top: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
`;

export const StageToggleWrap = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 6px 0 10px;
`;

export const StageBtn = styled.button`
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid ${(p) => (p.active ? "#4caf50" : "#ddd")};
  color: ${(p) => (p.active ? "#fff" : "#333")};
  background: ${(p) => (p.active ? "#4caf50" : "#f7f7f7")};
  cursor: pointer;
`;

export const Btn = styled.button`
  padding: 5px 7px;
  border: 1px solid #ddd;
  background: ${(p) => (p.primary ? "#4caf50" : "#f7f7f7")};
  color: ${(p) => (p.primary ? "#fff" : "#333")};
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    filter: brightness(0.98);
  }
`;

export const Bar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const PanelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const Panel = styled.div`
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 10px;
`;

export const PanelTitle = styled.div`
  font-weight: 600;
  color: #444;
  margin-bottom: 8px;
`;

export const List = styled.ul`
  margin: 0;
  padding-left: 18px;
  max-height: 180px;
  overflow: auto;
`;

export const ListItem = styled.li`
  color: #333;
  margin: 2px 0;
`;

export const IconContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px; /* Keep it on the right side */
  z-index: 100;
`;

export const IconGroup = styled.div`
  display: flex;
  gap: 10px; /* Adjust gap between icons */
  flex-direction: row-reverse; /* Put HomeIcon (↩️) on the far right */
`;

export const HomeIcon = styled(SettingsToggle)`
  right: 5px;
`;
