import { Link } from 'react-router-dom'
import IndiaMap from '../components/IndiaMap'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { WeatherEvent } from '../lib/types'

export default function Landing() {
  const [events, setEvents] = useState<WeatherEvent[]>([])
  const [stats, setStats] = useState({ active: 0, verified: 0, review: 0, suspicious: 0 })

  useEffect(() => {
    supabase.from('events').select('*').then(({ data }) => {
      if (data) {
        setEvents(data as WeatherEvent[])
        setStats({
          active: data.length,
          verified: data.filter((e: WeatherEvent) => e.status === 'Verified').length,
          review: data.filter((e: WeatherEvent) => e.status === 'Under Review').length,
          suspicious: data.filter((e: WeatherEvent) => e.status === 'Suspicious').length,
        })
      }
    })
  }, [])

  return (
    <div>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <span className="brand-mark">WP</span>
          WeatherPulse
        </Link>
        <div className="navbar-nav">
          <Link to="/dashboard" className="navbar-link">Dashboard</Link>
          <Link to="/events" className="navbar-link">Events</Link>
          <Link to="/reports" className="navbar-link">Reports</Link>
          <Link to="/verification" className="navbar-link">Verification</Link>
          <Link to="/analytics" className="navbar-link">Analytics</Link>
          <Link to="/alerts" className="navbar-link">Alerts</Link>
        </div>
        <div className="navbar-right">
          <div className="live-indicator">
            <span className="live-dot"></span>
            Feed
          </div>
        </div>
      </nav>

      <div className="landing-hero">
        <h1>WeatherPulse</h1>
        <div className="hero-sub">National Weather Intelligence Platform</div>
        <p className="hero-desc">
          Operational monitoring system for weather event detection, evidence-based verification,
          and alert dissemination. Aggregates citizen reports, social media signals, and
          meteorological data to support disaster management decision-making.
        </p>
        <Link to="/dashboard">
          <button className="btn btn-primary" style={{ fontSize: 14, padding: '8px 24px' }}>
            Open Dashboard
          </button>
        </Link>
      </div>

      <div className="landing-section">
        <div className="stat-grid">
          <div className="stat-box">
            <div className="stat-label">Active Events</div>
            <div className="stat-value">{stats.active}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Verified</div>
            <div className="stat-value green">{stats.verified}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Under Review</div>
            <div className="stat-value amber">{stats.review}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Suspicious</div>
            <div className="stat-value red">{stats.suspicious}</div>
          </div>
        </div>
      </div>

      <div className="landing-section" style={{ paddingTop: 0 }}>
        <h2>System Architecture</h2>
        <div className="arch-flow">
          <div className="arch-step">
            <div className="arch-icon">●</div>
            Data Sources
          </div>
          <div className="arch-arrow">→</div>
          <div className="arch-step">
            <div className="arch-icon">●</div>
            Processing
          </div>
          <div className="arch-arrow">→</div>
          <div className="arch-step">
            <div className="arch-icon">●</div>
            Event Detection
          </div>
          <div className="arch-arrow">→</div>
          <div className="arch-step">
            <div className="arch-icon">●</div>
            Evidence Verification
          </div>
          <div className="arch-arrow">→</div>
          <div className="arch-step">
            <div className="arch-icon">●</div>
            Weather Intelligence
          </div>
        </div>
      </div>

      <div className="landing-section" style={{ paddingTop: 0 }}>
        <h2>Live Monitoring Preview</h2>
        <IndiaMap events={events} height={400} />
        <p style={{ textAlign: 'center', fontSize: 12, color: '#6b7280', marginTop: 8 }}>
          Simulated feed — showing prototype weather event data for nstration purposes.
        </p>
      </div>

      <div className="landing-section" style={{ paddingTop: 0, paddingBottom: 40 }}>
        <h2>Operational Modules</h2>
        <div className="detail-grid">
          <div className="panel">
            <div className="panel-header">Event Classification</div>
            <div className="panel-body" style={{ fontSize: 12, color: '#6b7280' }}>
              Automatic categorisation of incoming reports into weather event types with severity assessment.
            </div>
          </div>
          <div className="panel">
            <div className="panel-header">Duplicate Detection</div>
            <div className="panel-body" style={{ fontSize: 12, color: '#6b7280' }}>
              Groups redundant reports from multiple sources to identify independent confirmations.
            </div>
          </div>
          <div className="panel">
            <div className="panel-header">Evidence Analysis</div>
            <div className="panel-body" style={{ fontSize: 12, color: '#6b7280' }}>
              Evaluates location, temporal, and source consistency to compute a confidence score.
            </div>
          </div>
          <div className="panel">
            <div className="panel-header">Alert Dissemination</div>
            <div className="panel-body" style={{ fontSize: 12, color: '#6b7280' }}>
              Issues severity-based alerts for verified events requiring operational response.
            </div>
          </div>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid #e5e7eb', padding: '16px 24px', textAlign: 'center', fontSize: 12, color: '#9ca3af' }}>
        WeatherPulse — Prototype / Simulated Feed. Not connected to live IMD APIs or real-time government systems.
      </footer>
    </div>
  )
}
