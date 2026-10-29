// A/B 테스트용 디자인 후보 전환(결정 0004). 후보는 styles/variants/*.css가 <html data-variant>에 걸려 덧씌운다.
// 화면 구성 · 버튼 · 이동 순서(DOM)는 그대로이고 겉모양과 배치만 바뀐다. 평소 개발 · 빌드(VITE_AB_TEST 없음)에서는 쓰지 않는다.

import { useState } from "react";
import { initThemeMode } from "./theme-mode";

export type VariantId = "a" | "b" | "c" | "d";

export const VARIANTS: { id: VariantId; name: string; ref: string }[] = [
  { id: "a", name: "현재 버전", ref: "지금 화면" },
  { id: "b", name: "플로팅 벤토형", ref: "Apple 벤토 그리드 · Dynamic Island · Arc" },
  { id: "c", name: "산업 관제형", ref: "ISA-101 HMI · SCADA/MES · IBM Plex" },
  { id: "d", name: "페이지 수정", ref: "C 계승 + 진단 3열(시안 03) · 점검·조치 통합" },
];

const KEY = "team4.variant";

/** 글꼴 후보(결정 0006). styles/variants/fonts.css가 <html data-font>에 걸려 --f만 바꾼다. css는 Google Fonts에서 고를 때 불러온다. */
export type FontId =
  | "pretendard"
  | "nanum-square-neo"
  | "nanum-gothic"
  | "maru-buri"
  | "kakao-small"
  | "kakao-big"
  | "ibm-plex-kr"
  | "google-sans"
  | "google-sans-flex"
  | "roboto"
  | "inter"
  | "red-hat"
  | "ubuntu"
  | "segoe-variable"
  | "selawik"
  | "amazon-ember"
  | "sf-pro"
  | "sf-compact"
  | "new-york"
  | "sf-mono"
  | "ibm-plex"
  | "jetbrains-mono"
  | "google-sans-code"
  | "system";

export const FONTS: { id: FontId; name: string; brand: string; css?: string }[] = [
  { id: "pretendard", name: "프리텐다드 (현재)", brand: "Pretendard" },
  { id: "nanum-square-neo", name: "나눔스퀘어 네오", brand: "NAVER" },
  {
    id: "nanum-gothic",
    name: "나눔고딕",
    brand: "NAVER",
    css: "https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap",
  },
  { id: "maru-buri", name: "마루 부리 (명조)", brand: "NAVER" },
  { id: "kakao-small", name: "카카오 작은글씨", brand: "Kakao" },
  { id: "kakao-big", name: "카카오 큰글씨", brand: "Kakao" },
  {
    id: "ibm-plex-kr",
    name: "IBM Plex Sans KR",
    brand: "IBM",
    css: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@300;400;500;600;700&display=swap",
  },
  {
    id: "google-sans",
    name: "Google Sans + 프리텐다드",
    brand: "Google",
    css: "https://fonts.googleapis.com/css2?family=Google+Sans:wght@400..700&display=swap",
  },
  // 아래 다섯은 한글이 없어 영문 · 숫자만 바뀌고 한글은 프리텐다드로 나온다.
  {
    id: "google-sans-flex",
    name: "Google Sans Flex + 프리텐다드",
    brand: "Google",
    css: "https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@300..900&display=swap",
  },
  {
    id: "roboto",
    name: "Roboto + 프리텐다드",
    brand: "Google · Android",
    css: "https://fonts.googleapis.com/css2?family=Roboto:wght@300..900&display=swap",
  },
  {
    id: "inter",
    name: "Inter + 프리텐다드",
    brand: "UI 범용",
    css: "https://fonts.googleapis.com/css2?family=Inter:wght@300..900&display=swap",
  },
  {
    id: "red-hat",
    name: "Red Hat Text + 프리텐다드",
    brand: "Red Hat",
    css: "https://fonts.googleapis.com/css2?family=Red+Hat+Text:wght@300..700&display=swap",
  },
  {
    id: "ubuntu",
    name: "Ubuntu + 프리텐다드",
    brand: "Canonical",
    css: "https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap",
  },
  {
    id: "ibm-plex",
    name: "IBM Plex Sans + Plex KR",
    brand: "IBM",
    css: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300..700&family=IBM+Plex+Sans+KR:wght@300;400;500;600;700&display=swap",
  },
  { id: "selawik", name: "Selawik + 프리텐다드", brand: "Microsoft" },
  // 재배포가 안 되는 브랜드 글꼴: 이 PC의 public/fonts-local에만 있다(scripts/ab-test/ab-fonts.ps1). 없으면 프리텐다드로 나온다.
  { id: "segoe-variable", name: "Segoe UI Variable + 맑은 고딕", brand: "Microsoft · 이 PC 전용" },
  { id: "amazon-ember", name: "Amazon Ember + 프리텐다드", brand: "Amazon · 이 PC 전용" },
  { id: "sf-pro", name: "SF Pro + 프리텐다드", brand: "Apple · 이 PC 전용" },
  { id: "sf-compact", name: "SF Compact + 프리텐다드", brand: "Apple · 이 PC 전용" },
  { id: "new-york", name: "New York + 마루 부리 (명조)", brand: "Apple · 이 PC 전용" },
  { id: "sf-mono", name: "SF Mono (고정폭)", brand: "Apple · 이 PC 전용" },
  // 코드용 고정폭 글꼴
  {
    id: "jetbrains-mono",
    name: "JetBrains Mono (고정폭)",
    brand: "JetBrains",
    css: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300..800&display=swap",
  },
  {
    id: "google-sans-code",
    name: "Google Sans Code (고정폭)",
    brand: "Google",
    css: "https://fonts.googleapis.com/css2?family=Google+Sans+Code:wght@300..800&display=swap",
  },
  { id: "system", name: "시스템 (맑은 고딕)", brand: "Windows · macOS" },
];

