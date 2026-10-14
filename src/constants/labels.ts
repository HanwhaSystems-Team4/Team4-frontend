import type { EquipmentStatus, EventSeverity, EventStatus, FailureMode } from '../api/types'

export const FAILURE_MODES: Record<FailureMode, { label: string; alarm: string; color: string }> = {
  TWF: { label: '공구 마모', alarm: 'TWF-101', color: 'var(--mode-twf)' },
  HDF: { label: '방열 불량', alarm: 'HDF-201', color: 'var(--mode-hdf)' },
  PWF: { label: '전력 이상', alarm: 'PWF-301', color: 'var(--mode-pwf)' },
  OSF: { label: '과부하', alarm: 'OSF-401', color: 'var(--mode-osf)' },
}

export const FAILURE_MODE_KEYS = Object.keys(FAILURE_MODES) as FailureMode[]

export interface BadgeStyle {
  label: string
  tone: 'critical' | 'warning' | 'normal' | 'info' | 'neutral'
}

export const SEVERITY: Record<EventSeverity, BadgeStyle> = {
  critical: { label: '위험', tone: 'critical' },
  warning: { label: '주의', tone: 'warning' },
  info: { label: '알림', tone: 'info' },
}

export const EQUIPMENT_STATUS: Record<EquipmentStatus, BadgeStyle> = {
  critical: { label: '위험', tone: 'critical' },
  warning: { label: '주의', tone: 'warning' },
  normal: { label: '정상', tone: 'normal' },
}

export const EVENT_STATUS: Record<EventStatus, BadgeStyle> = {
  pending: { label: '분석 대기', tone: 'warning' },
  analyzing: { label: '분석 중', tone: 'info' },
  done: { label: '분석 완료', tone: 'normal' },
  reported: { label: '보고서 작성', tone: 'neutral' },
}
