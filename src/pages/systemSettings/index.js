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
import { // Import actions from systemSettings reducer
  setPlaybackOptions,
  setPlaybackSpeed,
  setAutoProceed,
  setQuizScope,
} from "./reducer";

const HomeIcon = styled(SettingsToggle)`
  position: absolute;
  top: 10px;
  right: 10px;
`;

function SystemSettingsPage() {
  const { state, dispatch } = useApp(); // Use global state and dispatch
  const { systemSettings } = state; // Access systemSettings from global state
  const {
    playbackOptions,
    playbackSpeed,
    autoProceed,
    quizScope,
  } = systemSettings; // Destructure systemSettings

  const navigate = useNavigate();

  return (
    <AppContainer>
      <HomeIcon onClick={() => navigate("/")}>↩️</HomeIcon>
      <Title>系統設定</Title>
      <SettingsPanel
        playbackOptions={playbackOptions}
        setPlaybackOptions={(newOptions) =>
          dispatch(setPlaybackOptions(newOptions))
        }
        playbackSpeed={playbackSpeed}
        setPlaybackSpeed={(newSpeed) => dispatch(setPlaybackSpeed(newSpeed))}
        
        autoProceed={autoProceed}
        setAutoProceed={(newAutoProceed) =>
          dispatch(setAutoProceed(newAutoProceed))
        }
        quizScope={quizScope}
        setQuizScope={(newScope) => dispatch(setQuizScope(newScope))}
      />
    </AppContainer>
  );
}

export default SystemSettingsPage;