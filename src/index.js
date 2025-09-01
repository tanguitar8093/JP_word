import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  createHashRouter,
  RouterProvider,
} from "react-router-dom";

import App from "./components/App"; // Import App component
import HomePage from "./pages/home";
import Quiz from "./pages/quiz/components/Quiz";
import FillInQuiz from "./pages/quiz/components/FillInQuiz";
import { AppProvider } from "./store/contexts/AppContext"; // Import AppProvider
import SystemSettingsPage from "./pages/systemSettings";
import NotebookManagementPage from "./pages/notebookManagement";
import NavigationBlocker from "./components/NavigationBlocker";
import Reading from "./pages/Reading/components/Reading";
import WordTest from "./pages/wordTest";
import DiagnosticsPage from "./pages/diagnostics"; // 新增：診斷頁

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

// Router 策略：
// - Android (Capacitor) 用 HashRouter（避免原生 WebView 路由問題）
// - GitHub Pages 用 HashRouter（靜態主機無法處理子路徑直連）
// - 其他一般 Web 用 BrowserRouter + basename
const isCapacitorLike = () => {
  const href = window.location.href;
  return (
    href.startsWith("capacitor://") ||
    href.startsWith("http://localhost") ||
    href.startsWith("https://localhost")
  );
};
const isGhPages = () => /\.github\.io$/.test(window.location.hostname);
const publicUrl = process.env.PUBLIC_URL;
const resolvedBasename = publicUrl && publicUrl !== "." ? publicUrl : "/";

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
        path: "word_test",
        element: (
          <NavigationBlocker
            clearOnConfirm
            message="偵測到進行中的學習任務，將會刪除進度，是否繼續？"
          >
            <WordTest />
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

const useHash = isCapacitorLike() || isGhPages();
const router = useHash
  ? createHashRouter(routes)
  : createBrowserRouter(routes, { basename: resolvedBasename });

root.render(
  <StrictMode>
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  </StrictMode>
);
