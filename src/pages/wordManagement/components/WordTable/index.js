import React from 'react';
import { Table, TableHeader, TableRow, TableCell } from './styles';

export default function WordTable({ words, onWordSelect }) {
  return (
    <Table>
      <thead>
        <TableHeader>
          <th>日文</th>
          <th>漢字</th>
          <th>中文</th>
          <th>狀態</th>
          <th>熟練度</th>
          <th>下次複習</th>
        </TableHeader>
      </thead>
      <tbody>
        {words.map(word => {
          const dueDate = new Date(word.due);
          const now = new Date();
          const isOverdue = dueDate < now;
          
          return (
            <TableRow 
              key={word.id} 
              onClick={() => onWordSelect(word)}
              isOverdue={isOverdue}
            >
              <TableCell>{word.jp_word}</TableCell>
              <TableCell>{word.kanji_jp_word}</TableCell>
              <TableCell>{word.ch_word}</TableCell>
              <TableCell>{word.status}</TableCell>
              <TableCell>{word.proficiency}</TableCell>
              <TableCell>
                {isOverdue ? '已到期' : dueDate.toLocaleDateString()}
              </TableCell>
            </TableRow>
          );
        })}
      </tbody>
    </Table>
  );
}
