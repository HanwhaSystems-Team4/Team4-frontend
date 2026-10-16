import type { BadgeStyle } from '../constants/labels'

export function Badge({ style }: { style: BadgeStyle }) {
  return <span className={`badge badge-${style.tone}`}>{style.label}</span>
}
