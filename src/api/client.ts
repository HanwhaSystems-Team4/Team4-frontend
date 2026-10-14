/*
 * API 계층
 * 백엔드 API 명세가 확정되기 전까지 Mock으로 응답한다.
 * .env.local에 VITE_USE_MOCK=false 를 두면 실제 백엔드를 호출한다.
 */
import { buildMockDashboard, TEMP_ACCOUNT } from './mock'
import type { DashboardResponse, LoginResponse } from './types'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export class ApiError extends Error {}

export async function login(id: string, password: string): Promise<LoginResponse> {
  if (!USE_MOCK) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password }),
    })
    if (!res.ok) throw new ApiError('아이디 또는 비밀번호가 올바르지 않습니다.')
    return res.json()
  }

  await delay(400)
  if (id !== TEMP_ACCOUNT.id || password !== TEMP_ACCOUNT.password) {
    throw new ApiError('아이디 또는 비밀번호가 올바르지 않습니다.')
  }
  return { token: 'mock-token', user: { id: TEMP_ACCOUNT.id, name: TEMP_ACCOUNT.name } }
}

export async function getDashboard(days: number): Promise<DashboardResponse> {
  if (!USE_MOCK) {
    const res = await fetch(`${BASE_URL}/dashboard?days=${days}`)
    if (!res.ok) throw new ApiError('대시보드 데이터를 불러오지 못했습니다.')
    return res.json()
  }

  await delay(250)
  return buildMockDashboard(days)
}
