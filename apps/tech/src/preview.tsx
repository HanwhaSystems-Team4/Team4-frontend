// 화면 미리보기(A/B 발표 · 비교용, 결정 0004): 백엔드 없이 테스트 fixture로 화면 하나를 그린다.
// 주소 /preview.html?screen=diagnosis&v=b. 화면 조작은 이동하지 않는다(실제 흐름은 앱에서 본다).

import { StrictMode, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import {
  initThemeMode,
  initVariant,
  RecordModal,
  StepBar,
  TopBar,
  VariantSwitcher,
  type HistoryRecord,
  type Home,
  type Instruction,
  type Notifications,
  type SessionWithPreview,
} from "@team4/ui";
import "@team4/ui/styles/guide-a.css";
import "@team4/ui/styles/direction-guide.css";
import "@team4/ui/styles/past-adjust.css";
import "@team4/ui/styles/theme.css";
import "@team4/ui/styles/variants.css";
import "@team4/ui/styles/dark.css"; // 다크 모드(<html data-theme="dark">, 결정 0005)
import "./app.css";
import { emptyDraft } from "./device";
import { AlarmScreen } from "./screens/Alarm";
import { DiagnosisScreen } from "./screens/Diagnosis";
import { ActionScreen, CallScreen, ReportScreen } from "./screens/Flow";
import { HomeScreen, NotifyPanel } from "./screens/Home";
import { InstructionScreen, PendingModal } from "./screens/Instruction";
import { LockScreen, PrecheckScreen } from "./screens/Lock";

const fx = import.meta.glob("./__tests__/fixtures/*.json", { eager: true, import: "default" }) as Record<string, unknown>;
const load = <T = SessionWithPreview,>(name: string): T => structuredClone(fx[`./__tests__/fixtures/${name}.json`]) as T;
const noop = () => {};

function Shell({ step, children, context = true }: { step?: number; children: ReactNode; context?: boolean }) {
  const s = load("session-before-lock");
  return (
    <div className="ap">
      <TopBar
        context={context ? `${s.alarm.equipment_id} · ${s.alarm.group_name} · 02:14` : null}
        clock="02:31"
        homeOn={!step}
        bell={2}
        user={{ name: "김정비", role: "야간 정비" }}
        onHome={noop}
        onBell={noop}
      />
      {step ? <StepBar current={step} onPick={noop} /> : null}
      {children}
    </div>
  );
}

const SCREENS: { id: string; label: string; render: () => ReactNode }[] = [
  {
    id: "home",
    label: "T02 홈",
    render: () => {
      const home = load<Home>("home-done"); // 새 알람 · 점검 중 · 승인 대기 보고서
      home.recent_reports.push(
        { ...home.recent_reports[0], report_id: 98, session_id: 9801, equipment_id: "M-07", cause: "냉각 팬 베어링 마모", status: "approved", confirmed_at: "2026-10-12T14:20:00+09:00" },
        { ...home.recent_reports[0], report_id: 97, session_id: 9701, equipment_id: "M-12", cause: "냉각수 부족", status: "rejected", confirmed_at: "2026-10-12T09:05:00+09:00" },
      );
      return (
        <Shell context={false}>
          <HomeScreen home={home} onOpen={noop} />
        </Shell>
      );
    },
  },
  {
    id: "notify",
    label: "T12 알림 패널",
    render: () => (
      <Shell context={false}>
        <HomeScreen home={load<Home>("home-in-progress")} onOpen={noop} />
        <NotifyPanel data={load<Notifications>("notifications-list")} onItem={noop} />
      </Shell>
    ),
  },
  {
    id: "alarm",
    label: "T03 알람",
    render: () => (
      <Shell step={1}>
        <AlarmScreen s={load("session-before-lock")} onNext={noop} />
      </Shell>
    ),
  },
  {
    id: "diagnosis",
    label: "T04 진단",
    render: () => (
      <Shell step={2}>
        <DiagnosisScreen s={load("session-before-lock")} onRecord={noop} onStart={noop} />
      </Shell>
    ),
  },
  {
    id: "record",
    label: "과거 기록 창",
    render: () => (
      <Shell step={2}>
        <DiagnosisScreen s={load("session-before-lock")} onRecord={noop} onStart={noop} />
        <RecordModal record={load<HistoryRecord>("record")} onClose={noop} />
      </Shell>
    ),
  },
  {
    id: "lock",
    label: "T05 잠금",
    render: () => (
      <Shell step={3}>
        <LockScreen s={load("session-before-lock")} busy={false} onLock={noop} />
      </Shell>
    ),
  },
  {
    id: "precheck",
    label: "T05 사전 확인",
    render: () => (
      <Shell step={3}>
        <PrecheckScreen s={load("session-precheck")} busy={false} values="" onValues={noop} onDone={noop} />
      </Shell>
    ),
  },
  {
    id: "instruct",
    label: "T06 점검 지시",
    render: () => {
      const s = load("event-instruct");
      return (
        <Shell step={3}>
          <InstructionScreen
            s={s}
            ins={s.instruction as Instruction}
            draft={{ ...emptyDraft(), value: "이상", memo: "벨트 장력이 느슨함" }}
            busy={false}
            repeatDismissed={false}
            onDraft={noop}
            onCheck={noop}
            onSend={noop}
            onManual={noop}
            onRecord={noop}
            onContinueOriginal={noop}
            onHandover={noop}
          />
        </Shell>
      );
    },
  },
  {
    id: "confirm",
    label: "T07 확인 질문",
    render: () => {
      const s = load("event-confirm");
      const ins = load("event-instruct").instruction as Instruction;
      return (
        <Shell step={3}>
          <InstructionScreen
            s={s}
            ins={ins}
            draft={emptyDraft()}
            busy
            repeatDismissed={false}
            onDraft={noop}
            onCheck={noop}
            onSend={noop}
            onManual={noop}
            onRecord={noop}
            onContinueOriginal={noop}
            onHandover={noop}
          />
          <PendingModal s={s} ins={ins} busy={false} onConfirm={noop} onChoice={noop} />
        </Shell>
      );
    },
  },
  {
    id: "action",
    label: "T08 조치 · 재가동",
    render: () => (
      <Shell step={4}>
        <ActionScreen s={load("s03-action-a")} busy={false} checked={[]} onCheck={noop} send={noop} />
      </Shell>
    ),
  },
  {
    id: "call",
    label: "T10 파트장 호출",
    render: () => (
      <Shell step={3}>
        <CallScreen s={load("s03-call-summary")} busy={false} approvedSeen={false} onApprovedSeen={noop} onReport={noop} send={noop} />
      </Shell>
    ),
  },
  {
    id: "report",
    label: "T09 보고서",
    render: () => (
      <Shell step={5}>
        <ReportScreen report={load("s03-report-draft").report!} busy={false} send={noop} onHome={noop} />
      </Shell>
    ),
  },
];

function Preview() {
  const [id, setId] = useState(() => new URLSearchParams(location.search).get("screen") ?? "home");
  const cur = SCREENS.find((x) => x.id === id) ?? SCREENS[0];
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
