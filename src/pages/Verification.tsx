import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { SourceReport } from '../lib/types'
import { formatDateTime, formatTime } from '../lib/utils'
import ConfidenceBar from '../components/ConfidenceBar'

export default function Verification() {
  const [reports, setReports] = useState<SourceReport[]>([])
  const [selected, setSelected] = useState<SourceReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('Pending')
  const [acting, setActing] = useState(false)

  useEffect(() => {
    loadReports()
  }, [filter])

  const loadReports = () => {
    setLoading(true)
    let query = supabase.from('reports').select('*').order('reported_at', { ascending: false })
    if (filter === 'Pending') {
      query = query.in('status', ['Pending', 'Under Review'])
    } else if (filter === 'Suspicious') {
      query = query.eq('status', 'Suspicious')
    } else if (filter === 'Verified') {
      query = query.eq('status', 'Verified')
    } else if (filter === 'Duplicate') {
      query = query.eq('status', 'Duplicate')
    }
    query.then(({ data }) => {
      if (data) {
        setReports(data as SourceReport[])
        if (data.length > 0) setSelected(data[0] as SourceReport)
        else setSelected(null)
      }
      setLoading(false)
    })
  }

  const updateReportStatus = async (newStatus: string) => {
    if (!selected) return
    setActing(true)
    const { error } = await supabase.from('reports').update({ status: newStatus }).eq('id', selected.id)
    setActing(false)
    if (error) return
    const updated = { ...selected, status: newStatus }
    setSelected(updated)
    setReports((prev) => prev.map((r) => (r.id === selected.id ? updated : r)))
  }

  const statusBadgeClass = (status: string) => {
    if (status === 'Verified') return 'badge-verified'
    if (status === 'Duplicate') return 'badge-pending'
    if (status === 'Suspicious') return 'badge-suspicious'
    if (status === 'Rejected') return 'badge-suspicious'
    return 'badge-review'
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="breadcrumb"><Link to="/dashboard">Dashboard</Link> / Verification</div>
        <div className="page-title">Verification Console</div>
        <div className="page-subtitle">Review and verify incoming weather reports</div>
      </div>

      <div className="split-layout">
        <div className="panel">
          <div className="panel-header">
            Report Queue
            <select
              style={{ fontSize: 12, padding: '3px 6px', border: '1px solid #cbd5e1', borderRadius: 3 }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="Pending">Pending Review</option>
              <option value="Suspicious">Suspicious</option>
              <option value="Verified">Verified</option>
              <option value="Duplicate">Duplicates</option>
              <option value="All">All</option>
            </select>
          </div>
          {loading ? (
            <div className="loading-spinner"><div className="spinner"></div>Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="empty-state">No reports in this category.</div>
          ) : (
            <div style={{ maxHeight: 600, overflowY: 'auto' }}>
              {reports.map((r) => (
                <div
                  key={r.id}
                  className={`report-list-item ${selected?.id === r.id ? 'selected' : ''}`}
                  onClick={() => setSelected(r)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="rli-id">{r.report_id}</span>
                    <span className={`badge ${statusBadgeClass(r.status)}`} style={{ fontSize: 10 }}>{r.status}</span>
                  </div>
                  <div className="rli-meta">{r.event_type} · {r.city || 'Unknown'}, {r.state || ''}</div>
                  <div className="rli-meta">{r.source_type} · {formatTime(r.reported_at)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-header">Report Details</div>
          {!selected ? (
            <div className="empty-state">Select a report from the queue to view details.</div>
          ) : (
            <div className="panel-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#1e3a5f' }}>{selected.report_id}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{formatDateTime(selected.reported_at)}</div>
                </div>
                <span className={`badge ${statusBadgeClass(selected.status)}`}>{selected.status}</span>
              </div>

              <div className="detail-grid" style={{ marginBottom: 16 }}>
                <div className="detail-item">
                  <div className="detail-label">Source</div>
                  <div className="detail-value" style={{ fontSize: 13 }}>{selected.source_name}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{selected.source_type}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Location</div>
                  <div className="detail-value" style={{ fontSize: 13 }}>{selected.city || '—'}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{selected.state || ''}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Event Type</div>
                  <div className="detail-value" style={{ fontSize: 13 }}>{selected.event_type || '—'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">AI Classification</div>
                  <div className="detail-value" style={{ fontSize: 13 }}>{selected.ai_classification || '—'}</div>
                </div>
              </div>

              {selected.content && (
                <div style={{ marginBottom: 16 }}>
                  <div className="section-label">Report Content</div>
                  <div style={{ fontSize: 13, color: '#374151', padding: '8px 10px', background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 4 }}>
                    {selected.content}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <div className="section-label">Confidence Assessment</div>
                <ConfidenceBar value={selected.confidence} />
              </div>

              {selected.latitude && selected.longitude && (
                <div style={{ marginBottom: 16 }}>
                  <div className="section-label">Coordinates</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 13 }}>
                    {selected.latitude.toFixed(4)}, {selected.longitude.toFixed(4)}
                  </div>
                </div>
              )}

              <div className="divider" />

              <div className="section-label">Actions</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <button className="btn btn-success btn-sm" disabled={acting} onClick={() => updateReportStatus('Verified')}>Verify</button>
                <button className="btn btn-warning btn-sm" disabled={acting} onClick={() => updateReportStatus('Suspicious')}>Mark Suspicious</button>
                <button className="btn btn-danger btn-sm" disabled={acting} onClick={() => updateReportStatus('Rejected')}>Reject</button>
                <button className="btn btn-sm" disabled={acting} onClick={() => updateReportStatus('Under Review')}>Request Evidence</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
