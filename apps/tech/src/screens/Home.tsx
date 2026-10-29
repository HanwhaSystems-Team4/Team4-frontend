// T02 홈 · T12 알람 · 할 일(종 목록). 값은 /api/tech/home · /api/tech/notifications 응답 그대로(P-19 ① · ②, S-03 P-09).

import { Fragment, useState } from "react";
import { dateTime, hhmm, Icon, num, type Home as HomeData, type Notifications } from "@team4/ui";

type Row = HomeData["alarms"][number];

const REPORT: Record<string, { label: string; chip: string }> = {
  awaiting_approval: { label: "승인 대기", chip: "amber" },
  approved: { label: "승인 완료", chip: "green" },
  rejected: { label: "반려", chip: "red" },
};

function rowState(a: Row): { dot: string; text: string; button: string; ghost: boolean } {
  if (a.status === "new") return { dot: "red", text: `${hhmm(a.occurred_at)} · 새 알람`, button: "점검 시작", ghost: false };
  if (a.status === "done") {
    const label = REPORT[a.report_status ?? ""]?.label ?? "";
    return { dot: "green", text: `${hhmm(a.occurred_at)} · 보고서 확정 · ${label}`, button: "보기", ghost: true };
  }
  const p = a.progress;
  const n = p && p.check_no > 0 ? `점검 ${p.check_no} / 최대 ${p.check_max} 진행 중` : "진행 중";
  return { dot: "amber", text: `${hhmm(a.occurred_at)} · ${n}`, button: "이어서 하기", ghost: true };
}

/** 마지막 열(0009): 새 알람 · 점검 중 = 작성 바람, 보고서를 확정한 것 = 보고서 상태(승인 대기 · 승인 완료 · 반려). */
function reportState(a: Row): { label: string; tone: string } {
  if (a.status !== "done") return { label: "작성 바람", tone: "todo" };
  const r = REPORT[a.report_status ?? ""];
  return { label: r?.label ?? "보고서 확정", tone: r?.chip ?? "gray" };
}

/** 알람 화면의 센서 표와 같은 5개 센서(이름 · 단위 · 소수 자리). 값은 홈 API의 센서 스냅샷이다. 알람 화면은 이 이름을 세션 응답에서 받는다. */
export const SENSORS: { key: string; label: string; unit: string; d: number }[] = [
  { key: "temp_diff_k", label: "온도 차", unit: "K", d: 1 },
  { key: "rotational_speed_rpm", label: "회전 속도", unit: "rpm", d: 0 },
  { key: "torque_nm", label: "회전력", unit: "Nm", d: 1 },
  { key: "tool_wear_min", label: "공구 마모", unit: "분", d: 0 },
  { key: "air_temperature_k", label: "공기 온도", unit: "K", d: 1 },
];

function sensorText(a: Row, s: (typeof SENSORS)[number]): string {
  const v = (a.sensor_snapshot as Record<string, number | undefined>)[s.key];
  return v == null ? "-" : `${s.d ? v.toFixed(s.d) : num(v)} ${s.unit}`;
}

/** 진행 열(시각 없이): 새 알람 · 점검 중(n / 최대 m) · 보고서 확정. */
function progressText(a: Row): string {
  if (a.status === "new") return "새 알람";
  if (a.status === "done") return "보고서 확정";
  const p = a.progress;
  return p && p.check_no > 0 ? `점검 ${p.check_no} / 최대 ${p.check_max} 진행 중` : "진행 중";
}

/** 교대 슬라이더 위치(0 ~ 100): 교대 시작 · 끝 시각(HH:MM) 사이에서 지금 시각이 어디인지. 교대 밖이면 가까운 쪽 끝. 표시용 계산이다. */
export function shiftPercent(start: string, end: string, now: Date = new Date()): number {
  const mins = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  const day = 1440;
  const span = (mins(end) - mins(start) + day) % day || day;
  const at = (now.getHours() * 60 + now.getMinutes() - mins(start) + day) % day;
  if (at <= span) return Math.round((100 * at) / span);
  return at - span < (day - span) / 2 ? 100 : 0;
}

