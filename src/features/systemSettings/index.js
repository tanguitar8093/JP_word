import React, { useState } from "react";
import SettingsPanel from "../../components/common/SettingsPanel/index.js";
import {
  AppContainer,
  Title,
  SettingsToggle,
} from "../../components/App/styles";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const HomeIcon = styled(SettingsToggle)`
  position: absolute;
  top: 10px;
  right: 10px;
`;

function SystemSettingsPage() {
  const [rate, setRate] = useState(1.0);
  const [playbackOptions, setPlaybackOptions] = useState({
    jp: true,
    ch: true,
    jpEx: false,
    chEx: false,
    autoNext: true,
  });

  const navigate = useNavigate();

  return (
    <AppContainer>
      <HomeIcon onClick={() => navigate("/")}>↩️</HomeIcon>
      <Title>系統設定</Title>
      <SettingsPanel
        rate={rate}
        setRate={setRate}
        playbackOptions={playbackOptions}
        setPlaybackOptions={setPlaybackOptions}
      />
    </AppContainer>
  );
}

export default SystemSettingsPage;
