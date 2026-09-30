import type { EventStatus, Severity } from '../lib/types'

export function StatusBadge({ status }: { status: EventStatus }) {
  const cls = status === 'Verified' ? 'badge-verified'
    : status === 'Under Review' ? 'badge-review'
    : status === 'Suspicious' ? 'badge-suspicious'
    : 'badge-pending'
  return <span className={`badge ${cls}`}>{status}</span>
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const cls = severity === 'Low' ? 'badge-low'
    : severity === 'Moderate' ? 'badge-moderate'
    : severity === 'High' ? 'badge-high'
    : 'badge-severe'
  return <span className={`badge ${cls}`}>{severity}</span>
}
