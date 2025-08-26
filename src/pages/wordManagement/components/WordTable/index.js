import React from "react";
import { TableContainer, Table, TableHeader, TableRow, TableCell } from "./styles";

export default function WordTable({ words, onWordSelect, onDeleteWord }) {
  const isDevEnv = process.env.NODE_ENV === 'development';
  
  return (
    <TableContainer>
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
                <TableCell style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {JSON.stringify(word)}
                </TableCell>
              )}
              <TableCell>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('確定要刪除這個單字嗎？')) {
                      onDeleteWord(word.id);
                    }
                  }}
                  style={{
                    padding: '4px 8px',
                    background: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  刪除
                </button>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );
}
