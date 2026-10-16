import type { FailureMode } from '../../api/types'
import { FAILURE_MODE_KEYS, FAILURE_MODES } from '../../constants/labels'

export type ModeFilter = FailureMode | 'ALL'

interface Props {
  value: ModeFilter
  counts: Record<ModeFilter, number>
  onChange: (mode: ModeFilter) => void
}

export function ModeTabs({ value, counts, onChange }: Props) {
  const tabs: ModeFilter[] = ['ALL', ...FAILURE_MODE_KEYS]

  return (
    <div className="tabs" role="tablist" aria-label="고장 유형">
      {tabs.map((key) => (
        <button
          key={key}
          type="button"
          role="tab"
          className="tab"
          aria-selected={key === value}
          onClick={() => onChange(key)}
        >
          {key !== 'ALL' && <span className="dot" style={{ background: FAILURE_MODES[key].color }} />}
          {key === 'ALL' ? '전체' : `${FAILURE_MODES[key].label} (${key})`}
          <span className="count num">{counts[key]}</span>
        </button>
      ))}
    </div>
  )
}
