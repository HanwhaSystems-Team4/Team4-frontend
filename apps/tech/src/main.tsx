import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initThemeMode, initVariant, VariantSwitcher } from "@team4/ui";
import "@team4/ui/styles/guide-a.css";
import "@team4/ui/styles/direction-guide.css";
import "@team4/ui/styles/past-adjust.css"; // 표시 조정 ③(CO-38)
import "@team4/ui/styles/theme.css"; // 색 · 테두리 · 글꼴(배치는 위 파일 그대로)
import "@team4/ui/styles/variants.css"; // A/B 후보(<html data-variant> 있을 때만 적용, 결정 0004)
import "@team4/ui/styles/dark.css"; // 다크 모드(<html data-theme="dark">, 결정 0005)
import "./app.css";
import { App } from "./App";

// 정비자 앱(1080 × 740 태블릿 기준). 승인 화면 · 토큰은 Prototype v17(packages/ui/src/styles = 승인 CSS 원본).
initThemeMode();
const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

// A/B 테스트 모드(VITE_AB_TEST=1)에서만 후보 전환 막대를 붙인다.
if (import.meta.env.VITE_AB_TEST === "1") {
  initVariant();
  const bar = document.body.appendChild(document.createElement("div"));
  createRoot(bar).render(<VariantSwitcher />);
}
