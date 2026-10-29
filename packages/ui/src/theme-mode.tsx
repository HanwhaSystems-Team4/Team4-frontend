// 다크 모드(결정 0005): 상단의 버튼으로 밝게 · 어둡게를 고르고, 이 기기에 기억한다. 모양은 styles/dark.css가 <html data-theme="dark">에 덧씌운다.
// 화면 구성 · 순서는 바뀌지 않는다. A/B 후보(data-variant) 위에도 그대로 걸린다.

import { useState } from "react";
import { Icon } from "./icons";

export type ThemeMode = "light" | "dark";

const KEY = "team4.theme";

function saved(): ThemeMode {
  const q = new URLSearchParams(window.location.search).get("theme"); // 발표 · 캡처용: ?theme=dark
  if (q === "dark" || q === "light") return q;
  try {
    return localStorage.getItem(KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function apply(mode: ThemeMode): void {
  if (mode === "dark") document.documentElement.dataset.theme = "dark";
  else delete document.documentElement.dataset.theme;
}

/** 앱 시작 때 한 번: 기억한 모드를 바로 적용해 밝은 화면이 깜빡이지 않게 한다. */
export function initThemeMode(): void {
  apply(saved());
}

/** 다크 모드 버튼. 정비자 앱 상단 바 · 파트장 앱 본문 머리에 둔다. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [mode, setMode] = useState<ThemeMode>(saved);
  const next: ThemeMode = mode === "dark" ? "light" : "dark";
  return (
    <span
      className={`theme-tg ${className}`.trim()}
      role="switch"
      aria-checked={mode === "dark"}
      aria-label="다크 모드"
      tabIndex={0}
      title={mode === "dark" ? "밝은 화면으로" : "어두운 화면으로"}
      onClick={() => {
        apply(next);
        setMode(next);
        try {
          localStorage.setItem(KEY, next);
        } catch {
          /* 기억하지 못해도 지금 화면은 바뀐다 */
        }
      }}
    >
      <Icon name={mode === "dark" ? "sun" : "moon"} />
      {mode === "dark" ? "라이트" : "다크"}
    </span>
  );
}
