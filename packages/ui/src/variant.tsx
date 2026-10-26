// A/B 테스트용 디자인 후보 전환(결정 0004). 후보는 styles/variants/*.css가 <html data-variant>에 걸려 덧씌운다.
// 화면 구성 · 버튼 · 이동 순서(DOM)는 그대로이고 겉모양과 배치만 바뀐다. 평소 개발 · 빌드(VITE_AB_TEST 없음)에서는 쓰지 않는다.

import { useState } from "react";

export type VariantId = "a" | "b" | "c" | "d";

export const VARIANTS: { id: VariantId; name: string; ref: string }[] = [
  { id: "a", name: "현재 버전", ref: "지금 화면" },
  { id: "b", name: "현장 터치형", ref: "ISA-101 HMI · Material 3" },
  { id: "c", name: "업무 도구형", ref: "IBM Carbon · Atlassian" },
  { id: "d", name: "플로팅 벤토형", ref: "Apple 벤토 그리드 · Dynamic Island · Arc" },
];

const KEY = "team4.variant";

/** 후보 E: 백엔드 docker compose의 nginx가 띄우는 원본 화면(정비자 8081 · 파트장 8082). 이 앱 개발 서버 포트로 짝을 찾는다. */
const ORIGINAL = { "5181": "http://127.0.0.1:8081/", "5182": "http://127.0.0.1:8082/" }[window.location.port] ?? null;

function isVariant(v: string | null): v is VariantId {
  return VARIANTS.some((x) => x.id === v);
}

/** 주소의 ?v= 를 먼저, 없으면 이 탭에서 고른 값을 쓴다. 탭마다 따로 기억해 4개 버전을 탭으로 나란히 띄울 수 있다. */
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
  return v;
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
      <button className="abx-x" onClick={() => setOpen(false)} title="접기">
        ×
      </button>
    </div>
  );
}
