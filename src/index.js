import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./components/App"; // Import App component
import HomePage from "./pages/home";
import Quiz from "./pages/quiz/components/Quiz";

import SystemSettingsPage from "./pages/systemSettings";
import NotebookManagementPage from "./pages/notebookManagement";
import AudioRecorderPage from "./pages/AudioRecorder";
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
