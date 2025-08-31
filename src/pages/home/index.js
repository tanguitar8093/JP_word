import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { AppContainer, Title } from "../../components/App/styles";

const Container = styled(AppContainer)`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  background: transparent;
  border: none;
  box-shadow: none;

  @media (max-width: 768px) {
    padding: 12px 8px;
    width: 100%;
  }
`;

const MainTitle = styled(Title)`
  text-align: center;
  font-size: 2em;
  margin-bottom: 40px;
  color: #333;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 12px;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding: 4px;
  }
`;

const Card = styled.div`
  background: white;
  padding: 12px 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 90px;

  @media (max-width: 768px) {
    padding: 8px 4px;
    min-height: 75px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const CardTitle = styled.h3`
  margin: 4px 0;
  color: #333;
  font-size: 1em;

  @media (max-width: 768px) {
    font-size: 0.9em;
  }
`;

const CardDescription = styled.p`
  margin: 0;
  color: #666;
  font-size: 0.8em;
  display: block;

  @media (max-width: 768px) {
    font-size: 0.7em;
  }
`;

const IconWrapper = styled.div`
  font-size: 1.5em;
  margin-bottom: 4px;
  color: #4caf50;

  @media (max-width: 768px) {
    font-size: 1.2em;
    margin-bottom: 2px;
  }
`;

const menuItems = [
  {
    title: "單字快手",
    description: "日語選擇題",
    path: "/quiz",
    icon: "📝",
  },
  {
    title: "單字讀本",
    description: "練習朗讀",
    path: "/reading",
    icon: "📚",
  },
  {
    title: "拼字",
    description: "假名拼字練習",
    path: "/fillin",
    icon: "🔤",
  },
  {
    title: "單字挑戰",
    description: "間隔重複學習（示範）",
    path: "/word_test",
    icon: "🗂",
  },
  {
    title: "筆記本",
    description: "管理單字庫",
    path: "/notebook-management",
    icon: "📔",
  },
  {
    title: "設定",
    description: "系統設定",
    path: "/settings",
    icon: "⚙️",
  },
];

function HomePage() {
  const navigate = useNavigate();

  return (
    <Container>
      <MainTitle>日文單字通</MainTitle>
      <Grid>
        {menuItems.map((item, index) => (
          <Card key={index} onClick={() => navigate(item.path)}>
            <IconWrapper>{item.icon}</IconWrapper>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </Card>
        ))}
      </Grid>
    </Container>
  );
}

export default HomePage;
