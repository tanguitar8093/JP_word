import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { AppContainer, Title } from "../../components/App/styles";

const Container = styled(AppContainer)`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
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
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding: 8px;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 8px;
  padding: 12px 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 8px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
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
  display: none;
  
  @media (min-width: 769px) {
    display: block;
  }
`;

const IconWrapper = styled.div`
  font-size: 1.5em;
  margin-bottom: 4px;
  color: #4CAF50;
  
  @media (max-width: 768px) {
    font-size: 1.2em;
    margin-bottom: 2px;
  }
`;

const menuItems = [
  {
    title: '快速測驗',
    description: '測試日語能力',
    path: '/quiz',
    icon: '📝'
  },
  {
    title: '單字讀本',
    description: '練習朗讀',
    path: '/word-reading',
    icon: '📚'
  },
  {
    title: 'Anki',
    description: '間隔重複學習',
    path: '/word-management',
    icon: '🗂'
  },
  {
    title: '筆記本',
    description: '管理單字庫',
    path: '/notebook-management',
    icon: '📔'
  },
  {
    title: '錄音',
    description: '練習發音',
    path: '/recorder',
    icon: '🎤'
  },
  {
    title: '設定',
    description: '系統設定',
    path: '/settings',
    icon: '⚙️'
  }
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
