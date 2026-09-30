import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { WeatherEvent } from '../lib/types'
import { EVENT_TYPES, INDIAN_STATES } from '../lib/types'
import { formatTime } from '../lib/utils'
import IndiaMap from '../components/IndiaMap'
import { StatusBadge, SeverityBadge } from '../components/Badges'
import ConfidenceBar from '../components/ConfidenceBar'
import Pagination from '../components/Pagination'

export default function Dashboard() {
  const [events, setEvents] = useState<WeatherEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const pageSize = 8

  const [filters, setFilters] = useState({ type: '', state: '', status: '', date: '' })
  const [applied, setApplied] = useState({ type: '', state: '', status: '', date: '' })

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
      if (applied.date) {
        const d = new Date(e.detected_at).toISOString().slice(0, 10)
        if (d !== applied.date) return false
      }
      return true
    })
  }, [events, applied])

  const stats = useMemo(() => ({
    active: events.length,
    verified: events.filter((e) => e.status === 'Verified').length,
    review: events.filter((e) => e.status === 'Under Review').length,
    suspicious: events.filter((e) => e.status === 'Suspicious').length,
  }), [events])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const applyFilters = () => { setApplied(filters); setPage(1) }
  const resetFilters = () => { setFilters({ type: '', state: '', status: '', date: '' }); setApplied({ type: '', state: '', status: '', date: '' }); setPage(1) }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="breadcrumb"><Link to="/dashboard">Dashboard</Link></div>
        <div className="page-title">Live Weather Monitoring</div>
        <div className="page-subtitle">Real-time weather event detection and verification overview</div>
      </div>

      <div className="stat-grid">
        <div className="stat-box">
          <div className="stat-label">Active Events</div>
          <div className="stat-value">{stats.active}</div>
          <div className="stat-sub">Total detected</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Verified</div>
          <div className="stat-value green">{stats.verified}</div>
          <div className="stat-sub">Confirmed events</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Under Review</div>
          <div className="stat-value amber">{stats.review}</div>
          <div className="stat-sub">Awaiting verification</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Suspicious</div>
          <div className="stat-value red">{stats.suspicious}</div>
          <div className="stat-sub">Flagged for rejection</div>
        </div>
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
              <label>Date</label>
              <input type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} />
            </div>
            <div className="filter-actions">
              <button className="btn btn-primary btn-sm" onClick={applyFilters}>Apply Filters</button>
              <button className="btn btn-sm" onClick={resetFilters}>Reset</button>
            </div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-header">
          India — Weather Event Map
          <span style={{ fontSize: 11, fontWeight: 400, color: '#9ca3af' }}>{filtered.length} events shown</span>
        </div>
        <div style={{ padding: 12 }}>
          {loading ? (
            <div className="loading-spinner"><div className="spinner"></div>Loading map...</div>
          ) : (
            <IndiaMap events={filtered} />
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">Recent Weather Events</div>
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
                  <th>Event</th>
                  <th>Location</th>
                  <th>Time</th>
                  <th>Confidence</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((evt) => (
                  <tr key={evt.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: '#1e3a5f' }}>{evt.event_id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{evt.event_type}</div>
                      <div style={{ marginTop: 2 }}><SeverityBadge severity={evt.severity} /></div>
                    </td>
                    <td>
                      <div>{evt.city}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{evt.state}</div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{formatTime(evt.detected_at)}</td>
                    <td><ConfidenceBar value={evt.confidence} compact /></td>
                    <td><StatusBadge status={evt.status} /></td>
                    <td><Link to={`/events/${evt.id}`}><button className="btn btn-sm">View</button></Link></td>
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
