import styled from "styled-components";

export const PanelContainer = styled.div`
  margin-top: 5px;
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fdfdfd;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: auto;
  max-height: 60vh;
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: #3b82f6 #f5f0e8; /* thumb 顏色 + track 顏色 */

  box-shadow: rgba(0, 0, 0, 0.08) 0px 8px 24px;
  width: 100%;

  /* Chrome, Edge, Safari */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #e9eefc;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #3b82f6;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-button {
    display: none; /* 隱藏上下箭頭 */
  }

  @media (max-width: 480px) {
    padding: 8px;
    max-height: 70vh;
  }
`;

export const LabelGroup = styled.label`
  display: flex;
  flex-direction: column;
  font-size: 14px;
  color: #333;
  margin-bottom: 10px; /* Added margin for spacing */

  &:last-child {
    margin-bottom: 0; /* No margin for the last item */
  }

  input[type="number"] {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    width: 100%;
    box-sizing: border-box; /* Include padding and border in the element's total width and height */
  }

  div {
    /* Styles for the div containing checkboxes/radios */
    display: flex;
    flex-wrap: wrap;
    gap: 10px; /* Spacing between options */
    margin-top: 5px;
  }

  label {
    /* Styles for individual checkbox/radio labels */
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #555;
  }

  input[type="checkbox"],
  input[type="radio"] {
    margin-right: 5px;
  }

  @media (max-width: 480px) {
    font-size: 13px;
    input[type="number"] {
      padding: 6px;
    }
    div {
      gap: 8px;
    }
  }
`;

export const SettingTitle = styled.span`
  font-weight: bold;
  margin-bottom: 5px; /* Space between title and input/options */
`;

export const RangeInput = styled.input`
  width: 100%;
`;
