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
