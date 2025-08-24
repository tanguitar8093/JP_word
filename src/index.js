import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./components/App"; // Import App component
import HomePage from "./pages/home";
import Quiz from "./pages/quiz/components/Quiz";
import WordReadingPage from "./pages/wordReading";
import WordManagementPage from "./pages/wordManagement";
import SystemSettingsPage from "./pages/systemSettings";
import NotebookManagementPage from "./pages/notebookManagement";
import AudioRecorderPage from "./pages/AudioRecorder";
import AnkiTest from "./pages/AnkiTest";
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
          element: <Quiz />,
        },
        {
          path: "word-reading",
          element: <WordReadingPage />,
        },
        {
          path: "word-management",
          element: <WordManagementPage />,
        },
        {
          path: "notebook-management",
          element: <NotebookManagementPage />,
        },
        {
          path: "settings",
          element: <SystemSettingsPage />,
        },
        {
          path: "recorder",
          element: <AudioRecorderPage />,
        },
        {
          path: "test",
          element: <AnkiTest />,
        },
        {
          path: "reading",
          element: <Reading />,
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
