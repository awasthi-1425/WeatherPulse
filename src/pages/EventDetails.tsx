import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { WeatherEvent, SourceReport, VerificationEntry, Alert } from '../lib/types'
import { formatDateTime, formatTime } from '../lib/utils'
import { StatusBadge, SeverityBadge } from '../components/Badges'
import IndiaMap from '../components/IndiaMap'

export default function EventDetails() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<WeatherEvent | null>(null)
  const [reports, setReports] = useState<SourceReport[]>([])
  const [history, setHistory] = useState<VerificationEntry[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      supabase.from('events').select('*').eq('id', id).maybeSingle(),
      supabase.from('reports').select('*').eq('event_id', id).order('reported_at', { ascending: true }),
      supabase.from('verification_history').select('*').eq('event_id', id).order('occurred_at', { ascending: true }),
      supabase.from('alerts').select('*').eq('event_id', id).order('issued_at', { ascending: false }),
    ]).then(([evtRes, rptRes, histRes, altRes]) => {
      if (evtRes.data) setEvent(evtRes.data as WeatherEvent)
      if (rptRes.data) setReports(rptRes.data as SourceReport[])
      if (histRes.data) setHistory(histRes.data as VerificationEntry[])
      if (altRes.data) setAlerts(altRes.data as Alert[])
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div>Loading event...</div></div>
  }

  if (!event) {
    return (
      <div className="page-container">
        <div className="empty-state">Event not found.</div>
        <div style={{ textAlign: 'center' }}><Link to="/events"><button className="btn btn-sm">Back to Events</button></Link></div>
      </div>
    )
  }

  const evidenceItems = [
    { label: 'Location Consistency', value: event.evidence_location },
    { label: 'Temporal Consistency', value: event.evidence_temporal },
    { label: 'IMD Correlation', value: event.evidence_imd },
    { label: 'Source Consistency', value: event.evidence_sources },
    { label: 'Media Verification', value: event.evidence_media },
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="breadcrumb"><Link to="/dashboard">Dashboard</Link> / <Link to="/events">Events</Link> / {event.event_id}</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="page-title">{event.event_type}</div>
            <div className="page-subtitle">{event.city}, {event.state}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <StatusBadge status={event.status} />
            <SeverityBadge severity={event.severity} />
          </div>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
        <div className="stat-box">
          <div className="stat-label">Confidence</div>
          <div className="stat-value blue">{event.confidence}%</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Source Reports</div>
          <div className="stat-value">{event.source_count}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Independent Reports</div>
          <div className="stat-value">{event.independent_reports}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Duplicates</div>
          <div className="stat-value">{event.source_count - event.independent_reports}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">IMD Correlation</div>
          <div className="stat-value" style={{ fontSize: 16 }}>{event.imd_correlation}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Source Reliability</div>
          <div className="stat-value" style={{ fontSize: 16 }}>{event.source_reliability}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="panel">
          <div className="panel-header">Event Information</div>
          <div className="panel-body">
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Location</div>
                <div className="detail-value">{event.city}, {event.state}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Detected Time</div>
                <div className="detail-value">{formatDateTime(event.detected_at)}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Severity</div>
                <div className="detail-value"><SeverityBadge severity={event.severity} /></div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Source Count</div>
                <div className="detail-value">{event.source_count}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Independent Reports</div>
                <div className="detail-value">{event.independent_reports}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Coordinates</div>
                <div className="detail-value" style={{ fontFamily: 'monospace', fontSize: 13 }}>{event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}</div>
              </div>
            </div>
            {event.description && (
              <>
                <div className="divider" />
                <div className="section-label">Description</div>
                <div style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6 }}>{event.description}</div>
              </>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">Evidence Summary</div>
          <div className="panel-body">
            {evidenceItems.map((item) => {
              const color = item.value >= 80 ? '#16a34a' : item.value >= 60 ? '#d97706' : item.value >= 40 ? '#ea580c' : '#dc2626'
              return (
                <div className="evidence-row" key={item.label}>
                  <span className="evidence-label">{item.label}</span>
                  <div className="evidence-bar">
                    <div className="evidence-bar-fill" style={{ width: `${item.value}%`, background: color }} />
                  </div>
                  <span className="evidence-value">{item.value}%</span>
                </div>
              )
            })}
            <div className="divider" />
            <div className="evidence-row">
              <span className="evidence-label">IMD Correlation</span>
              <span className="evidence-value" style={{ width: 'auto', fontSize: 13 }}>{event.imd_correlation}</span>
            </div>
            <div className="evidence-row">
              <span className="evidence-label">Source Reliability</span>
              <span className="evidence-value" style={{ width: 'auto', fontSize: 13 }}>{event.source_reliability}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-header">Location Map</div>
        <div style={{ padding: 12 }}>
          <IndiaMap events={[event]} height={300} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="panel">
          <div className="panel-header">
            Source Reports
            <span style={{ fontSize: 11, fontWeight: 400, color: '#9ca3af' }}>{reports.length} reports</span>
          </div>
          {reports.length === 0 ? (
            <div className="empty-state">No source reports linked to this event.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Source</th>
                  <th>Location</th>
                  <th>Time</th>
                  <th>Conf.</th>
                  <th>Duplicate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 600, color: '#1e3a5f' }}>{r.report_id}</td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 12 }}>{r.source_name}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{r.source_type}</div>
                    </td>
                    <td style={{ fontSize: 12 }}>{r.location || '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{formatTime(r.reported_at)}</td>
                    <td style={{ fontWeight: 600 }}>{r.confidence}%</td>
                    <td>{r.is_duplicate ? <span className="badge badge-pending">Yes</span> : <span style={{ color: '#9ca3af', fontSize: 12 }}>No</span>}</td>
                    <td>
                      <span className={`badge ${r.status === 'Verified' ? 'badge-verified' : r.status === 'Duplicate' ? 'badge-pending' : r.status === 'Suspicious' ? 'badge-suspicious' : 'badge-review'}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="panel">
          <div className="panel-header">Verification History</div>
          <div className="panel-body">
            {history.length === 0 ? (
              <div className="empty-state">No verification activity recorded.</div>
            ) : (
              <div className="timeline">
                {history.map((h) => (
                  <div className="timeline-item" key={h.id}>
                    <div className="timeline-dot" />
                    <div className="timeline-time">{formatTime(h.occurred_at)}</div>
                    <div className="timeline-action">{h.action}</div>
                    {h.description && <div className="timeline-desc">{h.description}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel-header">Active Alerts</div>
          <div className="panel-body">
            {alerts.map((a) => (
              <div key={a.id} style={{ padding: '10px 12px', background: a.severity === 'Severe' ? '#fef2f2' : a.severity === 'High' ? '#fff7ed' : '#fffbeb', border: `1px solid ${a.severity === 'Severe' ? '#fecaca' : a.severity === 'High' ? '#fed7aa' : '#fde68a'}`, borderRadius: 4, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#1f2937' }}>{a.alert_type}</span>
                  <SeverityBadge severity={a.severity} />
                </div>
                <div style={{ fontSize: 12, color: '#4b5563' }}>{a.message}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Issued: {formatDateTime(a.issued_at)} · {a.state}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', paddingBottom: 20 }}>
        <Link to="/events"><button className="btn btn-sm">Back to Events</button></Link>
      </div>
    </div>
  )
}