/** 새 알람(빨강) → 진행 중 → 완료(이 교대에 확정한 보고서) 순, 같은 상태 안에서는 서버 순서(최근 먼저). */
export function sortedAlarms(h: HomeData): Row[] {
  const rank = (a: Row) => (a.status === "new" ? 0 : a.status === "done" ? 2 : 1);
  return [...h.alarms].sort((a, b) => rank(a) - rank(b));
}

export type SortKey = "status" | "recent" | "name";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "status", label: "상태순" },
  { key: "recent", label: "발생순" },
  { key: "name", label: "이름순" },
];

/** 정렬 드롭다운(0008): 상태순 = 위 순서, 발생순 = 발생 시각 최신 먼저, 이름순 = 설비 번호(M-01, M-02 …) 순. */
export function sortAlarms(h: HomeData, key: SortKey): Row[] {
  if (key === "recent") return [...h.alarms].sort((a, b) => b.occurred_at.localeCompare(a.occurred_at));
  if (key === "name") return [...h.alarms].sort((a, b) => a.equipment_id.localeCompare(b.equipment_id, "ko", { numeric: true }));
  return sortedAlarms(h);
}

/** 산업 관제형 후보(C)는 최신 발생 순서로 시작한다. 다른 화면은 지금처럼 상태순. */
function initialSort(): SortKey {
  const v = document.documentElement.dataset.variant;
  return v === "c" || v === "d" ? "recent" : "status";
}

