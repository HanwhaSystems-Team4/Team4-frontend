import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { login as apiLogin } from '../api/client'
import type { LoginResponse, User } from '../api/types'

const STORAGE_KEY = 'team4.session'

function loadSession(): LoginResponse | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as LoginResponse) : null
  } catch {
    return null
  }
}

function saveSession(session: LoginResponse | null) {
  try {
    if (session) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    else sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* 저장 불가 환경(시크릿 모드 등)에서는 메모리 상태만 사용 */
  }
}

interface AuthContextValue {
  user: User | null
  login: (id: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<LoginResponse | null>(loadSession)

  const login = useCallback(async (id: string, password: string) => {
    const next = await apiLogin(id, password)
    saveSession(next)
    setSession(next)
  }, [])

  const logout = useCallback(() => {
    saveSession(null)
    setSession(null)
  }, [])

  const value = useMemo(() => ({ user: session?.user ?? null, login, logout }), [session, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth는 AuthProvider 안에서만 사용할 수 있습니다.')
  return ctx
}
