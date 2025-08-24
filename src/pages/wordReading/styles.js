import styled from 'styled-components';

export const CounterContainer = styled.div`
  display: flex;
  gap: 2px; /* Smaller gap */
  z-index: 100;
`;

export const CounterItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px; /* Smaller width */
  height: 20px; /* Smaller height */
  border-radius: 50%;
  color: white;
  font-weight: bold;
  font-size: 0.7em; /* Smaller font size */

  &.new {
    background-color: #007bff; /* Blue */
  }

  &.learning {
    background-color: #dc3545; /* Red */
  }

  &.review {
    background-color: #28a745; /* Green */
  }
`;