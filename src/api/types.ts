/*
 * 프론트엔드가 기대하는 API 응답 타입.
 * 백엔드 명세가 확정되지 않은 가정이므로, 확정되면 이 파일을 기준으로 맞춘다.
 */

/** AI4I 2020 고장 유형 (RNF는 1건뿐이라 제외) */
export type FailureMode = 'TWF' | 'HDF' | 'PWF' | 'OSF'

/** AI4I 2020 제품 품질 타입 */
export type ProductType = 'L' | 'M' | 'H'

export type EquipmentStatus = 'critical' | 'warning' | 'normal'
export type EventSeverity = 'critical' | 'warning' | 'info'
export type EventStatus = 'pending' | 'analyzing' | 'done' | 'reported'

export interface User {
  id: string
  name: string
}

export interface LoginResponse {
  token: string
  user: User
}

/** 센서 단위: 온도 K, 회전속도 rpm, 토크 Nm, 공구 마모 min */
export interface SensorSnapshot {
  airTemp: number
  processTemp: number
  rpm: number
  torque: number
  toolWear: number
}

export interface Equipment {
  id: string
  type: ProductType
  name: string
  line: string
  status: EquipmentStatus
  sensors: SensorSnapshot
}

export interface AnomalyEvent {
  id: string
  equipmentId: string
  alarmCode: string
  failureMode: FailureMode
  severity: EventSeverity
  status: EventStatus
  message: string
  /** ISO 8601 */
  occurredAt: string
}

export interface DailyCount {
  /** ISO 8601 (해당 날짜 00:00) */
  date: string
  counts: Record<FailureMode, number>
}

export interface DashboardSummary {
  todayAnomalies: number
  yesterdayAnomalies: number
  pendingAnalyses: number
  equipmentTotal: number
  equipmentAtRisk: number
  reportsInPeriod: number
}

export interface DashboardResponse {
  generatedAt: string
  summary: DashboardSummary
  daily: DailyCount[]
  equipment: Equipment[]
  events: AnomalyEvent[]
}
