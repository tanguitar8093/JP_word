import React from "react";
import SettingsPanel from "../../components/SettingsPanel/index.js";
import {
  AppContainer,
  Title,
  SettingsToggle,
} from "../../components/App/styles";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useApp } from "../../store/contexts/AppContext"; // Import useApp

const HomeIcon = styled(SettingsToggle)`
  position: absolute;
  top: 10px;
  right: 10px;
`;

function SystemSettingsPage() {
  const navigate = useNavigate();
  return (
    <AppContainer>
      <HomeIcon onClick={() => navigate("/")}>↩️</HomeIcon>
      <Title>系統設定</Title>
      <SettingsPanel />
    </AppContainer>
  );
}

export default SystemSettingsPage;
