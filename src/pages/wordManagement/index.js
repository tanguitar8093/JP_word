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
} from "./styles";
import {
  setCurrentWord,
  updateWordStatus,
  setWordFilter,
  updateWordProficiency,
} from "./reducer/actions";
import { commitPendingProficiencyUpdates } from "../../store/reducer/actions";

function WordManagementPage() {
  const { state, dispatch } = useApp();
  const { systemSettings, wordManagement = {} } = state;
  const navigate = useNavigate();

  // 取得當前筆記本 context
  const currentNotebookId = state.shared.currentNotebookId;
  const notebooks = state.shared.notebooks || [];
  const currentNotebook = useMemo(
    () => notebooks.find((n) => n.id === currentNotebookId),
    [notebooks, currentNotebookId]
  );

  // 設定相關
  const [showSetting, setShowSetting] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const [proficiencyFilter, setProficiencyFilter] = useState(0);

  // 根據篩選條件取得單字列表
  const words = useMemo(() => {
    const allWords = currentNotebook?.context || [];
    return allWords.filter((word) => {
      if (proficiencyFilter === 0) return true;
      return word.proficiency === proficiencyFilter;
    });
  }, [currentNotebook, proficiencyFilter]);

  // 當前學習的單字
  const [currentWord, setCurrentWordState] = useState(null);

  useEffect(() => {
    if (studyMode && words.length > 0 && !currentWord) {
      // 找出最需要複習的單字（到期或即將到期）
      const now = Date.now();
      const sortedWords = [...words].sort((a, b) => {
        const aDue = a.due || now;
        const bDue = b.due || now;
        return aDue - bDue;
      });
      setCurrentWordState(sortedWords[0]);
    }
  }, [studyMode, words, currentWord]);

  // 處理評分
  const handleRate = (rating) => {
    if (!currentWord) return;

    // 更新單字狀態
    dispatch(updateWordProficiency(currentWord.id, rating));

    // 更新到筆記本
    dispatch(
      commitPendingProficiencyUpdates([
        {
          notebookId: currentNotebookId,
          wordId: currentWord.id,
          changes: currentWord,
        },
      ])
    );

    // 找下一個單字
    const currentIndex = words.findIndex((w) => w.id === currentWord.id);
    const nextWord = words[currentIndex + 1];
    setCurrentWordState(nextWord || null);

    if (!nextWord) {
      setStudyMode(false);
    }
  };

  return (
    <PageContainer>
      <Header>
        <Button onClick={() => navigate(-1)}>返回</Button>
        <Title>單字管理</Title>
        <ButtonGroup>
          <Button onClick={() => setStudyMode(!studyMode)}>
            {studyMode ? "返回列表" : "開始學習"}
          </Button>
          <Button onClick={() => setShowSetting(true)}>設定</Button>
          <Button
            onClick={() =>
              alert(
                "單字管理頁面：可以查看、管理單字卡片，以及使用間隔重複系統學習。"
              )
            }
          >
            Info
          </Button>
        </ButtonGroup>
      </Header>

      <NotebookInfo>
        <b>當前筆記本：</b>
        {currentNotebook?.name || "未選擇"}
      </NotebookInfo>

      {!studyMode ? (
        <>
          <FilterGroup>
            <FilterButton
              active={proficiencyFilter === 0}
              onClick={() => setProficiencyFilter(0)}
            >
              全部
            </FilterButton>
            <FilterButton
              active={proficiencyFilter === 1}
              onClick={() => setProficiencyFilter(1)}
            >
              初學
            </FilterButton>
            <FilterButton
              active={proficiencyFilter === 2}
              onClick={() => setProficiencyFilter(2)}
            >
              學習中
            </FilterButton>
            <FilterButton
              active={proficiencyFilter === 3}
              onClick={() => setProficiencyFilter(3)}
            >
              熟練
            </FilterButton>
          </FilterGroup>

          {words.length === 0 ? (
            <div>此筆記本沒有單字。</div>
          ) : (
            <WordTable
              words={words}
              onWordSelect={(word) => {
                setCurrentWordState(word);
                setStudyMode(true);
              }}
            />
          )}
        </>
      ) : currentWord ? (
        <WordCard word={currentWord} onRating={handleRate} />
      ) : (
        <div>
          太棒了！你已經完成了所有單字的複習。
          <Button onClick={() => setStudyMode(false)}>返回列表</Button>
        </div>
      )}

      {showSetting && (
        <SettingsPanel
          {...systemSettings}
          onClose={() => setShowSetting(false)}
        />
      )}
    </PageContainer>
  );
}

export default WordManagementPage;
