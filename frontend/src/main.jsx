import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";

import Analyzer from "./pages/Analyzer";
import Insights from "./pages/Insights";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Analyzer />} />

        <Route path="/insights" element={<Insights />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
