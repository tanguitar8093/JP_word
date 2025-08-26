import React, { useState } from "react";
import {
  TableContainer,
  TableWrapper,
  Table,
  TableHeader,
  TableRow,
  TableCell,
} from "./styles";

// JSON 編輯對話框組件
const JsonEditDialog = ({ word, onSave, onClose }) => {
  const [jsonContent, setJsonContent] = useState(JSON.stringify(word, null, 2));
  const [error, setError] = useState("");

  const handleSave = () => {
    try {
      const newContextData = JSON.parse(jsonContent);
      onSave(newContextData);
      onClose();
    } catch (error) {
      setError(`Error updating context: ${error.message}`);
    }
  };

  const handleClick = (e) => {
    // 防止點擊對話框外部時關閉
    e.stopPropagation();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          width: "80%",
          maxWidth: "600px",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={handleClick}
      >
        <h3 style={{ margin: "0 0 16px" }}>編輯 JSON</h3>
        <textarea
          value={jsonContent}
          onChange={(e) => setJsonContent(e.target.value)}
          rows={15}
          style={{
            width: "100%",
            marginBottom: "16px",
            fontFamily: "monospace",
            padding: "8px",
            background: "#f4f4f4",
            border: "1px solid #ccc",
          }}
        />
        {error && (
          <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
        )}
        <div>
          <button onClick={handleSave}>保存</button>
          <button onClick={onClose} style={{ marginLeft: "10px" }}>
            取消
          </button>
        </div>
      </div>
    </div>
  );
};

export default function WordTable({
  words,
  onDeleteWord,
  onUpdateWord,
  onImport,
}) {
  const isDevEnv = process.env.NODE_ENV === "development";
  const [editingWord, setEditingWord] = useState(null);
  const fileInputRef = React.useRef(null);

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      onImport(data);
    } catch (error) {
      alert("檔案格式錯誤: " + error.message);
    }
    // 清除 input 值，這樣同一個檔案可以重複匯入
    event.target.value = null;
  };

  return (
    <TableContainer>
      <div
        style={{
          padding: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #eee",
        }}
      >
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
          style={{ display: "none" }}
          ref={fileInputRef}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: "8px 16px",
            background: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          匯入 JSON
        </button>
      </div>

      <TableWrapper>
        <Table>
          <thead>
            <TableHeader>
              <th>日文</th>
              <th>漢字</th>
              <th>中文</th>
              {isDevEnv && <th>JSON</th>}
              <th>操作</th>
            </TableHeader>
          </thead>
          <tbody>
            {words.map((word) => (
              <TableRow key={word.id}>
                <TableCell>{word.jp_word}</TableCell>
                <TableCell>{word.kanji_jp_word}</TableCell>
                <TableCell>{word.ch_word}</TableCell>
                {isDevEnv && (
                  <TableCell>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <button
                        onClick={() => setEditingWord(word)}
                        style={{
                          padding: "4px 8px",
                          background: "#2ecc71",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        編輯
                      </button>
                    </div>
                  </TableCell>
                )}
                <TableCell>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm("確定要刪除這個單字嗎？")) {
                        onDeleteWord(word.id);
                      }
                    }}
                    style={{
                      padding: "4px 8px",
                      background: "#e74c3c",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    刪除
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableWrapper>

      {editingWord && (
        <JsonEditDialog
          word={editingWord}
          onSave={(updatedWord) => {
            onUpdateWord(editingWord.id, updatedWord);
            setEditingWord(null);
          }}
          onClose={() => setEditingWord(null)}
        />
      )}
    </TableContainer>
  );
}
