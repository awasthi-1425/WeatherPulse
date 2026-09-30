import { Outlet, NavLink, Link } from 'react-router-dom'

export default function Layout() {
  return (
    <div>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <span className="brand-mark">WP</span>
          WeatherPulse
        </Link>
        <div className="navbar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/events" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            Events
          </NavLink>
          <NavLink to="/reports" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            Reports
          </NavLink>
          <NavLink to="/verification" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            Verification
          </NavLink>
          <NavLink to="/analytics" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            Analytics
          </NavLink>
          <NavLink to="/alerts" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            Alerts
          </NavLink>
        </div>
        <div className="navbar-right">
          <div className="live-indicator">
            <span className="live-dot"></span>
            Demo Feed
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  )
}
