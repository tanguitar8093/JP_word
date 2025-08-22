import React, { useReducer } from "react";
import SettingsPanel from "../../components/SettingsPanel/index.js";
import {
  AppContainer,
  Title,
  SettingsToggle,
} from "../../components/App/styles";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { reducer, initialState, setRate, setPlaybackOptions } from "./reducer";

const HomeIcon = styled(SettingsToggle)`
  position: absolute;
  top: 10px;
  right: 10px;
`;

function SystemSettingsPage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { rate, playbackOptions } = state;

  const navigate = useNavigate();

  return (
    <AppContainer>
      <HomeIcon onClick={() => navigate("/")}>↩️</HomeIcon>
      <Title>系統設定</Title>
      <SettingsPanel
        rate={rate}
        setRate={(newRate) => dispatch(setRate(newRate))}
        playbackOptions={playbackOptions}
        setPlaybackOptions={(newOptions) =>
          dispatch(setPlaybackOptions(newOptions))
        }
      />
    </AppContainer>
  );
}

export default SystemSettingsPage;
