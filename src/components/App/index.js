import { AppProvider } from "../../store/contexts/AppContext";
import Quiz from "../../pages/quiz/components/Quiz";
import GlobalStyles from "../../styles"; // Corrected import path
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "../../pages/home";
import WordReadingPage from "../../pages/wordReading";
import WordManagementPage from "../../pages/wordManagement";
import SystemSettingsPage from "../../pages/systemSettings";
import NotebookManagementPage from "../../pages/notebookManagement";

export default function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <GlobalStyles />
      <AppProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/word-reading" element={<WordReadingPage />} />
          <Route path="/word-management" element={<WordManagementPage />} />
          <Route path="/notebook-management" element={<NotebookManagementPage />} />
          <Route path="/settings" element={<SystemSettingsPage />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
