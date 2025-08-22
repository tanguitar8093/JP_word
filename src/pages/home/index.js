import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { AppContainer, Title } from "../../components/App/styles";

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const NavItem = styled.li`
  padding: 10px 16px;
  font-size: 16px;
  border: 1px solid #007bff;
  border-radius: 6px;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;

  &:hover {
    background-color: #007bff;
    color: white;
  }

  &:active {
    background-color: #0056b3;
    color: white;
  }
`;

const StyledLink = styled(Link)`
  color: inherit; /* 繼承父元素的顏色 */
  text-decoration: none;
  display: block;
`;

function HomePage() {
  return (
    <AppContainer>
      <Title>日文單字通</Title>
      <nav>
        <NavList>
          <NavItem>
            <StyledLink to="/quiz">單字練習</StyledLink>
          </NavItem>
          <NavItem>
            <StyledLink to="/word-reading">單字朗讀</StyledLink>
          </NavItem>
          <NavItem>
            <StyledLink to="/word-management">單字管理</StyledLink>
          </NavItem>
          <NavItem>
            <StyledLink to="/notebook-management">筆記本 (Beta)</StyledLink>
          </NavItem>
          <NavItem>
            <StyledLink to="/settings">系統設定</StyledLink>
          </NavItem>
          <NavItem>
            <StyledLink to="/recorder">錄音測試</StyledLink>
          </NavItem>
        </NavList>
      </nav>
    </AppContainer>
  );
}

export default HomePage;
