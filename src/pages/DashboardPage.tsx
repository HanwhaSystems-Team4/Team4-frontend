import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { getDashboard } from '../api/client'
import type { DashboardResponse } from '../api/types'
import { DailyChart } from '../components/dashboard/DailyChart'
import { EquipmentList } from '../components/dashboard/EquipmentList'
import { EventTable } from '../components/dashboard/EventTable'
import { KpiCards } from '../components/dashboard/KpiCards'
import { ModeTabs, type ModeFilter } from '../components/dashboard/ModeTabs'
import { MenuIcon, RefreshIcon } from '../components/icons'
import type { LayoutContext } from '../components/layout/AppLayout'
import { FAILURE_MODE_KEYS, FAILURE_MODES } from '../constants/labels'
import { formatDateTime } from '../utils/format'

const PERIODS = [7, 14, 30]

export default function DashboardPage() {
  const { openMenu } = useOutletContext<LayoutContext>()
  const [days, setDays] = useState(14)
  const [mode, setMode] = useState<ModeFilter>('ALL')
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false // 기간을 빠르게 바꿀 때 이전 응답이 덮어쓰지 않도록
    getDashboard(days)
      .then((res) => {
        if (cancelled) return
        setData(res)
        setError(null)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : '데이터를 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [days, reloadKey])

  const changePeriod = (d: number) => {
    if (d === days) return
    setLoading(true)
    setDays(d)
  }

  const reload = () => {
    setLoading(true)
    setReloadKey((k) => k + 1)
  }

  const modeCounts = useMemo(() => {
    const counts = { ALL: 0, TWF: 0, HDF: 0, PWF: 0, OSF: 0 } as Record<ModeFilter, number>
    data?.daily.forEach((d) =>
      FAILURE_MODE_KEYS.forEach((m) => {
        counts[m] += d.counts[m]
        counts.ALL += d.counts[m]
      }),
    )
    return counts
  }, [data])

  const chartModes = mode === 'ALL' ? FAILURE_MODE_KEYS : [mode]
  const events = data ? data.events.filter((e) => mode === 'ALL' || e.failureMode === mode) : []

  return (
    <>
      <header className="page-head">
        <button type="button" className="menu-btn" aria-label="메뉴 열기" aria-controls="sidebar" onClick={openMenu}>
          <MenuIcon />
        </button>
        <div className="page-title">
          <h1>대시보드</h1>
          <p className="muted">
            {data ? `최근 ${days}일 · ${formatDateTime(data.generatedAt)} 기준` : '불러오는 중…'}
          </p>
        </div>
        <div className="page-actions">
          <div className="segmented" role="group" aria-label="조회 기간">
            {PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                className={p === days ? 'is-active' : undefined}
                aria-pressed={p === days}
                onClick={() => changePeriod(p)}
              >
                {p}일
              </button>
            ))}
          </div>
          <button type="button" className="btn" onClick={reload} disabled={loading}>
            <RefreshIcon className="icon" />
            새로고침
          </button>
        </div>
      </header>

      {error && (
        <p className="load-error" role="alert">
          {error}
        </p>
      )}

      {data && (
        <>
          <KpiCards summary={data.summary} days={days} />

          <ModeTabs value={mode} counts={modeCounts} onChange={setMode} />

          <section className="card" aria-labelledby="chart-title">
            <div className="card-head">
              <div>
                <h2 id="chart-title">일별 이상 발생 건수</h2>
                <p className="muted">
                  기간 합계 <b className="num">{modeCounts[mode]}건</b>
                </p>
              </div>
              <ul className="legend">
                {chartModes.map((m) => (
                  <li key={m}>
                    <span className="dot" style={{ background: FAILURE_MODES[m].color }} />
                    {FAILURE_MODES[m].label}
                  </li>
                ))}
              </ul>
            </div>
            <DailyChart daily={data.daily} modes={chartModes} />
          </section>

          <div className="grid-2">
            <EquipmentList equipment={data.equipment} />
            <EventTable events={events} equipment={data.equipment} />
          </div>
        </>
      )}

      <p className="data-note">
        설비 ID·센서 값은 UCI AI4I 2020 데이터셋 기준이며, 알람 코드·이벤트 시각·처리 상태는 백엔드 연동 전 Mock 데이터입니다.
      </p>
    </>
  )
}
