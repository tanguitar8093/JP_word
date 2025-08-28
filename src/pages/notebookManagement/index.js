import React, { useState, useEffect } from "react";
import notebookService from "../../services/notebookService";
import { useApp } from "../../store/contexts/AppContext";
import { getNotebooks, setCurrentNotebook } from "../../store/reducer/actions";
import {
  Container,
  Header,
  BackButton,
  Section,
  Input,
  Button,
  FlexContainer,
  SidePanel,
  MainPanel,
  NotebookList,
  NotebookItem,
  TextArea,
  FilterButtons,
  WordList,
  WordItem,
  ProficiencyBadge,
  // 新增表格樣式
  WordTableWrapper,
  WordTable,
} from "./styles";
import Modal from "../../components/Modal";
import { useNavigate } from "react-router-dom"; // Import useBlocker

const NotebookManagementPage = () => {
  const { state, dispatch } = useApp();
  const { notebooks, currentNotebookId } = state.shared;
  const [newNotebookName, setNewNotebookName] = useState("");
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingContext, setEditingContext] = useState("");
  const [proficiencyFilter, setProficiencyFilter] = useState(0); // 0 for all, 1 for low, 2 for medium, 3 for high
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditWordModalVisible, setIsEditWordModalVisible] = useState(false);
  const [editingWordJson, setEditingWordJson] = useState("");
  const [mergeSelection, setMergeSelection] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const currentNotebook = notebooks.find((n) => n.id === currentNotebookId);
    if (currentNotebook) {
      handleSelectNotebook(currentNotebook);
    }
  }, [currentNotebookId, notebooks]);

  const refreshNotebooks = (currentId) => {
    const allNotebooks = notebookService.getNotebooks();
    dispatch(getNotebooks(allNotebooks));
    if (currentId) {
      dispatch(setCurrentNotebook(currentId));
      notebookService.setCurrentNotebookId(currentId);
    }
  };

  const handleExit = () => navigate("/");

  const handleSelectNotebook = (notebook) => {
    setSelectedNotebook(notebook);
    setEditingName(notebook.name);
    setEditingContext(JSON.stringify(notebook.context, null, 2));
    dispatch(setCurrentNotebook(notebook.id));
    notebookService.setCurrentNotebookId(notebook.id);
  };

  const handleCreateNotebook = () => {
    try {
      const newNotebook = notebookService.createNotebook(newNotebookName);
      setNewNotebookName("");
      refreshNotebooks(newNotebook.id); // Select the new notebook
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteNotebook = (id) => {
    if (window.confirm("Are you sure you want to delete this notebook?")) {
      notebookService.deleteNotebook(id);
      refreshNotebooks(null); // Deselect
    }
  };

  const handleUpdateName = () => {
    try {
      notebookService.updateNotebook(selectedNotebook.id, {
        name: editingName,
      });
      refreshNotebooks(selectedNotebook.id);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUpdateContext = () => {
    try {
      const newContextData = JSON.parse(editingContext);
      const originalContext = selectedNotebook.context;
      const contextMap = new Map(
        originalContext.map((word) => [word.id, word])
      );

      const itemsToUpdate = Array.isArray(newContextData)
        ? newContextData
        : [newContextData];

      for (const item of itemsToUpdate) {
        if (item && typeof item === "object" && item.id) {
          contextMap.set(item.id, item);
        } else if (item && typeof item === "object" && !item.id) {
          // Optional: handle adding new words that don't have an ID yet
          // For now, we only update existing ones based on ID.
        }
      }

      const finalContext = Array.from(contextMap.values());
      notebookService.updateNotebook(selectedNotebook.id, {
        context: finalContext,
      });
      refreshNotebooks(selectedNotebook.id);
      // also update the textarea to reflect the formatted, saved data
      setEditingContext(JSON.stringify(finalContext, null, 2));
      alert("Context updated successfully!");
    } catch (error) {
      alert(`Error updating context: ${error.message}`);
    }
  };

  const handleEditWord = (word) => {
    setEditingWordJson(JSON.stringify(word, null, 2));
    setIsEditWordModalVisible(true);
  };

  const handleUpdateWord = () => {
    try {
      const updatedWord = JSON.parse(editingWordJson);
      if (!updatedWord || typeof updatedWord !== "object" || !updatedWord.id) {
        alert("Invalid JSON format or missing word ID.");
        return;
      }

      const originalContext = selectedNotebook.context;
      const contextMap = new Map(originalContext.map((w) => [w.id, w]));
      contextMap.set(updatedWord.id, updatedWord);

      const finalContext = Array.from(contextMap.values());
      notebookService.updateNotebook(selectedNotebook.id, {
        context: finalContext,
      });

      refreshNotebooks(selectedNotebook.id);
      setIsEditWordModalVisible(false);
      setEditingWordJson("");
      alert("Word updated successfully!");
    } catch (error) {
      alert(`Error updating word: ${error.message}`);
    }
  };

  const handleDeleteWord = (wordId) => {
    if (window.confirm("Are you sure you want to delete this word?")) {
      try {
        notebookService.deleteWordsFromNotebook(selectedNotebook.id, [wordId]);
        refreshNotebooks(selectedNotebook.id);
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleExport = (notebookId) => {
    const notebook = notebooks.find((n) => n.id === notebookId);
    if (!notebook) {
      alert("Notebook not found!");
      return;
    }

    const jsonString = JSON.stringify(notebook, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${notebook.name}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const newNotebook = await notebookService.importNotebook(file);
      refreshNotebooks(newNotebook.id);
      alert("Notebook imported successfully!");
    } catch (error) {
      alert(error.message);
    }
    event.target.value = null;
  };

  const handleMergeSelectionChange = (notebookId) => {
    setMergeSelection((prevSelection) => {
      if (prevSelection.includes(notebookId)) {
        return prevSelection.filter((id) => id !== notebookId);
      } else {
        return [...prevSelection, notebookId];
      }
    });
  };

  const handleMergeNotebooks = () => {
    if (mergeSelection.length < 2) {
      alert("Please select at least two notebooks to merge.");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to merge the selected notebooks? The non-primary notebooks will be deleted."
      )
    ) {
      return;
    }

    try {
      const [primaryNotebookId, ...sourceNotebookIds] = mergeSelection;
      notebookService.mergeNotebooks({ primaryNotebookId, sourceNotebookIds });

      // Refresh the notebooks list in the UI
      refreshNotebooks(primaryNotebookId); // Select the merged notebook

      // Clear the selection
      setMergeSelection([]);

      alert("Notebooks merged successfully!");
    } catch (error) {
      alert(`Merging notebooks: ${error.message}`);
    }
  };

  const handleImportWords = (event) => {
    if (!selectedNotebook) {
      alert("Please select a notebook first.");
      return;
    }
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        const wordsToImport = importedData.context || [];

        notebookService.importWordsIntoNotebook(
          selectedNotebook.id,
          wordsToImport
        );

        refreshNotebooks(selectedNotebook.id);
        alert("Words imported successfully!");
      } catch (error) {
        alert(`Error importing words: ${error.message}`);
      }
    };
    reader.readAsText(file);
    event.target.value = null; // Reset file input
  };

  const filteredContext =
    selectedNotebook?.context.filter((word) => {
      if (proficiencyFilter === 0) return true;
      return word.proficiency === proficiencyFilter;
    }) || [];

  return (
    <Container>
      <Header>
        <h1>筆記本管理</h1>
        <BackButton onClick={handleExit}>返回</BackButton>
      </Header>

      <FlexContainer>
        <SidePanel>
          <Section>
            <h2>建立筆記本</h2>
            <Input
              type="text"
              value={newNotebookName}
              onChange={(e) => setNewNotebookName(e.target.value)}
              placeholder="輸入筆記本名稱（最多20字）"
              maxLength="20"
              fullWidth
            />
            <Button onClick={handleCreateNotebook}>建立</Button>
          </Section>

          <Section>
            <h2>匯入筆記本</h2>
            <Input
              type="file"
              accept=".json"
              onChange={handleImport}
              fullWidth
            />
          </Section>

          <Section>
            <h2>筆記本列表</h2>
            {notebooks.length === 0 ? (
              <p>尚未建立筆記本</p>
            ) : (
              <NotebookList>
                {notebooks.map((notebook) => (
                  <NotebookItem
                    key={notebook.id}
                    selected={currentNotebookId === notebook.id}
                  >
                    <input
                      type="checkbox"
                      checked={mergeSelection.includes(notebook.id)}
                      onChange={() => handleMergeSelectionChange(notebook.id)}
                      onClick={(e) => e.stopPropagation()} // Prevent triggering handleSelectNotebook
                    />
                    <span onClick={() => handleSelectNotebook(notebook)}>
                      {notebook.name}
                    </span>
                    <Button onClick={() => handleExport(notebook.id)}>
                      匯出
                    </Button>
                    <Button
                      danger
                      onClick={() => handleDeleteNotebook(notebook.id)}
                    >
                      刪除
                    </Button>
                  </NotebookItem>
                ))}
              </NotebookList>
            )}
            {mergeSelection.length > 1 && (
              <Button
                onClick={handleMergeNotebooks}
                style={{ marginTop: "10px" }}
              >
                合併選取項目 ({mergeSelection.length})
              </Button>
            )}
          </Section>
        </SidePanel>

        <MainPanel>
          <Section>
            <h2>筆記本詳情</h2>
            {selectedNotebook ? (
              <>
                <div style={{ marginBottom: "20px" }}>
                  <Input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    maxLength="20"
                    placeholder="筆記本名稱"
                  />
                  <Button onClick={handleUpdateName}>更新名稱</Button>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <h4>匯入單字到此筆記本</h4>
                  <Input
                    type="file"
                    accept=".json"
                    onChange={handleImportWords}
                    fullWidth
                  />
                </div>

                <h3>筆記本資料（JSON）：</h3>
                <Modal
                  isVisible={modalVisible}
                  message={
                    <>
                      <TextArea
                        value={editingContext}
                        onChange={(e) => setEditingContext(e.target.value)}
                        placeholder="貼上完整陣列或單一物件（需包含 id）進行更新/合併"
                      />
                    </>
                  }
                  onConfirm={() => {
                    handleUpdateContext();
                    setModalVisible(false);
                  }}
                  onCancel={() => setModalVisible(false)}
                />
                <Button onClick={() => setModalVisible(true)}>編輯</Button>
                <h3 style={{ marginTop: "24px" }}>
                  單字列表({filteredContext.length})：
                </h3>
                <FilterButtons>
                  <Button
                    secondary={proficiencyFilter !== 0}
                    onClick={() => setProficiencyFilter(0)}
                  >
                    全部
                  </Button>
                  <Button
                    secondary={proficiencyFilter !== 1}
                    onClick={() => setProficiencyFilter(1)}
                  >
                    初級
                  </Button>
                  <Button
                    secondary={proficiencyFilter !== 2}
                    onClick={() => setProficiencyFilter(2)}
                  >
                    中級
                  </Button>
                  <Button
                    secondary={proficiencyFilter !== 3}
                    onClick={() => setProficiencyFilter(3)}
                  >
                    高級
                  </Button>
                </FilterButtons>

                {/* 以表格呈現固定高度可滾動列表 */}
                {filteredContext && filteredContext.length > 0 ? (
                  <WordTableWrapper>
                    <WordTable>
                      <thead>
                        <tr>
                          <th>日文</th>
                          <th>中文</th>
                          <th>熟練度</th>
                          <th style={{ textAlign: "right" }}>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredContext.map((word) => (
                          <tr key={word.id}>
                            <td>
                              <strong>
                                {word.kanji_jp_word || word.jp_word}
                              </strong>
                              {word.kanji_jp_word && (
                                <div style={{ color: "#777", fontSize: 12 }}>
                                  假名：{word.jp_word}
                                </div>
                              )}
                            </td>
                            <td>{word.ch_word}</td>
                            <td>
                              <ProficiencyBadge level={word.proficiency}>
                                {word.proficiency === 1
                                  ? "初級"
                                  : word.proficiency === 2
                                  ? "中級"
                                  : "高級"}
                              </ProficiencyBadge>
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <Button onClick={() => handleEditWord(word)}>
                                編輯
                              </Button>
                              <Button
                                danger
                                onClick={() => handleDeleteWord(word.id)}
                              >
                                刪除
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </WordTable>
                  </WordTableWrapper>
                ) : (
                  <p>目前沒有符合條件的單字</p>
                )}

                <Modal
                  isVisible={isEditWordModalVisible}
                  message={
                    <>
                      <h3>編輯單字</h3>
                      <TextArea
                        value={editingWordJson}
                        onChange={(e) => setEditingWordJson(e.target.value)}
                        rows={15}
                      />
                    </>
                  }
                  onConfirm={handleUpdateWord}
                  onCancel={() => setIsEditWordModalVisible(false)}
                />
              </>
            ) : (
              <p>請選擇一個筆記本查看詳情</p>
            )}
          </Section>
        </MainPanel>
      </FlexContainer>
    </Container>
  );
};

export default NotebookManagementPage;
