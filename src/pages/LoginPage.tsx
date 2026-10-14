import { useRef, useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { LogoIcon } from '../components/icons'
import '../styles/login.css'

type Field = 'id' | 'password'

export default function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<{ message: string; field?: Field } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const idRef = useRef<HTMLInputElement>(null)
  const pwRef = useRef<HTMLInputElement>(null)

  if (user) return <Navigate to="/dashboard" replace />

  const fail = (message: string, field: Field) => {
    setError({ message, field })
    const el = field === 'id' ? idRef.current : pwRef.current
    el?.focus()
    if (field === 'password') el?.select()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!id.trim()) return fail('아이디를 입력하세요.', 'id')
    if (!password) return fail('비밀번호를 입력하세요.', 'password')

    setSubmitting(true)
    setError(null)
    try {
      await login(id.trim(), password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setSubmitting(false)
      fail(err instanceof Error ? err.message : '로그인에 실패했습니다.', 'password')
    }
  }

  return (
    <div className="login-page">
      <main className="login-wrap">
        <div className="login-brand">
          <span className="brand-mark">
            <LogoIcon width={20} height={20} />
          </span>
          <span className="brand-name">설비 이상 대응 Agent</span>
        </div>

        <section className="login-card" aria-labelledby="login-title">
          <h1 id="login-title">로그인</h1>
          <p className="login-desc">설비 이상 분석과 정비 보고서를 확인하려면 로그인하세요.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="user-id">아이디</label>
              <input
                ref={idRef}
                id="user-id"
                type="text"
                autoComplete="username"
                autoFocus
                value={id}
                onChange={(e) => setId(e.target.value)}
                aria-invalid={error?.field === 'id' || undefined}
              />
            </div>

            <div className="field">
              <label htmlFor="user-pw">비밀번호</label>
              <div className="pw-wrap">
                <input
                  ref={pwRef}
                  id="user-pw"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={error?.field === 'password' || undefined}
                />
                <button
                  type="button"
                  className="pw-toggle"
                  aria-pressed={showPw}
                  aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}
                  onClick={() => setShowPw((v) => !v)}
                >
                  {showPw ? '숨기기' : '보기'}
                </button>
              </div>
            </div>

            {error && (
              <p className="form-error" role="alert">
                {error.message}
              </p>
            )}

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? '로그인 중…' : '로그인'}
            </button>
          </form>
        </section>

        <p className="login-foot">한화 내일 아카데미 캡스톤 디자인 · Team 4</p>
      </main>
    </div>
  )
}
