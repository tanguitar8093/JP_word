import React from "react";
import {
  TableContainer,
  Table,
  TableHeader,
  TableRow,
  TableCell,
  NoDataMessage,
  ActionsCell,
  ActionButton,
} from "./styles";

const NotebookTable = ({
  notebooks,
  onEditNotebook,
  onDeleteNotebook,
  onSelectNotebook,
  currentNotebookId,
}) => {
  return (
    <TableContainer>
      <Table>
        <thead>
          <TableHeader>
            <th>名稱</th>
            <th>建立時間</th>
            <th>單字數量</th>
            <th>操作</th>
          </TableHeader>
        </thead>
        <tbody>
          {notebooks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4}>
                <NoDataMessage>
                  還沒有筆記本。點擊上方的「新增筆記本」按鈕來創建一個！
                </NoDataMessage>
              </TableCell>
            </TableRow>
          ) : (
            notebooks.map((notebook) => (
              <TableRow
                key={notebook.id}
                isSelected={notebook.id === currentNotebookId}
                onClick={() => onSelectNotebook(notebook.id)}
              >
                <TableCell>{notebook.name}</TableCell>
                <TableCell>
                  {notebook.createdAt
                    ? new Date(notebook.createdAt).toLocaleString("zh-TW", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "---"}
                </TableCell>
                <TableCell>{notebook.context?.length || 0}</TableCell>
                <ActionsCell>
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditNotebook(notebook);
                    }}
                    variant="edit"
                  >
                    編輯
                  </ActionButton>
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNotebook(notebook.id);
                    }}
                    variant="delete"
                  >
                    刪除
                  </ActionButton>
                </ActionsCell>
              </TableRow>
            ))
          )}
        </tbody>
      </Table>
    </TableContainer>
  );
};

export default NotebookTable;
