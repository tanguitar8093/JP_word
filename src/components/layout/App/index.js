import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Quiz from "../../../features/quiz/components/Quiz";
import ExamplePage from "../../../features/example/components/ExamplePage";

export default function App() {
  return (
    /* basename={process.env.PUBLIC_URL} */
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Quiz />} />
        <Route path="/example" element={<ExamplePage />} />
        {/* 未來可以在此處新增更多路由 */}
        {/* <Route path="/new-page" element={<NewPageComponent />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
