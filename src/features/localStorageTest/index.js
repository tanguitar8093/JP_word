import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f0f2f5;
  font-family: 'Arial', sans-serif;
  padding: 20px;
`;

const Input = styled.input`
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 80%;
  max-width: 400px;
  font-size: 1em;
`;

const DisplayText = styled.p`
  font-size: 1.2em;
  color: #333;
  font-weight: bold;
`;

const LocalStorageTest = () => {
  const [inputValue, setInputValue] = useState('');
  const [storedValue, setStoredValue] = useState('沒值');

  useEffect(() => {
    // Read from localStorage on component mount
    const item = localStorage.getItem('testValue');
    if (item) {
      setStoredValue(item);
    } else {
      setStoredValue('沒值');
    }
  }, []);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      localStorage.setItem('testValue', inputValue);
      setStoredValue(inputValue);
      setInputValue(''); // Clear input after saving
    }
  };

  return (
    <Container>
      <h2>LocalStorage 測試</h2>
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder="輸入文字並按 Enter 儲存"
      />
      <DisplayText>儲存的值: {storedValue}</DisplayText>
    </Container>
  );
};

export default LocalStorageTest;
