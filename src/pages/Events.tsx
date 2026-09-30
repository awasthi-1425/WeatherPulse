import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { WeatherEvent } from '../lib/types'
import { EVENT_TYPES, INDIAN_STATES } from '../lib/types'
import { formatDateTime } from '../lib/utils'
import { StatusBadge, SeverityBadge } from '../components/Badges'
import ConfidenceBar from '../components/ConfidenceBar'
import Pagination from '../components/Pagination'

export default function Events() {
  const [events, setEvents] = useState<WeatherEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [filters, setFilters] = useState({ type: '', state: '', status: '', severity: '' })
  const [applied, setApplied] = useState({ type: '', state: '', status: '', severity: '' })

  useEffect(() => {
    supabase.from('events').select('*').order('detected_at', { ascending: false }).then(({ data }) => {
      if (data) setEvents(data as WeatherEvent[])
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (applied.type && e.event_type !== applied.type) return false
      if (applied.state && e.state !== applied.state) return false
      if (applied.status && e.status !== applied.status) return false
      if (applied.severity && e.severity !== applied.severity) return false
      return true
    })
  }, [events, applied])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const applyFilters = () => { setApplied(filters); setPage(1) }
  const resetFilters = () => { setFilters({ type: '', state: '', status: '', severity: '' }); setApplied({ type: '', state: '', status: '', severity: '' }); setPage(1) }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="breadcrumb"><Link to="/dashboard">Dashboard</Link> / Events</div>
        <div className="page-title">Weather Events</div>
        <div className="page-subtitle">All detected and tracked weather events</div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-header">Filters</div>
        <div className="panel-body">
          <div className="filters-bar">
            <div className="filter-item">
              <label>Event Type</label>
              <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
                <option value="">All Types</option>
                {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="filter-item">
              <label>State</label>
              <select value={filters.state} onChange={(e) => setFilters({ ...filters, state: e.target.value })}>
                <option value="">All States</option>
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="filter-item">
              <label>Status</label>
              <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option value="">All Statuses</option>
                <option value="Verified">Verified</option>
                <option value="Under Review">Under Review</option>
                <option value="Suspicious">Suspicious</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div className="filter-item">
              <label>Severity</label>
              <select value={filters.severity} onChange={(e) => setFilters({ ...filters, severity: e.target.value })}>
                <option value="">All Severities</option>
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
                <option value="Severe">Severe</option>
              </select>
            </div>
            <div className="filter-actions">
              <button className="btn btn-primary btn-sm" onClick={applyFilters}>Apply Filters</button>
              <button className="btn btn-sm" onClick={resetFilters}>Reset</button>
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          Events
          <span style={{ fontSize: 11, fontWeight: 400, color: '#9ca3af' }}>{filtered.length} total</span>
        </div>
        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div>Loading events...</div>
        ) : paged.length === 0 ? (
          <div className="empty-state">No events match the current filters.</div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Event Type</th>
                  <th>Severity</th>
                  <th>Location</th>
                  <th>Detected</th>
                  <th>Sources</th>
                  <th>Independent</th>
                  <th>Confidence</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((evt) => (
                  <tr key={evt.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: '#1e3a5f' }}>{evt.event_id}</td>
                    <td style={{ fontWeight: 600 }}>{evt.event_type}</td>
                    <td><SeverityBadge severity={evt.severity} /></td>
                    <td>
                      <div>{evt.city}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{evt.state}</div>
                    </td>
                    <td style={{ fontSize: 12, color: '#6b7280' }}>{formatDateTime(evt.detected_at)}</td>
                    <td style={{ textAlign: 'center' }}>{evt.source_count}</td>
                    <td style={{ textAlign: 'center' }}>{evt.independent_reports}</td>
                    <td><ConfidenceBar value={evt.confidence} compact /></td>
                    <td><StatusBadge status={evt.status} /></td>
                    <td><Link to={`/events/${evt.id}`}><button className="btn btn-sm">View Details</button></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} totalPages={totalPages} total={filtered.length} pageSize={pageSize} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  )
}
