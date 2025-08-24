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
import {
  setPlaybackOptions,
  setPlaybackSpeed,
  setAutoProceed,
  setProficiencyFilter,
  setStartQuestionIndex,
  setWordRangeCount,
  setSortOrder,
  setWordType,
} from "./reducer";

const HomeIcon = styled(SettingsToggle)`
  position: absolute;
  top: 10px;
  right: 10px;
`;

function SystemSettingsPage() {
  const { state, dispatch } = useApp();
  const { systemSettings } = state;
  const {
    playbackOptions,
    playbackSpeed,
    autoProceed,
    proficiencyFilter,
    startQuestionIndex, // Destructure new state variable
    wordRangeCount, // Destructure new state variable
    sortOrder,
    wordType,
  } = systemSettings; // Destructure systemSettings

  const navigate = useNavigate();
  return (
    <AppContainer>
      <HomeIcon onClick={() => navigate("/")}>↩️</HomeIcon>
      <Title>系統設定</Title>
      <SettingsPanel
        setWordType={(newType) => dispatch(setWordType(newType))}
        wordType={wordType}
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
        proficiencyFilter={proficiencyFilter}
        setProficiencyFilter={(newFilter) =>
          dispatch(setProficiencyFilter(newFilter))
        }
        startQuestionIndex={startQuestionIndex} // Pass new prop
        setStartQuestionIndex={(newIndex) =>
          dispatch(setStartQuestionIndex(newIndex))
        } // Pass new setter
        wordRangeCount={wordRangeCount} // Pass new prop
        setWordRangeCount={(newCount) => dispatch(setWordRangeCount(newCount))} // Pass new setter
        sortOrder={sortOrder}
        setSortOrder={(newOrder) => dispatch(setSortOrder(newOrder))}
      />
    </AppContainer>
  );
}

export default SystemSettingsPage;
