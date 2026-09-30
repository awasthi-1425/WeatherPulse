import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { Link } from 'react-router-dom'
import type { WeatherEvent } from '../lib/types'
import { StatusBadge, SeverityBadge } from './Badges'

interface IndiaMapProps {
  events: WeatherEvent[]
  height?: number
}

export default function IndiaMap({ events, height = 480 }: IndiaMapProps) {
  const fillColor = (status: string) => {
    if (status === 'Verified') return '#16a34a'
    if (status === 'Under Review') return '#d97706'
    if (status === 'Suspicious') return '#dc2626'
    return '#9ca3af'
  }

  return (
    <div className="map-container" style={{ height }}>
      <MapContainer
        center={[22.5, 80]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
       <TileLayer
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  attribution='&copy; OpenStreetMap contributors'
/>
        {events.map((evt) => (
          <CircleMarker
            key={evt.id}
            center={[evt.latitude, evt.longitude]}
            radius={8}
            pathOptions={{
              color: '#fff',
              weight: 2,
              fillColor: fillColor(evt.status),
              fillOpacity: 0.85,
            }}
          >
            <Popup>
              <div className="leaflet-popup-content-title">{evt.event_type}</div>
              <div className="leaflet-popup-content-sub">{evt.city}, {evt.state}</div>
              <div className="popup-row">
                <span className="popup-label">Severity</span>
                <span className="popup-value"><SeverityBadge severity={evt.severity} /></span>
              </div>
              <div className="popup-row">
                <span className="popup-label">Confidence</span>
                <span className="popup-value">{evt.confidence}%</span>
              </div>
              <div className="popup-row">
                <span className="popup-label">Reports</span>
                <span className="popup-value">{evt.source_count}</span>
              </div>
              <div className="popup-row" style={{ marginBottom: 4 }}>
                <span className="popup-label">Status</span>
                <span className="popup-value"><StatusBadge status={evt.status} /></span>
              </div>
              <Link to={`/events/${evt.id}`} className="popup-btn">View Event</Link>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
