import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { EVENT_TYPES, INDIAN_STATES, type SourceReport } from '../lib/types'
import { formatDateTime } from '../lib/utils'

export default function Reports() {
  const [form, setForm] = useState({
    eventType: '',
    state: '',
    city: '',
    description: '',
    latitude: '',
    longitude: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [recentReports, setRecentReports] = useState<SourceReport[]>([])

  useEffect(() => {
    supabase.from('reports').select('*').order('reported_at', { ascending: false }).limit(10).then(({ data }) => {
      if (data) setRecentReports(data as SourceReport[])
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.eventType || !form.state || !form.city) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' })
      return
    }
    setSubmitting(true)
    setMessage(null)

    const reportId = `RPT-${Math.floor(3900 + Math.random() * 999)}`
    const lat = form.latitude ? parseFloat(form.latitude) : null
    const lng = form.longitude ? parseFloat(form.longitude) : null

    const { error } = await supabase.from('reports').insert({
      report_id: reportId,
      source_type: 'Citizen Report',
      source_name: 'Public Submission',
      location: form.city,
      state: form.state,
      city: form.city,
      latitude: lat,
      longitude: lng,
      event_type: form.eventType,
      ai_classification: form.eventType,
      confidence: Math.floor(50 + Math.random() * 20),
      content: form.description,
      is_duplicate: false,
      status: 'Pending',
    })

    setSubmitting(false)
    if (error) {
      setMessage({ type: 'error', text: 'Submission failed. Please try again.' })
    } else {
      setMessage({ type: 'success', text: `Report submitted successfully. Report ID: ${reportId}. It will be reviewed by the verification team.` })
      setForm({ eventType: '', state: '', city: '', description: '', latitude: '', longitude: '' })
      supabase.from('reports').select('*').order('reported_at', { ascending: false }).limit(10).then(({ data }) => {
        if (data) setRecentReports(data as SourceReport[])
      })
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="breadcrumb"><Link to="/dashboard">Dashboard</Link> / Reports</div>
        <div className="page-title">Submit Weather Report</div>
        <div className="page-subtitle">Citizen weather event reporting form</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="panel">
          <div className="panel-header">Report Weather Event</div>
          <div className="panel-body">
            {message && (
              <div style={{
                padding: '8px 12px',
                marginBottom: 12,
                borderRadius: 4,
                fontSize: 13,
                background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                color: message.type === 'success' ? '#16a34a' : '#dc2626',
              }}>
                {message.text}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Event Type <span style={{ color: '#dc2626' }}>*</span></label>
                <select className="form-select" value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })} required>
                  <option value="">Select event type</option>
                  {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">State <span style={{ color: '#dc2626' }}>*</span></label>
                  <select className="form-select" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required>
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">City <span style={{ color: '#dc2626' }}>*</span></label>
                  <input className="form-input" type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Enter city" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the weather event..." />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Latitude</label>
                  <input className="form-input" type="text" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="e.g. 26.8467" />
                </div>
                <div className="form-group">
                  <label className="form-label">Longitude</label>
                  <input className="form-input" type="text" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="e.g. 80.9462" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Photo</label>
                <input className="form-input" type="file" accept="image/*" disabled style={{ padding: '5px' }} />
                <div className="form-hint">Photo upload is not available in this prototype.</div>
              </div>
              <div className="form-group">
                <label className="form-label">Video</label>
                <input className="form-input" type="file" accept="video/*" disabled style={{ padding: '5px' }} />
                <div className="form-hint">Video upload is not available in this prototype.</div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">Recent Reports</div>
          {recentReports.length === 0 ? (
            <div className="empty-state">No reports submitted yet.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Event Type</th>
                  <th>Location</th>
                  <th>Source</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 600, color: '#1e3a5f' }}>{r.report_id}</td>
                    <td style={{ fontWeight: 600, fontSize: 12 }}>{r.event_type || '—'}</td>
                    <td style={{ fontSize: 12 }}>{r.city || '—'}<div style={{ fontSize: 11, color: '#9ca3af' }}>{r.state || ''}</div></td>
                    <td style={{ fontSize: 12 }}>{r.source_name}</td>
                    <td style={{ fontSize: 11, color: '#6b7280' }}>{formatDateTime(r.reported_at)}</td>
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
      </div>
    </div>
  )
}
