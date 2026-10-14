/* 화면에서 쓰는 선형 아이콘 (stroke = currentColor) */
import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

export const LogoIcon = (p: IconProps) => (
  <svg {...base} strokeWidth={2} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" />
  </svg>
)

export const DashboardIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </svg>
)

export const AlertIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
)

export const MachineIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="2" y="7" width="20" height="13" rx="2" />
    <path d="M7 7V4h10v3M7 13h4M15 13h2" />
  </svg>
)

export const SearchIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
)

export const HistoryIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5M12 7v5l3 2" />
  </svg>
)

export const ReportIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
    <path d="M14 2v6h6M8 13h8M8 17h5" />
  </svg>
)

export const RefreshIcon = (p: IconProps) => (
  <svg {...base} strokeWidth={2} {...p}>
    <path d="M21 12a9 9 0 1 1-2.6-6.4L21 8" />
    <path d="M21 3v5h-5" />
  </svg>
)

export const MenuIcon = (p: IconProps) => (
  <svg {...base} strokeWidth={2} {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

/** 설비 목록용 장비 그림 */
export const MachineIllustration = (p: IconProps) => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" aria-hidden {...p}>
    <rect x="9" y="10" width="30" height="24" rx="2" />
    <rect x="13" y="14" width="13" height="11" rx="1" fill="#fff" />
    <path d="M19.5 25v4M17 29h5" />
    <circle cx="33" cy="16" r="1.6" fill="currentColor" />
    <path d="M30 22h5M30 26h5" />
    <path d="M7 34h34M12 34v4M36 34v4" />
  </svg>
)
