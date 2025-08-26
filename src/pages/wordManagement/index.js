import React, { useMemo, useState, useEffect } from "react";
import { useApp } from "../../store/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import SettingsPanel from "../../components/SettingsPanel";
import WordCard from "./components/WordCard";
import WordTable from "./components/WordTable";
import {
  PageContainer,
  Header,
  Title,
  ButtonGroup,
  Button,
  NotebookInfo,
  FilterGroup,
  FilterButton,
  ContentArea,
  WordList,
  NotebookList,
} from "./styles";
import notebookService from "../../services/notebookService";

function WordManagementPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  // 取得當前筆記本 context
  const currentNotebookId = state.shared.currentNotebookId;
  const notebooks = state.shared.notebooks || [];
  const currentNotebook = useMemo(
    () => notebooks.find((n) => n.id === currentNotebookId),
    [notebooks, currentNotebookId]
  );

  const words = useMemo(() => {
    return currentNotebook?.context || [];
  }, [currentNotebook]);

  const handleDeleteWord = (wordId) => {
    try {
      notebookService.deleteWordsFromNotebook(currentNotebookId, [wordId]);
      // 重新加載當前筆記本
      const updatedNotebook = notebookService.getNotebook(currentNotebookId);
      dispatch({ 
        type: 'shared/UPDATE_NOTEBOOK',
        payload: updatedNotebook
      });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <PageContainer>
      <Header>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Button secondary onClick={() => navigate(-1)}>
            返回
          </Button>
          <Title>單字管理</Title>
        </div>
      </Header>

      <ContentArea>
        <NotebookList>
          <h2
            style={{
              margin: "0 0 20px",
              color: "#2c3e50",
              fontSize: "1.4em",
              fontWeight: 600,
            }}
          >
            筆記本資訊
          </h2>
          {currentNotebook && (
            <NotebookInfo>
              <b>目前筆記本:</b> {currentNotebook.name}
              <div style={{ marginTop: "8px", color: "#666" }}>
                <b>單字數量:</b> {words.length}
              </div>
            </NotebookInfo>
          )}
        </NotebookList>

        <WordList>
          {words.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#2c3e50",
                background: "#f8f9fa",
                borderRadius: "12px",
                border: "1px solid #e9ecef",
              }}
            >
              此筆記本沒有單字。
            </div>
          ) : (
            <WordTable
              words={words}
              onDeleteWord={handleDeleteWord}
            />
          )}
        </WordList>
      </ContentArea>
    </PageContainer>
  );
}

export default WordManagementPage;
