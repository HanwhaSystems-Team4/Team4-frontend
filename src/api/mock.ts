/*
 * 백엔드 연동 전 Mock 데이터
 * - 설비 ID·타입·센서 값은 UCI AI4I 2020 데이터셋의 실제 고장 행에서 가져왔다.
 * - 알람 코드, 이벤트 시각, 처리 상태는 임시로 정한 가상 값이다.
 */
import { FAILURE_MODE_KEYS, FAILURE_MODES } from '../constants/labels'
import type {
  AnomalyEvent,
  DailyCount,
  DashboardResponse,
  Equipment,
  EventSeverity,
  EventStatus,
  FailureMode,
} from './types'

export const TEMP_ACCOUNT = { id: 'hanwha0902', password: 'hanwha0902', name: '정비 담당자' }

const EQUIPMENT: Equipment[] = [
  { id: 'M18096', type: 'M', name: '가공기 #1', line: 'A라인', status: 'critical',
    sensors: { airTemp: 300.8, processTemp: 309.4, rpm: 1342, torque: 62.4, toolWear: 113 } },
  { id: 'L47249', type: 'L', name: '가공기 #2', line: 'A라인', status: 'critical',
    sensors: { airTemp: 298.9, processTemp: 309.0, rpm: 1410, torque: 65.7, toolWear: 191 } },
  { id: 'H30501', type: 'H', name: '가공기 #3', line: 'B라인', status: 'warning',
    sensors: { airTemp: 296.9, processTemp: 307.8, rpm: 1549, torque: 35.8, toolWear: 206 } },
  { id: 'M15054', type: 'M', name: '가공기 #4', line: 'B라인', status: 'warning',
    sensors: { airTemp: 298.2, processTemp: 308.5, rpm: 2678, torque: 10.7, toolWear: 86 } },
  { id: 'M14860', type: 'M', name: '가공기 #5', line: 'C라인', status: 'normal',
    sensors: { airTemp: 298.1, processTemp: 308.6, rpm: 1551, torque: 42.8, toolWear: 0 } },
  { id: 'L47181', type: 'L', name: '가공기 #6', line: 'C라인', status: 'normal',
    sensors: { airTemp: 298.2, processTemp: 308.7, rpm: 1408, torque: 46.3, toolWear: 3 } },
]

interface EventSeed {
  equipmentId: string
  mode: FailureMode
  severity: EventSeverity
  status: EventStatus
  minutesAgo: number
  message: string
}

const EVENT_SEED: EventSeed[] = [
  { equipmentId: 'M18096', mode: 'HDF', severity: 'critical', status: 'pending', minutesAgo: 12,
    message: '공정-공기 온도차 8.6K, 회전속도 1342rpm으로 방열 한계 근접' },
  { equipmentId: 'L47249', mode: 'OSF', severity: 'critical', status: 'analyzing', minutesAgo: 38,
    message: '토크 × 공구 마모 = 12,549 minNm, 과부하 기준 초과' },
  { equipmentId: 'L47249', mode: 'PWF', severity: 'warning', status: 'analyzing', minutesAgo: 41,
    message: '소요 전력 9.7kW, 허용 범위 상한 근접' },
  { equipmentId: 'H30501', mode: 'TWF', severity: 'warning', status: 'done', minutesAgo: 95,
    message: '공구 사용 시간 206분, 교체 권장 구간 진입' },
  { equipmentId: 'M15054', mode: 'PWF', severity: 'warning', status: 'done', minutesAgo: 180,
    message: '회전속도 2678rpm·토크 10.7Nm, 소요 전력 하한 미달' },
  { equipmentId: 'M18096', mode: 'HDF', severity: 'warning', status: 'reported', minutesAgo: 420,
    message: '공정-공기 온도차 감소 추세 감지' },
  { equipmentId: 'H30501', mode: 'TWF', severity: 'info', status: 'reported', minutesAgo: 1460,
    message: '공구 사용 시간 200분 도달, 사전 알림' },
  { equipmentId: 'L47181', mode: 'OSF', severity: 'info', status: 'reported', minutesAgo: 2900,
    message: '일시적 토크 상승 후 정상 복귀' },
]

// 일별 발생 건수 생성용 고정 시퀀스 (재현 가능한 값)
const DAILY_PATTERN: Record<FailureMode, number[]> = {
  TWF: [1, 0, 2, 1, 0, 1, 3, 1, 0, 2, 1, 1, 0, 2, 1, 0, 1, 2, 0, 1, 1, 0, 2, 1, 1, 0, 1, 2, 1, 1],
  HDF: [2, 3, 1, 2, 4, 2, 1, 3, 2, 1, 2, 4, 3, 2, 1, 2, 3, 1, 2, 2, 3, 1, 2, 4, 2, 1, 3, 2, 3, 2],
  PWF: [1, 2, 1, 0, 2, 1, 2, 1, 3, 1, 0, 2, 1, 1, 2, 1, 0, 2, 1, 3, 1, 2, 1, 0, 2, 1, 2, 1, 2, 2],
  OSF: [2, 1, 1, 3, 1, 2, 1, 2, 1, 3, 2, 1, 2, 1, 3, 2, 1, 1, 2, 1, 2, 3, 1, 2, 1, 2, 1, 3, 1, 2],
}

const REPORTS_PER_DAY = [1, 2, 1, 3, 2, 1, 2, 2, 1, 3, 2, 2, 1, 2, 3, 1, 2, 2, 1, 2, 3, 2, 1, 2, 2, 3, 1, 2, 2, 1]

const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0)

export function buildMockDashboard(days: number): DashboardResponse {
  const now = Date.now()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 오래된 날짜 → 오늘 순서
  const daily: DailyCount[] = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const counts = {} as Record<FailureMode, number>
    FAILURE_MODE_KEYS.forEach((m) => {
      const seq = DAILY_PATTERN[m]
      counts[m] = seq[(seq.length - 1 - i) % seq.length]
    })
    daily.push({ date: date.toISOString(), counts })
  }

  const events: AnomalyEvent[] = EVENT_SEED.map((e, idx) => ({
    id: `EVT-${String(1042 - idx).padStart(5, '0')}`,
    equipmentId: e.equipmentId,
    alarmCode: FAILURE_MODES[e.mode].alarm,
    failureMode: e.mode,
    severity: e.severity,
    status: e.status,
    message: e.message,
    occurredAt: new Date(now - e.minutesAgo * 60000).toISOString(),
  }))

  const dayTotal = (d: DailyCount) => sum(Object.values(d.counts))

  return {
    generatedAt: new Date(now).toISOString(),
    summary: {
      todayAnomalies: dayTotal(daily[daily.length - 1]),
      yesterdayAnomalies: dayTotal(daily[daily.length - 2]),
      pendingAnalyses: events.filter((e) => e.status === 'pending' || e.status === 'analyzing').length,
      equipmentTotal: EQUIPMENT.length,
      equipmentAtRisk: EQUIPMENT.filter((e) => e.status !== 'normal').length,
      reportsInPeriod: sum(REPORTS_PER_DAY.slice(-days)),
    },
    daily,
    equipment: EQUIPMENT,
    events,
  }
}
