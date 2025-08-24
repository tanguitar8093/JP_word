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

  input[type="checkbox"], input[type="radio"] {
    margin-right: 5px;
  }
`;

export const SettingTitle = styled.span`
  font-weight: bold;
  margin-bottom: 5px; /* Space between title and input/options */
`;

export const RangeInput = styled.input`
  width: 100%;
`;