const FONT_KEY = "team4.font";

function isFont(v: string | null): v is FontId {
  return FONTS.some((x) => x.id === v);
}

/** 후보 E: 백엔드 docker compose의 nginx가 띄우는 원본 화면(정비자 8081 · 파트장 8082). 이 앱 개발 서버 포트로 짝을 찾는다. */
const ORIGINAL = { "5181": "http://127.0.0.1:8081/", "5182": "http://127.0.0.1:8082/" }[window.location.port] ?? null;

function isVariant(v: string | null): v is VariantId {
  return VARIANTS.some((x) => x.id === v);
}

/** 주소의 ?v= 를 먼저, 없으면 이 탭에서 고른 값을 쓴다. 탭마다 따로 기억해 여러 버전을 탭으로 나란히 띄울 수 있다. */
export function initVariant(): VariantId {
  const q = new URLSearchParams(window.location.search).get("v");
  let v: VariantId = "a";
  try {
    const saved = sessionStorage.getItem(KEY);
    if (isVariant(q)) v = q;
    else if (isVariant(saved)) v = saved;
  } catch {
    if (isVariant(q)) v = q;
  }
  setVariant(v);
  fitToWindow();
  void import("./styles/variants/fonts.css");
  setFont(savedFont());
  return v;
}

/** 주소의 ?font= 를 먼저, 없으면 이 탭에서 고른 값. 디자인 후보와 따로 기억한다. */
function savedFont(): FontId {
  const q = new URLSearchParams(window.location.search).get("font");
  if (isFont(q)) return q;
  try {
    const saved = sessionStorage.getItem(FONT_KEY);
    if (isFont(saved)) return saved;
  } catch {
    /* 기억이 없으면 현재 글꼴 */
  }
  return "pretendard";
}

export function setFont(f: FontId): void {
  const root = document.documentElement;
  if (f === "pretendard") delete root.dataset.font;
  else root.dataset.font = f;
  const css = FONTS.find((x) => x.id === f)?.css;
  if (css && !document.querySelector(`link[data-font-css="${f}"]`)) {
    const link = document.head.appendChild(document.createElement("link"));
    link.rel = "stylesheet";
    link.href = css;
    link.dataset.fontCss = f;
  }
  try {
    sessionStorage.setItem(FONT_KEY, f);
  } catch {
    /* 기억하지 못해도 글꼴은 바뀐다 */
  }
}

/** 태블릿처럼: 화면 틀을 창 크기에 맞춰 줄이거나 키우고 페이지 전체 스크롤은 없앤다(styles/variants/ab.css). */
function fitToWindow(): void {
  const root = document.documentElement;
  root.dataset.ab = "";
  const update = () => {
    root.style.setProperty("--vw", String(window.innerWidth));
    root.style.setProperty("--vh", String(window.innerHeight));
  };
  update();
  window.addEventListener("resize", update);
}

export function setVariant(v: VariantId): void {
  document.documentElement.dataset.variant = v;
  // 후보를 바꿀 때마다 기억한 다크 모드를 다시 적용한다(C도 라이트 · 다크를 가진다, 0009).
  initThemeMode();
  try {
    sessionStorage.setItem(KEY, v);
  } catch {
    /* 기억하지 못해도 화면은 바뀐다 */
  }
  const name = VARIANTS.find((x) => x.id === v)?.name ?? "";
  document.title = document.title.replace(/^\[.*?\] /, "");
  document.title = `[${v.toUpperCase()} ${name}] ${document.title}`;
}

/** 화면 왼쪽 아래 작은 전환 막대. 앱 화면 틀 밖(body)에 붙어 화면 배치에 끼어들지 않는다. */
export function VariantSwitcher() {
  const [cur, setCur] = useState<VariantId>(() => (document.documentElement.dataset.variant as VariantId) ?? "a");
  const [font, setCurFont] = useState<FontId>(() => (document.documentElement.dataset.font as FontId) ?? "pretendard");
  const [open, setOpen] = useState(true);
  if (!open) {
    return (
      <button className="abx abx-min" onClick={() => setOpen(true)} title="디자인 후보 전환">
        {cur.toUpperCase()}
      </button>
    );
  }
  return (
    <div className="abx" role="toolbar" aria-label="디자인 후보">
      <span className="abx-t">디자인 후보</span>
      {VARIANTS.map((x) => (
        <button
          key={x.id}
          className={x.id === cur ? "on" : ""}
          title={`${x.name} · 참고: ${x.ref}`}
          onClick={() => {
            setVariant(x.id);
            setCur(x.id);
          }}
        >
          <b>{x.id.toUpperCase()}</b>
          {x.name}
        </button>
      ))}
      {ORIGINAL ? (
        // E: 조장님 레포(c1a15-maint-guide)를 그대로 빌드해 nginx가 띄운 진짜 원본. 다른 앱이라 새 탭으로 연다.
        <a className="abx-e" href={ORIGINAL} target="_blank" rel="noreferrer" title="c1a15-maint-guide 레포 원본 화면(새 탭)">
          <b>E</b>조장님 원본 ↗
        </a>
      ) : null}
      <label className="abx-font" title="글꼴 후보 (결정 0006)">
        글꼴
        <select
          value={font}
          onChange={(e) => {
            const f = e.target.value as FontId;
            setFont(f);
            setCurFont(f);
          }}
        >
          {FONTS.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name} · {x.brand}
            </option>
          ))}
        </select>
      </label>
      <button className="abx-x" onClick={() => setOpen(false)} title="접기">
        ×
      </button>
    </div>
  );
}
