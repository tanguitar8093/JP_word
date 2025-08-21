import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./components/layout/App"; // Import App component

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App /> {/* Render App component for normal routing */}
  </StrictMode>
);
