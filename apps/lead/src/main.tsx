import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@team4/ui/styles/theme.css";
import "./app.css";
import { App } from "./App";

// 파트장 앱. 화면 모양은 packages/ui/src/styles/theme.css(대시보드와 같은 디자인 언어).
const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
