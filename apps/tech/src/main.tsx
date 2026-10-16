import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@team4/ui/styles/guide-a.css";
import "@team4/ui/styles/direction-guide.css";
import "@team4/ui/styles/past-adjust.css"; // 표시 조정 ③(CO-38)
import "./app.css";
import { App } from "./App";

// 정비자 앱(1080 × 740 태블릿 기준). 승인 화면 · 토큰은 Prototype v17(packages/ui/src/styles = 승인 CSS 원본).
const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
