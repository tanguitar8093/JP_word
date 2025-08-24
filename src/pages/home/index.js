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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px;
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const CardTitle = styled.h3`
  margin: 0 0 10px;
  color: #333;
  font-size: 1.2em;
`;

const CardDescription = styled.p`
  margin: 0;
  color: #666;
  font-size: 0.9em;
`;

const IconWrapper = styled.div`
  font-size: 2em;
  margin-bottom: 15px;
  color: #4CAF50;
`;

const menuItems = [
  {
    title: '單字練習',
    description: '開始一個客製化測驗，測試你的日語能力',
    path: '/quiz',
    icon: '📝'
  },
  {
    title: '單字朗讀',
    description: '練習閱讀和理解日語單字',
    path: '/word-reading',
    icon: '📚'
  },
  {
    title: '單字管理',
    description: 'Anki 式間隔重複學習系統',
    path: '/word-management',
    icon: '🗂'
  },
  {
    title: '單字庫',
    description: '管理你的單字筆記本和學習資料',
    path: '/notebook-management',
    icon: '📔'
  },
  {
    title: '錄音工具',
    description: '練習日語發音並錄製你的聲音',
    path: '/recorder',
    icon: '🎤'
  },
  {
    title: '系統設定',
    description: '自定義你的學習體驗',
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
