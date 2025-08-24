import styled from 'styled-components';

export const CounterContainer = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 10px;
  z-index: 100;
`;

export const CounterItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  font-weight: bold;
  font-size: 1.2em;

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