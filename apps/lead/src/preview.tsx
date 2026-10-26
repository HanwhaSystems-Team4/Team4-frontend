// 화면 미리보기(A/B 발표 · 비교용, 결정 0004): 백엔드 없이 테스트 fixture로 화면 하나를 그린다.
// 주소 /preview.html?screen=calls&v=c. 화면 조작은 이동하지 않는다(실제 흐름은 앱에서 본다).

import { StrictMode, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { initThemeMode, initVariant, VariantSwitcher, type Api } from "@team4/ui";
import "@team4/ui/styles/guide-a.css";
import "@team4/ui/styles/direction-guide.css";
import "@team4/ui/styles/theme.css";
import "@team4/ui/styles/variants.css";
import "@team4/ui/styles/dark.css"; // 다크 모드(<html data-theme="dark">, 결정 0005)
import "./app.css";
import { ApprovalList, Review } from "./screens/Approvals";
import { AuditScreen } from "./screens/Audit";
import { CallDetail, CallList } from "./screens/Calls";
import { Frame, type Menu } from "./screens/Frame";
import { GradesScreen } from "./screens/Grades";
import { Login } from "./screens/Login";

const fx = import.meta.glob("./__tests__/fixtures/*.json", { eager: true, import: "default" }) as Record<string, unknown>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const load = (name: string): any => structuredClone(fx[`./__tests__/fixtures/${name}.json`]);
const noop = () => {};
const api = {} as Api;
const NOW = "2026-10-01T08:12:00+09:00";

function F({ menu, title, children }: { menu: Menu; title: string; children: ReactNode }) {
  return (
    <Frame menu={menu} me={{ display_name: "박파트장" }} title={title} now={NOW} onMenu={noop}>
      {children}
    </Frame>
  );
}

const SCREENS: { id: string; label: string; render: () => ReactNode }[] = [
  { id: "login", label: "L01 로그인", render: () => <Login api={api} onDone={noop} /> },
  {
    id: "approvals",
    label: "L02 승인 대기",
    render: () => (
      <F menu="approvals" title="승인 대기">
        <ApprovalList data={load("overview-list")} onOpen={noop} />
      </F>
    ),
  },
  {
    id: "review",
    label: "L03 보고서 검토",
    render: () => (
      <F menu="approvals" title="승인 대기">
        <Review api={api} report={load("report-review")} onDone={noop} />
      </F>
    ),
  },
  {
    id: "calls",
    label: "L04 처리할 호출",
    render: () => (
      <F menu="calls" title="처리할 호출">
        <CallList data={load("calls-list")} onOpen={noop} />
      </F>
    ),
  },
  {
    id: "call",
    label: "L04 호출 상세",
    render: () => (
      <F menu="calls" title="처리할 호출">
        <CallDetail api={api} call={load("call-detail")} onDone={noop} />
      </F>
    ),
  },
  {
    id: "grades",
    label: "L05 권한 등급",
    render: () => (
      <F menu="grades" title="권한 등급">
        <GradesScreen api={api} data={load("grades-default")} onChanged={noop} />
      </F>
    ),
  },
  {
    id: "audit",
    label: "L06 감사 기록",
    render: () => (
      <F menu="audit" title="감사 기록">
        <AuditScreen data={load("audit-default")} onFilter={noop} />
      </F>
    ),
  },
];

function Preview() {
  const [id, setId] = useState(() => new URLSearchParams(location.search).get("screen") ?? "approvals");
  const cur = SCREENS.find((x) => x.id === id) ?? SCREENS[1];
  return (
    <div className="pvw">
      <nav className="pvw-nav">
        {SCREENS.map((x) => (
          <button
            key={x.id}
            className={x.id === cur.id ? "on" : ""}
            onClick={() => {
              setId(x.id);
              const q = new URLSearchParams(location.search);
              q.set("screen", x.id);
              history.replaceState(null, "", `?${q}`);
            }}
          >
            {x.label}
          </button>
        ))}
      </nav>
      {cur.render()}
    </div>
  );
}

initThemeMode();
initVariant();
const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <Preview />
      <VariantSwitcher />
    </StrictMode>,
  );
}
