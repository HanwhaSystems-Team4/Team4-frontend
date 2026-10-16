import { useEffect, useState, type ComponentType, type SVGProps } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import {
  AlertIcon,
  DashboardIcon,
  HistoryIcon,
  LogoIcon,
  MachineIcon,
  ReportIcon,
  SearchIcon,
} from '../icons'
import '../../styles/dashboard.css'

interface NavItem {
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  /** 없으면 아직 준비 중인 메뉴 */
  to?: string
}

const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: '모니터링',
    items: [
      { label: '대시보드', icon: DashboardIcon, to: '/dashboard' },
      { label: '이상 이벤트', icon: AlertIcon },
      { label: '설비 현황', icon: MachineIcon },
    ],
  },
  {
    group: '분석 · 보고',
    items: [
      { label: '원인 분석', icon: SearchIcon },
      { label: '정비 이력', icon: HistoryIcon },
      { label: '정비 보고서', icon: ReportIcon },
    ],
  },
]

/** 페이지에서 모바일 메뉴 버튼을 열 때 쓰는 Outlet context */
export interface LayoutContext {
  openMenu: () => void
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app">
      <aside className={`sidebar${menuOpen ? ' is-open' : ''}`} id="sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark">
            <LogoIcon width={18} height={18} />
          </span>
          <div>
            <div className="brand-name">설비 이상 대응 Agent</div>
            <div className="brand-sub">Team 4</div>
          </div>
        </div>

        <nav className="nav" aria-label="주 메뉴">
          {NAV.map((section) => (
            <div key={section.group}>
              <p className="nav-group">{section.group}</p>
              {section.items.map(({ label, icon: Icon, to }) =>
                to ? (
                  <NavLink key={label} to={to} onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}>
                    <Icon />
                    {label}
                  </NavLink>
                ) : (
                  <span key={label} className="nav-item" aria-disabled="true">
                    <Icon />
                    {label}
                    <span className="soon">준비 중</span>
                  </span>
                ),
              )}
            </div>
          ))}
        </nav>

        {user && (
          <div className="sidebar-user">
            <div className="avatar" aria-hidden="true">
              {user.name.slice(0, 1)}
            </div>
            <div className="user-meta">
              <div className="user-name">{user.name}</div>
              <div className="user-id">{user.id}</div>
            </div>
            <button type="button" className="btn btn-sm" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        )}
      </aside>

      {menuOpen && <div className="sidebar-backdrop" onClick={() => setMenuOpen(false)} />}

      <main className="main">
        <Outlet context={{ openMenu: () => setMenuOpen(true) } satisfies LayoutContext} />
      </main>
    </div>
  )
}
