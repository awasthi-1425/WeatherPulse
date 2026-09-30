export type EventStatus = 'Verified' | 'Under Review' | 'Suspicious' | 'Pending'
export type Severity = 'Low' | 'Moderate' | 'High' | 'Severe'

export interface WeatherEvent {
  id: string
  event_id: string
  event_type: string
  severity: Severity
  status: EventStatus
  confidence: number
  state: string
  city: string
  latitude: number
  longitude: number
  description: string | null
  detected_at: string
  source_count: number
  independent_reports: number
  evidence_location: number
  evidence_temporal: number
  evidence_imd: number
  evidence_sources: number
  evidence_media: number
  imd_correlation: string
  source_reliability: string
}

export interface SourceReport {
  id: string
  report_id: string
  event_id: string | null
  source_type: string
  source_name: string
  location: string | null
  state: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  reported_at: string
  event_type: string | null
  ai_classification: string | null
  confidence: number
  content: string | null
  is_duplicate: boolean
  status: string
}

export interface VerificationEntry {
  id: string
  event_id: string
  occurred_at: string
  action: string
  description: string | null
}

export interface Alert {
  id: string
  alert_id: string
  event_id: string | null
  alert_type: string
  severity: Severity
  state: string
  message: string | null
  issued_at: string
  status: string
}

export const EVENT_TYPES = [
  'Heavy Rainfall',
  'Cyclone',
  'Flood',
  'Thunderstorm',
  'Heatwave',
  'Dust Storm',
  'Hailstorm',
  'Cloudburst',
  'Fog',
] as const

export const INDIAN_STATES = [
  'Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Gujarat','Haryana',
  'Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Odisha',
  'Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand',
  'West Bengal',
]
