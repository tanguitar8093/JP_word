import styled from "styled-components";
export const SpeakButton = styled.span`
  cursor: pointer;
  font-size: 10x;
  user-select: none;
  transition: transform 0.1s;

  &:hover {
    color: #007bff;
  }

  &:active {
    transform: scale(0.9);
  }
`;

export const StatisticsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  // background-color: #f0f0f0;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); /* 🔹 陰影 */
  width: 80%;
  max-width: 600px;
  margin: 20px auto;
`;

export const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 10px; /* Adjust padding to match QuestionItem */
  margin-bottom: 10px; /* Space between header and list */
  border-bottom: 1px solid #e0e0e0;
  font-weight: bold;
  border-radius: 5px; /* Match QuestionList border-radius */
  width: 100%; /* Take full width of parent */
`;

export const HeaderItem = styled.div`
  flex: 1; /* Default flex for items */
  text-align: center; /* Default center alignment */

  &:first-child {
    flex: 0 0 50px; /* Fixed width for "結果" */
    text-align: left;
  }

  &:nth-child(2) {
    flex-grow: 1; /* "單字" takes remaining space */
    text-align: center;
  }

  &:last-child {
    flex: 0 0 60px; /* Fixed width for "熟練度" */
    text-align: right;
  }
`;

export const ScoreDisplay = styled.h2`
  color: #333;
  margin-bottom: 20px;
`;

export const QuestionList = styled.ul`
  list-style: none;
  padding: 0 10px;
  width: 100%;
  height: 400px; /* Fixed height for ~10 items */
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 5px;

  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */

  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const QuestionItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

export const QuestionText = styled.span`
  font-size: 14px;
  color: #555;
`;

export const StatusEmoji = styled.span`
  margin-right: 10px;
  font-size: 10px;
`;

export const EndQuizButton = styled.button`
  margin-top: 20px;
  padding: 12px 16px;
  font-size: 16px;
  border: 1px solid #007bff;
  border-radius: 6px;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;

  &:hover {
    background-color: #007bff;
    color: white;
  }
`;

export const ProficiencyControlContainer = styled.div`
  display: flex;
  gap: 2px;
`;

export const ProficiencyButton = styled.button`
  padding: 2px 4px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f0f0f0;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 10px;
  &:hover {
    background-color: #ddd;
  }

  &.active {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
  }
`;
