import { AppProvider } from "../../store/contexts/AppContext";
import Quiz from "../../features/quiz/components/Quiz";
import GlobalStyles from "../../common/GlobalStyles"; // Corrected import path
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "../../features/home";
import WordReadingPage from "../../features/wordReading";
import WordManagementPage from "../../features/wordManagement";
import SystemSettingsPage from "../../features/systemSettings";

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
          <Route path="/settings" element={<SystemSettingsPage />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
