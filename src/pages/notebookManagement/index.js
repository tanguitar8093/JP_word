import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import notebookService from "../../services/notebookService";
import { useApp } from "../../store/contexts/AppContext";
import { getNotebooks, setCurrentNotebook } from "../../store/reducer/actions";
import { AppContainer } from "../../components/App/styles";
import NotebookTable from "./components/NotebookTable";

const Container = styled(AppContainer)`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  background: transparent;
  gap: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  h1 {
    margin: 0;
    font-size: 1.8em;
    color: #2c3e50;
    font-weight: 600;
  }
`;

const ContentArea = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  min-height: 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: calc(100vh - 200px);
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  h2 {
    margin: 0 0 20px;
    color: #2c3e50;
    font-size: 1.4em;
    font-weight: 600;
  }
`;

const MainContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: calc(100vh - 200px);
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  h2 {
    margin: 0 0 24px;
    color: #2c3e50;
    font-size: 1.4em;
    font-weight: 600;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 1em;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4caf50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  ${(props) => {
    if (props.variant === "secondary") {
      return `
        background: #f8f9fa;
        color: #2c3e50;
        border: 1px solid #e9ecef;
        
        &:hover {
          background: #e9ecef;
        }
      `;
    } else {
      return `
        background: #4caf50;
        color: white;
        
        &:hover {
          background: #45a049;
        }
      `;
    }
  }}

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;
function NotebookManagement() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [notebooks, setNotebooks] = useState([]);
  const [newNotebookName, setNewNotebookName] = useState("");
  const [editingNotebook, setEditingNotebook] = useState(null);

  useEffect(() => {
    // Get all notebooks when component mounts
    const loadedNotebooks = notebookService.getNotebooks();
    setNotebooks(loadedNotebooks);
  }, []);

  const handleCreateNotebook = () => {
    if (!newNotebookName.trim()) return;

    // Create a new notebook
    const newNotebook = notebookService.createNotebook(newNotebookName);

    // Update state
    setNotebooks((prevNotebooks) => [...prevNotebooks, newNotebook]);
    setNewNotebookName("");

    // Update global state
    dispatch(getNotebooks(notebookService.getNotebooks()));
  };

  const handleEditNotebook = (notebook) => {
    setEditingNotebook(notebook);
    setNewNotebookName(notebook.name);
  };

  const handleUpdateNotebook = () => {
    if (!newNotebookName.trim() || !editingNotebook) return;

    // Update the notebook
    notebookService.updateNotebook(editingNotebook.id, {
      name: newNotebookName,
    });

    // Update state
    setNotebooks((prevNotebooks) =>
      prevNotebooks.map((nb) =>
        nb.id === editingNotebook.id ? { ...nb, name: newNotebookName } : nb
      )
    );

    // Reset form
    setEditingNotebook(null);
    setNewNotebookName("");

    // Update global state
    dispatch(getNotebooks(notebookService.getNotebooks()));
  };

  const handleDeleteNotebook = (notebookId) => {
    if (window.confirm("確定要刪除這個筆記本嗎？")) {
      // Delete the notebook
      notebookService.deleteNotebook(notebookId);

      // Update state
      setNotebooks((prevNotebooks) =>
        prevNotebooks.filter((notebook) => notebook.id !== notebookId)
      );

      // Update global state
      dispatch(getNotebooks(notebookService.getNotebooks()));
    }
  };

  const handleSelectNotebook = (notebookId) => {
    dispatch(setCurrentNotebook(notebookId));
    navigate("/word-management");
  };

  const handleImportNotebook = async (file) => {
    try {
      const newNotebook = await notebookService.importNotebook(file);
      // 更新本地狀態
      setNotebooks((prevNotebooks) => [...prevNotebooks, newNotebook]);
      // 更新全局狀態
      dispatch(getNotebooks(notebookService.getNotebooks()));
      alert("筆記本匯入成功！");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <Container>
      <Header>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Button variant="secondary" onClick={() => navigate("/")}>
            返回
          </Button>
          <h1>筆記本管理</h1>
        </div>
      </Header>

      <ContentArea>
        <Sidebar>
          <h2>新增筆記本</h2>
          <Input
            type="text"
            placeholder="輸入筆記本名稱"
            value={newNotebookName}
            onChange={(e) => setNewNotebookName(e.target.value)}
            maxLength={20}
          />
          <ButtonGroup>
            {editingNotebook ? (
              <>
                <Button onClick={handleUpdateNotebook}>更新</Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditingNotebook(null);
                    setNewNotebookName("");
                  }}
                >
                  取消
                </Button>
              </>
            ) : (
              <Button onClick={handleCreateNotebook}>新增筆記本</Button>
            )}
          </ButtonGroup>

          <h2 style={{ marginTop: "24px" }}>匯入筆記本</h2>
          <Input
            type="file"
            accept=".json"
            onChange={(event) => {
              const file = event.target.files[0];
              if (file) {
                handleImportNotebook(file);
                event.target.value = null;
              }
            }}
          />
        </Sidebar>

        <MainContent>
          <h2>筆記本列表</h2>
          <NotebookTable
            notebooks={notebooks}
            onEditNotebook={handleEditNotebook}
            onDeleteNotebook={handleDeleteNotebook}
            onSelectNotebook={handleSelectNotebook}
            currentNotebookId={state.shared.currentNotebookId}
          />
        </MainContent>
      </ContentArea>
    </Container>
  );
}

export default NotebookManagement;