export function HomeScreen({
  home,
  onOpen,
  onResume,
}: {
  home: HomeData;
  onOpen: (a: Row) => void;
  onResume?: (sessionId: number) => void;
}) {
  const [sort, setSort] = useState<SortKey>(initialSort);
  const [sortOpen, setSortOpen] = useState(false);
  const rows = sortAlarms(home, sort);
  // 최근 내 보고서도 표의 행으로 보인다(0009). 이미 알람 행(이 교대에 확정한 보고서)으로 보이는 것은 한 번만.
  const shown = new Set(rows.map((a) => a.report_session_id).filter((x) => x != null));
  const reports = [...home.recent_reports]
    .filter((r) => !shown.has(r.session_id))
    .sort((a, b) =>
      sort === "name"
        ? a.equipment_id.localeCompare(b.equipment_id, "ko", { numeric: true })
        : (b.confirmed_at ?? "").localeCompare(a.confirmed_at ?? ""),
    );
  const rejected = home.recent_reports.find((r) => r.status === "rejected");
  const s = home.shift;
  const now = new Date();
  const pct = shiftPercent(s.start_text, s.end_text, now);
  return (
    <div className="ap-body nostep">
      <div className="g2">
        <div>
          <div className="cd ">
            <div className="cd-h">
              <Icon name="bell" />
              <b>내 알람</b>
              {rows.length ? <span className="cnt">{rows.length}</span> : null}
              <div className="al-sort pos-r">
                <span className="sel2" role="button" tabIndex={0} aria-label="정렬" onClick={() => setSortOpen((o) => !o)}>
                  {SORTS.find((s) => s.key === sort)?.label}
                  <Icon name="chevron-right" className="rot" />
                </span>
                {sortOpen ? (
                  <div className="dd" role="listbox">
                    {SORTS.map((s) => (
                      <div
                        key={s.key}
                        role="option"
                        aria-selected={s.key === sort}
                        className={s.key === sort ? "on" : ""}
                        onClick={() => {
                          setSort(s.key);
                          setSortOpen(false);
                        }}
                      >
                        {s.label}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
            {rows.length || reports.length ? (
              <div className="al-head" aria-hidden="true">
                <span>설비 · 증상</span>
                <span>경계</span>
                {SENSORS.map((x) => (
                  <span key={x.key}>{x.label}</span>
                ))}
                <span>진행</span>
                <span>상태</span>
                <span />
              </div>
            ) : null}
            {rows.length === 0 && reports.length === 0 ? (
              <div className="empty">
                <Icon name="bell" />
                배정된 알람이 없습니다
              </div>
            ) : (
              rows.map((a) => {
                const st = rowState(a);
                const rs = reportState(a);
                return (
                  <div className="al" key={a.alarm_id} data-alarm={a.alarm_id} data-status={a.status} data-report={a.report_status ?? ""}>
                    <span className={`dot ${st.dot}`} />
                    <div className="al-m">
                      <b>
                        {a.equipment_id} · {a.group_name}
                      </b>
                      <span>{st.text}</span>
                    </div>
                    <div className="al-v">
                      <b>
                        {a.alarm.value} {a.alarm.unit}
                      </b>
                      <span>
                        {a.alarm.direction} · {a.alarm.boundary}
                      </span>
                    </div>
                    <div className="al-s">
                      {SENSORS.map((x) => (
                        <span key={x.key} className={a.alarm.sensor === x.label ? "hot" : undefined}>
                          {sensorText(a, x)}
                        </span>
                      ))}
                    </div>
                    <span className="al-p">{progressText(a)}</span>
                    <span className={`al-r st-${rs.tone}`}>{rs.label}</span>
                    <span className={`btn ${st.ghost ? "ghost" : ""}`} role="button" tabIndex={0} onClick={() => onOpen(a)}>
                      {st.button}
                    </span>
                  </div>
                );
              })
            )}
            {reports.map((r) => (
              <div className="rp" key={`r${r.report_id}`} data-report={r.status}>
                <span className="rp-t">
                  {r.equipment_id} · {r.cause} · {r.confirmed_at ? dayTime(r.confirmed_at) : ""}
                </span>
                <span className={`al-r st-${REPORT[r.status]?.chip ?? "gray"}`}>{REPORT[r.status]?.label ?? r.status}</span>
                <span className="btn ghost" role="button" tabIndex={0} onClick={() => onResume?.(r.session_id)}>
                  보기
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="cd ">
            <div className="cd-h">
              <Icon name="clock" />
              <b>
                오늘 교대 · {s.start_text} ~ {s.end_text}
              </b>
            </div>
            <div className="kts">
              <div className="kt">
                <b>{s.done}</b>
                <span>처리 완료</span>
              </div>
              <div className="kt">
                <b>{s.in_progress}</b>
                <span>진행 중</span>
              </div>
              <div className="kt">
                <b>{s.calls}</b>
                <span>파트장 호출</span>
              </div>
            </div>
            <div
              className="shift-bar"
              role="progressbar"
              aria-label="오늘 교대 진행"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              data-edge={pct >= 88 ? "end" : pct <= 12 ? "start" : undefined}
              style={{ ["--p" as string]: `${pct}%` }}
            >
              <i className="shift-fill" />
              <i className="shift-now">
                <em>지금 {String(now.getHours()).padStart(2, "0")}:{String(now.getMinutes()).padStart(2, "0")}</em>
              </i>
              <span className="shift-t s">{s.start_text}</span>
              <span className="shift-t e">{s.end_text}</span>
            </div>
          </div>
          <div className="cd mt">
            <div className="cd-h">
              <Icon name="shield" />
              <b>안전 수칙</b>
            </div>
            <div className="safe">
              <Icon name="lock" />
              <div>
                <b>잠금을 먼저 확인합니다</b>
                <span>잠금(1.2절)을 확인하기 전에는 어떤 점검 지시도 표시되지 않습니다.</span>
              </div>
            </div>
          </div>
          <div className="cd mt">
            <div className="cd-h">
              <Icon name="file-text" />
              <b>최근 내 보고서</b>
            </div>
            {home.recent_reports.length === 0 ? (
              <div className="empty">
                <Icon name="file-text" />
                최근 보고서가 없습니다
              </div>
            ) : (
              home.recent_reports.map((r) => (
                <div className="rl" key={r.report_id}>
                  <span>
                    {r.equipment_id} · {r.cause} · {r.confirmed_at ? dayTime(r.confirmed_at) : ""}
                  </span>
                  <span className={`ch ${REPORT[r.status]?.chip ?? "gray"}`}>{REPORT[r.status]?.label ?? r.status}</span>
                </div>
              ))
            )}
            {rejected ? ( // T02 / rejected(결정 017 ①, AC-11-C1): 반려 사유 · 파트장 · 시각 + 이어서 하기
              <>
                <div className="banner bad">
                  <Icon name="rotate-ccw" />
                  <div>
                    <b>
                      반려 사유 · {rejected.rejected_by_name} {rejected.rejected_at ? hhmm(rejected.rejected_at) : ""}
                    </b>
                    {rejected.reject_reason} "이어서 하기"로 추가 점검하거나 보고서 항목을 고친 뒤 다시 확정합니다.
                  </div>
                </div>
                <span className="btn ghost full" role="button" tabIndex={0} onClick={() => onResume?.(rejected.session_id)}>
                  이어서 하기
                </span>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/** 최근 보고서 시각: 오늘이면 "00:29", 다른 날이면 "어제 22:44" · "10-11 22:44"(현장 시각). */
export function dayTime(iso: string, now: Date = new Date()): string {
  const d = dateTime(iso).slice(0, 10);
  const today = dateTime(now.toISOString()).slice(0, 10);
  const yesterday = dateTime(new Date(now.getTime() - 86400000).toISOString()).slice(0, 10);
  if (d === today) return hhmm(iso);
  return `${d === yesterday ? "어제" : d.slice(5)} ${hhmm(iso)}`;
}

const ANSWER: Record<string, string> = {
  approved: "승인 후 진행",
  daytime: "주간 처리",
  direct: "직접 확인",
  assign: "주간 숙련자 배정",
};

const GROUPS: { kind: string; label: string; button: string; dot: string }[] = [
  { kind: "new_alarm", label: "배정된 새 알람", button: "알람 보기", dot: "red" },
  { kind: "in_progress", label: "진행 중인 점검", button: "이어서 하기", dot: "amber" },
  { kind: "answered_call", label: "파트장 답이 온 호출", button: "답 보기", dot: "green" },
  { kind: "rejected_report", label: "반려된 보고서", button: "보고서 보기", dot: "red" },
];

type Item = Notifications["items"][number];

function itemText(i: Item): { title: string; sub: string } {
  const when = i.occurred_at ? hhmm(i.occurred_at) : "";
  if (i.kind === "rejected_report") {
    // T12 / list '반려된 보고서'(결정 017 ①): 설비 · 원인 · 시각 / 파트장 · 시각 · 사유
    return {
      title: `${i.equipment_id} · ${i.report_cause} · ${when}`,
      sub: `${i.rejected_by_name ?? ""} ${i.rejected_at ? hhmm(i.rejected_at) : ""} · ${i.reject_reason ?? ""}`.trim(),
    };
  }
  if (i.kind === "answered_call") {
    const by = `${i.answered_by_name ?? i.answered_by ?? ""} ${i.answered_at ? hhmm(i.answered_at) : ""}`.trim();
    return {
      title: `${i.equipment_id} · ${i.call_title}(${i.call_section}, ${i.call_grade})`,
      sub: `${by} · ${ANSWER[i.answer ?? ""] ?? i.answer ?? ""}`,
    };
  }
  const p = i.progress;
  const sub =
    i.kind === "new_alarm"
      ? `${when} · 새 알람`
      : `${when} · ${p && p.check_no > 0 ? `점검 ${p.check_no} / 최대 ${p.check_max}` : "진행 중"}${i.answer ? " · 파트장 답 도착" : ""}`;
  return { title: `${i.equipment_id} · ${i.group_name}`, sub };
}

/** T12 종 목록 패널: 배정된 새 알람 · 진행 중인 점검 · 파트장 답이 온 호출 · 반려된 보고서(AC-37). */
export function NotifyPanel({
  data,
  onItem,
}: {
  data: Notifications;
  onItem: (item: Notifications["items"][number]) => void;
}) {
  return (
    <div className="panel" role="dialog" aria-label="알람 · 할 일">
      <div className="cd-h">
        <Icon name="bell" />
        <b>알람 · 할 일</b>
      </div>
      {data.empty ? (
        <div className="empty">
          <Icon name="bell" />
          알람 · 할 일이 없습니다
        </div>
      ) : (
        GROUPS.map((g) => {
          const items = data.items.filter((i) => i.kind === g.kind);
          if (!items.length) return null;
          return (
            <Fragment key={g.kind}>
              <div className="grp">{g.label}</div>
              {items.map((i) => {
                const t = itemText(i);
                return (
                  <div className="nt-item" key={`${i.kind}-${i.alarm_id}-${i.call_section ?? ""}`}>
                    <span className={`dot ${g.dot}`} />
                    <div className="al-m">
                      <b>{t.title}</b>
                      <span>{t.sub}</span>
                    </div>
                    <span className="btn ghost sm2" role="button" tabIndex={0} onClick={() => onItem(i)}>
                      {g.button}
                    </span>
                  </div>
                );
              })}
            </Fragment>
          );
        })
      )}
    </div>
  );
}
