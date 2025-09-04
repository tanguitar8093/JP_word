import React, { useState, useEffect, useMemo } from "react";
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
  // 搜尋：輸入框內容與實際套用的查詢分離（送出才套用）
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [includeExamples, setIncludeExamples] = useState(false); // 是否將例句納入搜尋
  const [wordSelection, setWordSelection] = useState([]);
  // 學習度列表：選單與列表狀態（不影響原本 UI）
  const [studiedMinDraft, setStudiedMinDraft] = useState(null); // number|null
  const [studiedMaxDraft, setStudiedMaxDraft] = useState(null); // number|null
  const [studiedRangeApplied, setStudiedRangeApplied] = useState(null); // {min,max}|null
  const [studiedSelection, setStudiedSelection] = useState([]);
  const [studiedSetValue, setStudiedSetValue] = useState(0); // for batch set
  // 錯誤列表（word_bug=true）選取
  const [bugSelection, setBugSelection] = useState([]);
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
    setWordSelection([]); // 切換筆記本時清除單字勾選
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

  const handleDeleteSelectedNotebooks = () => {
    if (mergeSelection.length === 0) return;
    if (
      !window.confirm(
        `確定刪除已勾選的 ${mergeSelection.length} 個筆記本？此操作無法復原！`
      )
    ) {
      return;
    }
    try {
      for (const id of mergeSelection) {
        notebookService.deleteNotebook(id);
      }
      setMergeSelection([]);
      // 若當前選中的筆記本被刪除，取消選擇
      const stillExists = notebooks.some((n) => n.id === currentNotebookId);
      refreshNotebooks(stillExists ? currentNotebookId : null);
      if (!stillExists) {
        setSelectedNotebook(null);
      }
    } catch (error) {
      alert(error.message);
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
        setWordSelection((prev) => prev.filter((id) => id !== wordId));
      } catch (error) {
        alert(error.message);
      }
    }
  };

  // ===== 學習度統計（提供下拉選單範圍） =====
  const studiedStats = useMemo(() => {
    const ctx = selectedNotebook?.context || [];
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for (const w of ctx) {
      const v = Number(w?.studied ?? 0);
      if (!Number.isFinite(v)) continue;
      if (v < min) min = v;
      if (v > max) max = v;
    }
    if (min === Number.POSITIVE_INFINITY) min = 0;
    if (max === Number.NEGATIVE_INFINITY) max = 0;
    return { min, max };
  }, [selectedNotebook]);

  const studiedMinOptions = useMemo(() => {
    const arr = [];
    for (let i = studiedStats.min; i <= studiedStats.max; i++) arr.push(i);
    return arr;
  }, [studiedStats.min, studiedStats.max]);

  const studiedMaxOptions = useMemo(() => {
    if (studiedMinDraft == null) return [];
    const arr = [];
    for (let i = studiedMinDraft; i <= studiedStats.max; i++) arr.push(i);
    return arr;
  }, [studiedMinDraft, studiedStats.max]);

  // 當 min 改變時，max 初始值為其可選清單的最小值（即與 min 相同）
  useEffect(() => {
    if (studiedMinDraft != null) {
      const opts = studiedMaxOptions;
      setStudiedMaxDraft(opts.length > 0 ? opts[0] : null);
    } else {
      setStudiedMaxDraft(null);
    }
  }, [studiedMinDraft, studiedMaxOptions]);

  // 套用學習度區間後的列表
  const studiedFilteredWords = useMemo(() => {
    if (!selectedNotebook || !studiedRangeApplied) return [];
    const { min, max } = studiedRangeApplied;
    return (selectedNotebook.context || []).filter((w) => {
      const v = Number(w?.studied ?? 0);
      return Number.isFinite(v) && v >= min && v <= max;
    });
  }, [selectedNotebook, studiedRangeApplied]);

  const studiedAllSelected =
    studiedFilteredWords.length > 0 &&
    studiedFilteredWords.every((w) => studiedSelection.includes(w.id));

  const toggleSelectAllStudied = () => {
    if (studiedAllSelected) {
      setStudiedSelection((prev) =>
        prev.filter((id) => !studiedFilteredWords.some((w) => w.id === id))
      );
    } else {
      const ids = studiedFilteredWords.map((w) => w.id);
      setStudiedSelection((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  const toggleSelectStudiedWord = (id) => {
    setStudiedSelection((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBulkResetStudied = () => {
    if (!selectedNotebook || studiedSelection.length === 0) return;
    if (
      !window.confirm(
        `確定將選取的 ${studiedSelection.length} 個單字學習度重置為 0？`
      )
    )
      return;
    try {
      for (const id of studiedSelection) {
        notebookService.updateWordInNotebook(selectedNotebook.id, id, {
          studied: 0,
        });
      }
      refreshNotebooks(selectedNotebook.id);
      setStudiedSelection([]);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleBulkApplyStudied = () => {
    if (!selectedNotebook || studiedSelection.length === 0) return;
    const v = Number(studiedSetValue);
    if (!Number.isFinite(v) || v < 0) {
      alert("請輸入有效的非負整數");
      return;
    }
    if (
      !window.confirm(
        `確定將選取的 ${studiedSelection.length} 個單字學習度設為 ${v}？`
      )
    )
      return;
    try {
      for (const id of studiedSelection) {
        notebookService.updateWordInNotebook(selectedNotebook.id, id, {
          studied: v,
        });
      }
      refreshNotebooks(selectedNotebook.id);
      setStudiedSelection([]);
    } catch (error) {
      alert(error.message);
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

  // ===== 錯誤列表（word_bug=true） =====
  const bugWords = useMemo(() => {
    if (!selectedNotebook) return [];
    return (selectedNotebook.context || []).filter((w) => w.word_bug === true);
  }, [selectedNotebook]);

  const bugAllSelected =
    bugWords.length > 0 && bugWords.every((w) => bugSelection.includes(w.id));

  const toggleSelectAllBugWords = () => {
    if (bugAllSelected) {
      setBugSelection((prev) =>
        prev.filter((id) => !bugWords.some((w) => w.id === id))
      );
    } else {
      const ids = bugWords.map((w) => w.id);
      setBugSelection((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  const toggleSelectBugWord = (id) => {
    setBugSelection((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBulkFixBugs = () => {
    if (!selectedNotebook || bugSelection.length === 0) return;
    if (!window.confirm(`確定將選取的 ${bugSelection.length} 筆標記為已修正？`))
      return;
    try {
      for (const id of bugSelection) {
        notebookService.updateWordInNotebook(selectedNotebook.id, id, {
          word_bug: false,
        });
      }
      refreshNotebooks(selectedNotebook.id);
      setBugSelection([]);
    } catch (error) {
      alert(error.message);
    }
  };

  // === 進階搜尋規則（最佳化） ===
  // - 規範化（NFKC + 小寫 + trim）
  // - 片假名轉平假名，與 jp_word 一致比對
  // - 多關鍵字 AND（以空白分隔）
  // - 單一漢字時只比對「漢字/中文」欄位，避免誤中假名
  // - 移除 JSON 全文比對，避免被隱藏欄位誤中
  const normalize = (s) =>
    (s ?? "").toString().normalize("NFKC").trim().toLowerCase();

  const kataToHira = (s) =>
    (s ?? "").replace(/[\u30A1-\u30F6]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0x60)
    );
  const normalizeJP = (s) => normalize(kataToHira(s));

  const isSingleCJKChar = (s) => {
    if (!s) return false;
    const arr = [...s];
    if (arr.length !== 1) return false;
    const cp = arr[0].codePointAt(0);
    return (
      (cp >= 0x4e00 && cp <= 0x9fff) || // CJK Unified Ideographs
      (cp >= 0x3400 && cp <= 0x4dbf) || // Extension A
      (cp >= 0xf900 && cp <= 0xfaff) // Compatibility Ideographs
    );
  };

  const tokenize = (q) => normalize(q).split(/\s+/).filter(Boolean);

  const matchesSearch = (word, q, opts = {}) => {
    const { includeExamples = false } = opts;
    const terms = tokenize(q);
    if (terms.length === 0) return true;

    // 預先規範化欄位
    const jpWord = normalizeJP(word.jp_word);
    const kanji = normalize(word.kanji_jp_word);
    const ch = normalize(word.ch_word);
    const type = normalize(word.type);
    const idStr = normalize(String(word.id));

    const exampleJP = includeExamples ? normalizeJP(word.jp_ex_statement) : "";
    const exampleCH = includeExamples ? normalize(word.ch_ex_statement) : "";

    return terms.every((t) => {
      if (isSingleCJKChar(t)) {
        // 單一漢字：限制在漢字/中文欄位
        return kanji.includes(t) || ch.includes(t);
      }
      const tGen = normalize(t);
      const tJP = normalizeJP(t);
      // 一般欄位（非假名）
      if (
        kanji.includes(tGen) ||
        ch.includes(tGen) ||
        type.includes(tGen) ||
        idStr.includes(tGen)
      ) {
        return true;
      }
      // 假名欄位
      if (jpWord.includes(tJP)) return true;
      // 例句（選擇性）
      if (includeExamples) {
        if (exampleCH.includes(tGen) || exampleJP.includes(tJP)) return true;
      }
      return false;
    });
  };

  const filteredByProficiency = useMemo(() => {
    return (
      selectedNotebook?.context.filter((word) => {
        if (proficiencyFilter === 0) return true;
        return word.proficiency === proficiencyFilter;
      }) || []
    );
  }, [selectedNotebook, proficiencyFilter]);

  const displayedWords = useMemo(() => {
    const q = searchQuery.trim();
    return filteredByProficiency.filter((w) =>
      matchesSearch(w, q, { includeExamples })
    );
  }, [filteredByProficiency, searchQuery, includeExamples]);

  const allDisplayedSelected =
    displayedWords.length > 0 &&
    displayedWords.every((w) => wordSelection.includes(w.id));

  const toggleSelectAllDisplayed = () => {
    if (allDisplayedSelected) {
      // 取消勾選本頁顯示
      setWordSelection((prev) =>
        prev.filter((id) => !displayedWords.some((w) => w.id === id))
      );
    } else {
      // 勾選本頁顯示
      const ids = displayedWords.map((w) => w.id);
      setWordSelection((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  const toggleSelectWord = (id) => {
    setWordSelection((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBulkDeleteWords = () => {
    if (!selectedNotebook || wordSelection.length === 0) return;
    if (
      !window.confirm(
        `確定刪除已勾選的 ${wordSelection.length} 個單字？此操作無法復原！`
      )
    ) {
      return;
    }
    try {
      notebookService.deleteWordsFromNotebook(
        selectedNotebook.id,
        wordSelection
      );
      refreshNotebooks(selectedNotebook.id);
      setWordSelection([]);
    } catch (error) {
      alert(error.message);
    }
  };

  // 送出搜尋（Enter / 按鈕）
  const handleApplySearch = (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    setSearchQuery(searchInput);
  };

  // 清除搜尋（輸入與套用查詢都清空）
  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
  };

  return (
    <Container>
      <Header>
        <h1>筆記本</h1>
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
              <WordTableWrapper>
                <WordTable>
                  <thead>
                    <tr>
                      <th style={{ width: 15 }}>選取</th>
                      <th style={{ width: 60 }}>名稱</th>
                      <th style={{ width: 30 }}>單字數</th>
                      <th style={{ textAlign: "right", width: 30 }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notebooks.map((notebook) => {
                      const selected = currentNotebookId === notebook.id;
                      const wordsCount = Array.isArray(notebook.context)
                        ? notebook.context.length
                        : 0;
                      return (
                        <tr
                          key={notebook.id}
                          style={{
                            background: selected ? "#e8f5e9" : "transparent",
                            cursor: "pointer",
                          }}
                          onClick={() => handleSelectNotebook(notebook)}
                        >
                          <td>
                            <input
                              type="checkbox"
                              checked={mergeSelection.includes(notebook.id)}
                              onChange={() =>
                                handleMergeSelectionChange(notebook.id)
                              }
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          <td>
                            <span style={{ color: "#2e7d32" }}>
                              {notebook.name}
                            </span>
                          </td>
                          <td>{wordsCount}</td>
                          <td style={{ textAlign: "right" }}>
                            <Button onClick={() => handleExport(notebook.id)}>
                              匯出
                            </Button>
                            <Button
                              danger
                              onClick={() => handleDeleteNotebook(notebook.id)}
                            >
                              刪除
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </WordTable>
              </WordTableWrapper>
            )}
            {mergeSelection.length > 1 && (
              <Button
                onClick={handleMergeNotebooks}
                style={{ marginTop: "10px" }}
              >
                合併選取項目 ({mergeSelection.length})
              </Button>
            )}
            {mergeSelection.length > 0 && (
              <Button
                danger
                onClick={handleDeleteSelectedNotebooks}
                style={{ marginTop: "10px" }}
              >
                刪除選取項目 ({mergeSelection.length})
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
                <h3 style={{ marginTop: "16px" }}>
                  單字列表({displayedWords.length}/
                  {selectedNotebook?.context?.length || 0})：
                </h3>
                <FilterButtons>
                  <Button
                    secondary={proficiencyFilter !== 0}
                    onClick={() => setProficiencyFilter(0)}
                    style={{ width: "24%" }}
                  >
                    全部
                  </Button>
                  <Button
                    secondary={proficiencyFilter !== 1}
                    onClick={() => setProficiencyFilter(1)}
                    style={{ width: "24%" }}
                  >
                    不熟
                  </Button>
                  <Button
                    secondary={proficiencyFilter !== 2}
                    onClick={() => setProficiencyFilter(2)}
                    style={{ width: "24%" }}
                  >
                    尚可
                  </Button>
                  <Button
                    secondary={proficiencyFilter !== 3}
                    onClick={() => setProficiencyFilter(3)}
                    style={{ width: "24%" }}
                  >
                    熟悉
                  </Button>
                </FilterButtons>

                {/* 搜尋與批次操作列（送出觸發）*/}
                <form
                  onSubmit={handleApplySearch}
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    margin: "8px 0 12px",
                    flexWrap: "wrap",
                  }}
                >
                  <Input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="搜尋單字（可輸入日文/中文/詞性/ID）"
                    style={{ minWidth: 220 }}
                  />
                  <Button onClick={handleApplySearch}>搜尋</Button>
                  <label
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <input
                      type="checkbox"
                      checked={includeExamples}
                      onChange={(e) => setIncludeExamples(e.target.checked)}
                    />
                    包含例句
                  </label>
                  {(searchInput || searchQuery) && (
                    <Button secondary onClick={handleClearSearch}>
                      清除搜尋
                    </Button>
                  )}
                  {wordSelection.length > 0 && (
                    <Button danger onClick={handleBulkDeleteWords}>
                      刪除選取項目 ({wordSelection.length})
                    </Button>
                  )}
                </form>

                {/* 固定高度可滾動表格：新增選取欄與全選 */}
                {displayedWords && displayedWords.length > 0 ? (
                  <WordTableWrapper>
                    <WordTable>
                      <thead>
                        <tr>
                          <th style={{ width: 40 }}>
                            <input
                              type="checkbox"
                              checked={allDisplayedSelected}
                              onChange={toggleSelectAllDisplayed}
                            />
                          </th>
                          <th style={{ width: "35%" }}>日文</th>
                          <th style={{ width: "25%" }}>中文</th>
                          <th style={{ width: "20%", textAlign: "left" }}>
                            熟練度
                          </th>
                          <th style={{ textAlign: "right", width: "20%" }}>
                            操作
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedWords.map((word) => (
                          <tr key={word.id}>
                            <td>
                              <input
                                type="checkbox"
                                checked={wordSelection.includes(word.id)}
                                onChange={() => toggleSelectWord(word.id)}
                              />
                            </td>
                            <td>
                              <strong>
                                {word.kanji_jp_word || word.jp_word}
                              </strong>
                              {word.kanji_jp_word && (
                                <>
                                  <div style={{ color: "#777", fontSize: 12 }}>
                                    {word.jp_word}
                                  </div>
                                  <div style={{ color: "#777", fontSize: 12 }}>
                                    {word.type}
                                  </div>
                                </>
                              )}
                            </td>
                            <td>{word.ch_word}</td>
                            <td>
                              <ProficiencyBadge level={word.proficiency}>
                                {word.proficiency === 1
                                  ? "低"
                                  : word.proficiency === 2
                                  ? "中"
                                  : "高"}
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

                {/* ===== 新增：學習度列表（studied） ===== */}
                <div style={{ marginTop: 24 }}>
                  <h3>
                    學習度列表
                    {studiedRangeApplied
                      ? `（${studiedRangeApplied.min} ~ ${studiedRangeApplied.max}）(${studiedFilteredWords.length})`
                      : "（未選擇）"}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                      marginBottom: 8,
                    }}
                  >
                    <label>min</label>
                    <select
                      value={studiedMinDraft ?? ""}
                      onChange={(e) =>
                        setStudiedMinDraft(
                          e.target.value === "" ? null : Number(e.target.value)
                        )
                      }
                    >
                      <option value="">選擇</option>
                      {studiedMinOptions.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                    <span>~</span>
                    <label>max</label>
                    <select
                      value={studiedMaxDraft ?? ""}
                      onChange={(e) =>
                        setStudiedMaxDraft(
                          e.target.value === "" ? null : Number(e.target.value)
                        )
                      }
                      disabled={studiedMinDraft == null}
                    >
                      {studiedMinDraft == null ? (
                        <option value="">先選 min</option>
                      ) : (
                        studiedMaxOptions.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))
                      )}
                    </select>
                    <Button
                      onClick={() => {
                        if (studiedMinDraft == null || studiedMaxDraft == null)
                          return;
                        if (studiedMaxDraft < studiedMinDraft) return;
                        setStudiedRangeApplied({
                          min: studiedMinDraft,
                          max: studiedMaxDraft,
                        });
                        setStudiedSelection([]);
                      }}
                    >
                      確定
                    </Button>
                  </div>

                  {studiedRangeApplied && studiedFilteredWords.length > 0 ? (
                    <>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          flexWrap: "wrap",
                          margin: "8px 0",
                        }}
                      >
                        <Button danger onClick={handleBulkResetStudied}>
                          批次重置（→0）
                        </Button>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <span>批次設為</span>
                          <input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            step={1}
                            value={studiedSetValue}
                            onChange={(e) => setStudiedSetValue(e.target.value)}
                            style={{ width: 90, padding: 6 }}
                          />
                          <Button onClick={handleBulkApplyStudied}>套用</Button>
                        </div>
                        {studiedSelection.length > 0 && (
                          <span style={{ color: "#666", fontSize: 12 }}>
                            已選取 {studiedSelection.length} 筆
                          </span>
                        )}
                      </div>
                      <WordTableWrapper>
                        <WordTable>
                          <thead>
                            <tr>
                              <th style={{ width: 40 }}>
                                <input
                                  type="checkbox"
                                  checked={studiedAllSelected}
                                  onChange={toggleSelectAllStudied}
                                />
                              </th>
                              <th style={{ width: "35%" }}>日文</th>
                              <th style={{ width: "25%" }}>中文</th>
                              <th style={{ width: "20%", textAlign: "left" }}>
                                學習度 (studied)
                              </th>
                              <th style={{ textAlign: "right", width: "20%" }}>
                                操作
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {studiedFilteredWords.map((word) => (
                              <tr key={word.id}>
                                <td>
                                  <input
                                    type="checkbox"
                                    checked={studiedSelection.includes(word.id)}
                                    onChange={() =>
                                      toggleSelectStudiedWord(word.id)
                                    }
                                  />
                                </td>
                                <td>
                                  <strong>
                                    {word.kanji_jp_word || word.jp_word}
                                  </strong>
                                  {word.kanji_jp_word && (
                                    <div
                                      style={{ color: "#777", fontSize: 12 }}
                                    >
                                      {word.jp_word}
                                    </div>
                                  )}
                                  <div style={{ color: "#777", fontSize: 12 }}>
                                    {word.type}
                                  </div>
                                </td>
                                <td>{word.ch_word}</td>
                                <td>
                                  <span style={{ fontWeight: 600 }}>
                                    {Number(word?.studied ?? 0)}
                                  </span>
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
                    </>
                  ) : studiedRangeApplied ? (
                    <p>此學習度區間沒有單字</p>
                  ) : null}
                </div>

                {/* ===== 新增：錯誤列表（word_bug=true） ===== */}
                <div style={{ marginTop: 24 }}>
                  <h3>
                    錯誤列表（word_bug=true）{bugWords.length > 0 ? `（${bugWords.length}）` : ""}
                  </h3>
                  {bugWords.length > 0 ? (
                    <>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          flexWrap: "wrap",
                          margin: "8px 0",
                        }}
                      >
                        {bugSelection.length > 0 && (
                          <Button onClick={handleBulkFixBugs}>已修正（{bugSelection.length}）</Button>
                        )}
                      </div>
                      <WordTableWrapper>
                        <WordTable>
                          <thead>
                            <tr>
                              <th style={{ width: 40 }}>
                                <input
                                  type="checkbox"
                                  checked={bugAllSelected}
                                  onChange={toggleSelectAllBugWords}
                                />
                              </th>
                              <th style={{ width: "35%" }}>日文</th>
                              <th style={{ width: "25%" }}>中文</th>
                              <th style={{ width: "20%", textAlign: "left" }}>
                                熟練度
                              </th>
                              <th style={{ textAlign: "right", width: "20%" }}>
                                操作
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {bugWords.map((word) => (
                              <tr key={word.id}>
                                <td>
                                  <input
                                    type="checkbox"
                                    checked={bugSelection.includes(word.id)}
                                    onChange={() => toggleSelectBugWord(word.id)}
                                  />
                                </td>
                                <td>
                                  <strong>{word.kanji_jp_word || word.jp_word}</strong>
                                  {word.kanji_jp_word && (
                                    <>
                                      <div style={{ color: "#777", fontSize: 12 }}>
                                        {word.jp_word}
                                      </div>
                                      <div style={{ color: "#777", fontSize: 12 }}>
                                        {word.type}
                                      </div>
                                    </>
                                  )}
                                </td>
                                <td>{word.ch_word}</td>
                                <td>
                                  <ProficiencyBadge level={word.proficiency}>
                                    {word.proficiency === 1
                                      ? "低"
                                      : word.proficiency === 2
                                      ? "中"
                                      : "高"}
                                  </ProficiencyBadge>
                                </td>
                                <td style={{ textAlign: "right" }}>
                                  <Button onClick={() => handleEditWord(word)}>編輯</Button>
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
                    </>
                  ) : (
                    <p>目前沒有標記為錯誤的單字</p>
                  )}
                </div>

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
