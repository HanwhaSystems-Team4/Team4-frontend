import type { DashboardSummary } from '../../api/types'

export function KpiCards({ summary, days }: { summary: DashboardSummary; days: number }) {
  const diff = summary.todayAnomalies - summary.yesterdayAnomalies

  return (
    <section className="kpis" aria-label="요약 지표">
      <article className="kpi">
        <h2>오늘 발생한 이상</h2>
        <p className="kpi-value num">
          {summary.todayAnomalies}
          <small>건</small>
        </p>
        <p className="kpi-help">
          {diff === 0 ? (
            '어제와 같음'
          ) : (
            <>
              어제보다{' '}
              <span className={diff > 0 ? 'delta-up' : 'delta-down'}>
                {diff > 0 ? '▲' : '▼'} {Math.abs(diff)}건
              </span>
            </>
          )}
        </p>
      </article>

      <article className="kpi">
        <h2>분석 대기·진행</h2>
        <p className="kpi-value num">
          {summary.pendingAnalyses}
          <small>건</small>
        </p>
        <p className="kpi-help">Agent 원인 분석이 끝나지 않은 이벤트</p>
      </article>

      <article className="kpi">
        <h2>주의 이상 설비</h2>
        <p className="kpi-value num">
          {summary.equipmentAtRisk}
          <small> / {summary.equipmentTotal}대</small>
        </p>
        <p className="kpi-help">위험 또는 주의 상태인 설비</p>
      </article>

      <article className="kpi">
        <h2>작성된 정비 보고서</h2>
        <p className="kpi-value num">
          {summary.reportsInPeriod}
          <small>건</small>
        </p>
        <p className="kpi-help">최근 {days}일 동안 생성된 초안</p>
      </article>
    </section>
  )
}
