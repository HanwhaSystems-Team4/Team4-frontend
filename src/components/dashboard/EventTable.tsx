import type { AnomalyEvent, Equipment } from '../../api/types'
import { EVENT_STATUS, FAILURE_MODES, SEVERITY } from '../../constants/labels'
import { formatAgo, formatDateTime } from '../../utils/format'
import { Badge } from '../Badge'

interface Props {
  events: AnomalyEvent[]
  equipment: Equipment[]
}

export function EventTable({ events, equipment }: Props) {
  const equipById = new Map(equipment.map((e) => [e.id, e]))

  return (
    <section className="card card-wide" aria-labelledby="events-title">
      <div className="card-head">
        <h2 id="events-title">최근 이상 이벤트</h2>
        <span className="muted">{events.length}건</span>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">발생 시각</th>
              <th scope="col">설비</th>
              <th scope="col">알람 / 내용</th>
              <th scope="col">심각도</th>
              <th scope="col">처리 상태</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty">
                  해당 유형의 최근 이벤트가 없습니다.
                </td>
              </tr>
            ) : (
              events.map((e) => {
                const mode = FAILURE_MODES[e.failureMode]
                return (
                  <tr key={e.id}>
                    <td className="cell-time num">
                      {formatDateTime(e.occurredAt)}
                      <small>{formatAgo(e.occurredAt)}</small>
                    </td>
                    <td className="cell-equip">
                      {equipById.get(e.equipmentId)?.name ?? e.equipmentId}
                      <small>{e.equipmentId}</small>
                    </td>
                    <td>
                      <span className="alarm-code">
                        <span className="dot" style={{ background: mode.color }} />
                        {e.alarmCode}
                      </span>
                      <span className="muted"> · {mode.label}</span>
                      <div className="alarm-msg">{e.message}</div>
                    </td>
                    <td>
                      <Badge style={SEVERITY[e.severity]} />
                    </td>
                    <td>
                      <Badge style={EVENT_STATUS[e.status]} />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
