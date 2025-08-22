import { AppProvider } from "../../store/contexts/AppContext";
import GlobalStyles from "../../styles"; // Corrected import path
import { Outlet } from "react-router-dom";

export default function App() {
  return (
    <>
      <GlobalStyles />
      <AppProvider>
        <Outlet />
      </AppProvider>
    </>
  );
}
