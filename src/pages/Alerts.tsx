import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Alert } from '../lib/types'
import { formatDateTime } from '../lib/utils'
import { SeverityBadge } from '../components/Badges'

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    supabase.from('alerts').select('*').order('issued_at', { ascending: false }).then(({ data }) => {
      if (data) setAlerts(data as Alert[])
      setLoading(false)
    })
  }, [])

  const filtered = filter === 'All' ? alerts : alerts.filter((a) => a.severity === filter)

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="breadcrumb"><Link to="/dashboard">Dashboard</Link> / Alerts</div>
        <div className="page-title">Active Alerts</div>
        <div className="page-subtitle">Issued weather alerts and advisories</div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <div className="stat-box">
          <div className="stat-label">Total Alerts</div>
          <div className="stat-value">{alerts.length}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Severe</div>
          <div className="stat-value red">{alerts.filter((a) => a.severity === 'Severe').length}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">High</div>
          <div className="stat-value amber">{alerts.filter((a) => a.severity === 'High').length}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Moderate</div>
          <div className="stat-value blue">{alerts.filter((a) => a.severity === 'Moderate').length}</div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-header">Filters</div>
        <div className="panel-body">
          <div className="filters-bar">
            <div className="filter-item">
              <label>Severity</label>
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="All">All Severities</option>
                <option value="Severe">Severe</option>
                <option value="High">High</option>
                <option value="Moderate">Moderate</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          Alerts
          <span style={{ fontSize: 11, fontWeight: 400, color: '#9ca3af' }}>{filtered.length} alerts</span>
        </div>
        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div>Loading alerts...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">No alerts match the current filter.</div>
        ) : (
          <div className="panel-body" style={{ padding: 12 }}>
            {filtered.map((a) => {
              const bg = a.severity === 'Severe' ? '#fef2f2' : a.severity === 'High' ? '#fff7ed' : a.severity === 'Moderate' ? '#fffbeb' : '#eff6ff'
              const border = a.severity === 'Severe' ? '#fecaca' : a.severity === 'High' ? '#fed7aa' : a.severity === 'Moderate' ? '#fde68a' : '#bfdbfe'
              return (
                <div key={a.id} style={{ padding: '12px 14px', background: bg, border: `1px solid ${border}`, borderRadius: 4, marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#1e3a5f' }}>{a.alert_id}</span>
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#1f2937' }}>{a.alert_type}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <SeverityBadge severity={a.severity} />
                      <span className="badge badge-active">{a.status}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: '#374151', marginBottom: 6 }}>{a.message}</div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#9ca3af' }}>
                    <span>State: {a.state}</span>
                    <span>Issued: {formatDateTime(a.issued_at)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
