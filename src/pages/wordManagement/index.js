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
  const [newNotebookName, setNewNotebookName] = useState("");

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

  // 重新加載筆記本列表
  const refreshNotebooks = (currentId) => {
    const allNotebooks = notebookService.getNotebooks();
    dispatch({
      type: "shared/GET_NOTEBOOKS",
      payload: allNotebooks,
    });
    if (currentId) {
      dispatch({
        type: "shared/SET_CURRENT_NOTEBOOK",
        payload: currentId,
      });
      notebookService.setCurrentNotebookId(currentId);
    }
  };

  const handleDeleteWord = (wordId) => {
    try {
      notebookService.deleteWordsFromNotebook(currentNotebookId, [wordId]);
      // 重新加載當前筆記本
      refreshNotebooks(currentNotebookId);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCreateNotebook = () => {
    try {
      if (!newNotebookName.trim()) {
        alert("請輸入筆記本名稱");
        return;
      }
      const newNotebook = notebookService.createNotebook(newNotebookName);
      setNewNotebookName("");
      refreshNotebooks(newNotebook.id);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleImportNotebook = async (file) => {
    try {
      const newNotebook = await notebookService.importNotebook(file);
      refreshNotebooks(newNotebook.id);
      alert("筆記本匯入成功！");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleImport = (data) => {
    try {
      // 處理匯入的資料
      const currentContext = currentNotebook.context || [];
      let newContext;

      if (Array.isArray(data)) {
        // 如果匯入的是陣列，直接加到現有的 context
        newContext = [...currentContext, ...data];
      } else if (typeof data === "object") {
        // 如果匯入的是單個物件，把它加到陣列中
        newContext = [...currentContext, data];
      } else {
        throw new Error("匯入的資料格式不正確");
      }

      // 更新筆記本
      const updatedNotebook = notebookService.updateNotebook(
        currentNotebookId,
        {
          context: newContext,
        }
      );

      // 更新 state
      dispatch({
        type: "shared/UPDATE_NOTEBOOK",
        payload: updatedNotebook,
      });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUpdateWord = (wordId, updatedWord) => {
    try {
      // 找到當前 word 的索引
      const currentContext = currentNotebook.context;
      const wordIndex = currentContext.findIndex((w) => w.id === wordId);
      if (wordIndex === -1) throw new Error("找不到要更新的單字");

      // 準備新的 context
      const newContext = [...currentContext];
      newContext[wordIndex] = { ...updatedWord, id: wordId }; // 確保保留原始 id

      // 更新筆記本
      const updatedNotebook = notebookService.updateNotebook(
        currentNotebookId,
        {
          context: newContext,
        }
      );

      // 更新 state
      dispatch({
        type: "shared/UPDATE_NOTEBOOK",
        payload: updatedNotebook,
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
              onUpdateWord={handleUpdateWord}
              onImport={handleImport}
            />
          )}
        </WordList>
      </ContentArea>
    </PageContainer>
  );
}

export default WordManagementPage;
