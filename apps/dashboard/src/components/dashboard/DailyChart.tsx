import { useLayoutEffect, useRef, useState } from 'react'
import type { DailyCount, FailureMode } from '../../api/types'
import { FAILURE_MODES } from '../../constants/labels'
import { formatMonthDay } from '../../utils/format'

interface Props {
  daily: DailyCount[]
  modes: FailureMode[]
}

const HEIGHT = 240
const PAD = { top: 10, right: 4, bottom: 28, left: 32 }
const TIP_W = 160

/** 맨 위 조각만 위쪽 모서리를 둥글게 그린다 */
function roundedTop(x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, h, w / 2)
  return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`
}

/** 고장 유형별 일별 발생 건수 누적 막대 차트 */
export function DailyChart({ daily, modes }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [hover, setHover] = useState<number | null>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const w = Math.max(width, 280)
  const innerW = w - PAD.left - PAD.right
  const innerH = HEIGHT - PAD.top - PAD.bottom

  const totals = daily.map((d) => modes.reduce((a, m) => a + d.counts[m], 0))
  const rawMax = Math.max(1, ...totals)
  const step = rawMax <= 5 ? 1 : rawMax <= 10 ? 2 : 5
  const max = Math.ceil(rawMax / step) * step
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH

  const slot = innerW / daily.length
  const barW = Math.min(36, slot * 0.62)
  const labelEvery = Math.ceil(daily.length / Math.max(1, Math.floor(innerW / 48)))
  const ticks = Array.from({ length: max / step + 1 }, (_, i) => i * step)

  return (
    <div className="chart" ref={ref}>
      <svg viewBox={`0 0 ${w} ${HEIGHT}`} height={HEIGHT} role="img" aria-label="일별 이상 발생 건수 막대 차트">
        {ticks.map((v) => (
          <g key={v}>
            <line className="grid-line" x1={PAD.left} x2={w - PAD.right} y1={y(v)} y2={y(v)} />
            <text className="axis-label" x={PAD.left - 8} y={y(v) + 4} textAnchor="end">
              {v}
            </text>
          </g>
        ))}

        {daily.map((d, i) => {
          const cx = PAD.left + slot * i + slot / 2
          const x = cx - barW / 2
          let acc = 0
          return (
            <g key={d.date}>
              {modes.map((m, mi) => {
                const v = d.counts[m]
                if (!v) return null
                const y0 = y(acc)
                const y1 = y(acc + v)
                acc += v
                const h = Math.max(0, y0 - y1 - 1) // 조각 사이 1px 간격
                const isTop = modes.slice(mi + 1).every((n) => !d.counts[n])
                const fill = FAILURE_MODES[m].color
                return isTop ? (
                  <path key={m} d={roundedTop(x, y1, barW, h, 3)} fill={fill} />
                ) : (
                  <rect key={m} x={x} y={y1} width={barW} height={h} fill={fill} />
                )
              })}
              {(i % labelEvery === 0 || i === daily.length - 1) && (
                <text className="axis-label" x={cx} y={HEIGHT - 8} textAnchor="middle">
                  {formatMonthDay(d.date)}
                </text>
              )}
              <rect
                className="bar-hit"
                x={PAD.left + slot * i}
                y={PAD.top}
                width={slot}
                height={innerH}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
            </g>
          )
        })}
      </svg>

      {hover !== null && (
        <div
          className="chart-tip"
          style={{
            // 툴팁 폭(TIP_W)을 고정해 차트 밖으로 나가지 않게 한다
            left: Math.min(Math.max(PAD.left + slot * hover + slot / 2 - TIP_W / 2, 0), w - TIP_W),
            bottom: HEIGHT - y(totals[hover]) + 8,
            width: TIP_W,
          }}
        >
          <strong>
            {formatMonthDay(daily[hover].date).replace('/', '월 ')}일 · {totals[hover]}건
          </strong>
          {modes.map((m) => (
            <div key={m}>
              <span>{FAILURE_MODES[m].label}</span>
              <b className="num">{daily[hover].counts[m]}</b>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
