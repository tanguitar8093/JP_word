import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./components/App"; // Import App component
import HomePage from "./pages/home";
import Quiz from "./pages/quiz/components/Quiz";
import FillInQuiz from "./pages/quiz/components/FillInQuiz";

import SystemSettingsPage from "./pages/systemSettings";
import NotebookManagementPage from "./pages/notebookManagement";
import NavigationBlocker from "./components/NavigationBlocker";
import Reading from "./pages/Reading/components/Reading";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

const router = createBrowserRouter(
  [
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
              message="偵測到尚有未完成的閱讀進度，前往『測驗』將會丟棄閱讀進度，是否繼續？"
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
              considerQuiz={false}
              considerReading={true}
              message="偵測到尚有未完成的閱讀進度，前往『拼字』將會丟棄閱讀進度，是否繼續？"
            >
              <FillInQuiz />
            </NavigationBlocker>
          ),
        },
        {
          path: "notebook-management",
          element: (
            <NavigationBlocker
              clearOnConfirm
              message="偵測到尚有未完成的學習進度（測驗/閱讀），前往『筆記本』將會丟棄進度，是否繼續？"
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
              message="偵測到尚有未完成的學習進度（測驗/閱讀），前往『設定』將會丟棄進度，是否繼續？"
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
              message="偵測到尚有未完成的測驗進度，前往『閱讀』將會丟棄測驗進度，是否繼續？"
            >
              <Reading />
            </NavigationBlocker>
          ),
        },
      ],
    },
  ],
  {
    basename: process.env.PUBLIC_URL,
  }
);

import { AppProvider } from "./store/contexts/AppContext"; // Import AppProvider

root.render(
  <StrictMode>
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  </StrictMode>
);
