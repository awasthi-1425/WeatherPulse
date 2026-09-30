import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { WeatherEvent } from '../lib/types'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const PIE_COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#9ca3af', '#ea580c', '#0891b2', '#7c3aed', '#65a30d']

export default function Analytics() {
  const [events, setEvents] = useState<WeatherEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('events').select('*').order('detected_at', { ascending: true }).then(({ data }) => {
      if (data) setEvents(data as WeatherEvent[])
      setLoading(false)
    })
  }, [])

  const typeData = useMemo(() => {
    const counts: Record<string, number> = {}
    events.forEach((e) => { counts[e.event_type] = (counts[e.event_type] || 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [events])

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {}
    events.forEach((e) => { counts[e.status] = (counts[e.status] || 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [events])

  const stateData = useMemo(() => {
    const counts: Record<string, number> = {}
    events.forEach((e) => { counts[e.state] = (counts[e.state] || 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10)
  }, [events])

  const severityData = useMemo(() => {
    const counts: Record<string, number> = {}
    events.forEach((e) => { counts[e.severity] = (counts[e.severity] || 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [events])

  const avgConfidence = events.length > 0 ? Math.round(events.reduce((s, e) => s + e.confidence, 0) / events.length) : 0

  if (loading) {
    return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div>Loading analytics...</div></div>
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="breadcrumb"><Link to="/dashboard">Dashboard</Link> / Analytics</div>
        <div className="page-title">Analytics</div>
        <div className="page-subtitle">Weather event statistics and trends</div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <div className="stat-box">
          <div className="stat-label">Total Events</div>
          <div className="stat-value">{events.length}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Avg Confidence</div>
          <div className="stat-value blue">{avgConfidence}%</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Total Source Reports</div>
          <div className="stat-value">{events.reduce((s, e) => s + e.source_count, 0)}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">States Affected</div>
          <div className="stat-value">{new Set(events.map((e) => e.state)).size}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="panel">
          <div className="panel-header">Events by Type</div>
          <div className="panel-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={typeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} angle={-25} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4, border: '1px solid #e5e7eb' }} />
                <Bar dataKey="value" fill="#2563eb" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">Events by Status</div>
          <div className="panel-body">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`} labelLine={{ stroke: '#cbd5e1' }}>
                  {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4, border: '1px solid #e5e7eb' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="panel">
          <div className="panel-header">Events by State (Top 10)</div>
          <div className="panel-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stateData} layout="vertical" margin={{ top: 10, right: 20, left: 60, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} width={80} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4, border: '1px solid #e5e7eb' }} />
                <Bar dataKey="value" fill="#1e3a5f" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">Events by Severity</div>
          <div className="panel-body">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={severityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`} labelLine={{ stroke: '#cbd5e1' }}>
                  <Cell fill="#3b82f6" />
                  <Cell fill="#d97706" />
                  <Cell fill="#ea580c" />
                  <Cell fill="#dc2626" />
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4, border: '1px solid #e5e7eb' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">Confidence Trend by Event</div>
        <div className="panel-body">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={events.map((e) => ({ name: e.event_id, confidence: e.confidence }))} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} angle={-25} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} domain={[0, 100]} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4, border: '1px solid #e5e7eb' }} />
              <Line type="monotone" dataKey="confidence" stroke="#2563eb" strokeWidth={2} dot={{ r: 3, fill: '#2563eb' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
