interface ConfidenceBarProps {
  value: number
  showLabel?: boolean
  compact?: boolean
}

export default function ConfidenceBar({ value, showLabel = true, compact = false }: ConfidenceBarProps) {
  const color = value >= 80 ? '#16a34a' : value >= 60 ? '#d97706' : value >= 40 ? '#ea580c' : '#dc2626'
  const label = value >= 80 ? 'High' : value >= 60 ? 'Moderate' : value >= 40 ? 'Low' : 'Very Low'

  return (
    <div style={{ minWidth: compact ? 60 : 80 }}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{value}%</span>
          <span style={{ fontSize: 11, color: '#6b7280' }}>{label}</span>
        </div>
      )}
      <div className="confidence-bar">
        <div className="confidence-bar-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  )
}
