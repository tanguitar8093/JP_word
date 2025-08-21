import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Quiz from "../Quiz";

export default function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path="/" element={<Quiz />} />
        {/* 未來可以在此處新增更多路由 */}
        {/* <Route path="/new-page" element={<NewPageComponent />} /> */}
      </Routes>
    </BrowserRouter>
  );
}