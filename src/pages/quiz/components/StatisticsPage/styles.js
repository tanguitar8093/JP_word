import styled from "styled-components";

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

export const ScoreDisplay = styled.h2`
  color: #333;
  margin-bottom: 20px;
`;

export const QuestionList = styled.ul`
  list-style: none;
  padding: 0 10px;
  width: 100%;
  height: 280px; /* Fixed height for ~7 items */
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 5px;

  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */

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
  font-size: 1.1em;
  color: #555;
`;

export const StatusEmoji = styled.span`
  margin-right: 10px;
  font-size: 1.2em;
`;

export const FavoriteMark = styled.span`
  margin-left: 10px;
  cursor: pointer;
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
