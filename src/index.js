import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, createHashRouter, RouterProvider } from "react-router-dom";

import App from "./components/App"; // Import App component
import HomePage from "./pages/home";
import Quiz from "./pages/quiz/components/Quiz";
import FillInQuiz from "./pages/quiz/components/FillInQuiz";

import SystemSettingsPage from "./pages/systemSettings";
import NotebookManagementPage from "./pages/notebookManagement";
import NavigationBlocker from "./components/NavigationBlocker";
import Reading from "./pages/Reading/components/Reading";
import AnkiDemo from "./pages/anki"; // 新增：Anki Demo
import DiagnosticsPage from "./pages/diagnostics"; // 新增：診斷頁

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

// 動態決定 basename：
// - Capacitor (capacitor:// 或 http://localhost 的情況) 使用 "/"
// - Web 且 PUBLIC_URL 存在且不是 "." 時使用 PUBLIC_URL
// - 其他情況預設 "/"
const isCapacitorLike = () => {
  const href = window.location.href;
  return (
    href.startsWith("capacitor://") ||
    href.startsWith("http://localhost") ||
    href.startsWith("https://localhost")
  );
};
const publicUrl = process.env.PUBLIC_URL;
const resolvedBasename = isCapacitorLike()
  ? "/"
  : publicUrl && publicUrl !== "."
  ? publicUrl
  : "/";

const routes = [
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "quiz",
        element: (
          <NavigationBlocker
            clearOnConfirm
            considerQuiz={false}
            considerReading={true}
            considerFillin={true}
            message="偵測到進行中的學習任務，將會刪除進度，是否繼續？"
          >
            <Quiz />
          </NavigationBlocker>
        ),
      },
      {
        path: "fillin",
        element: (
          <NavigationBlocker
            clearOnConfirm
            considerQuiz={true}
            considerReading={true}
            considerFillin={false}
            message="偵測到進行中的學習任務，將會刪除進度，是否繼續？"
          >
            <FillInQuiz />
          </NavigationBlocker>
        ),
      },
      {
        path: "anki",
        element: (
          <NavigationBlocker
            clearOnConfirm
            message="偵測到進行中的學習任務，將會刪除進度，是否繼續？"
          >
            <AnkiDemo />
          </NavigationBlocker>
        ),
      },
      {
        path: "notebook-management",
        element: (
          <NavigationBlocker
            clearOnConfirm
            message="偵測到進行中的學習任務，將會刪除進度，是否繼續？"
          >
            <NotebookManagementPage />
          </NavigationBlocker>
        ),
      },
      {
        path: "settings",
        element: (
          <NavigationBlocker
            clearOnConfirm
            message="偵測到進行中的學習任務，將會刪除進度，是否繼續？"
          >
            <SystemSettingsPage />
          </NavigationBlocker>
        ),
      },
      {
        path: "reading",
        element: (
          <NavigationBlocker
            clearOnConfirm
            considerQuiz={true}
            considerReading={false}
            considerFillin={true}
            message="偵測到進行中的學習任務，將會刪除進度，是否繼續？"
          >
            <Reading />
          </NavigationBlocker>
        ),
      },
      {
        path: "diagnostics",
        element: <DiagnosticsPage />,
      },
    ],
  },
];

const router = isCapacitorLike()
  ? createHashRouter(routes)
  : createBrowserRouter(routes, { basename: resolvedBasename });

import { AppProvider } from "./store/contexts/AppContext"; // Import AppProvider

root.render(
  <StrictMode>
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  </StrictMode>
);
