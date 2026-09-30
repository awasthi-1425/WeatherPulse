/*
# WeatherPulse — National Weather Intelligence Platform Schema

1. Purpose
   Operational control-room software for an Indian government disaster-management
   department. It ingests weather event reports, classifies them, groups duplicates,
   verifies evidence, and presents a live monitoring dashboard with a GIS map,
   verification console, analytics, and alerts. This is a prototype with a simulated
   feed — no live social-media scraping or real IMD API connections.

2. New Tables
   - `events`  — detected weather events (one row per confirmed/grouped event)
     - id (uuid PK), event_id (human-readable code like EVT-10482), event_type,
       severity, status, confidence, state, city, latitude, longitude,
       description, detected_at, source_count, independent_reports,
       evidence_location, evidence_temporal, evidence_imd, evidence_sources,
       evidence_media, imd_correlation, source_reliability
   - `reports` — individual incoming source reports (some are duplicates of events)
     - id (uuid PK), report_id (human-readable code like RPT-3821), event_id (FK→events),
       source_type, source_name, location, state, city, latitude, longitude,
       reported_at, event_type, ai_classification, confidence, content,
       is_duplicate, status
   - `verification_history` — timeline entries for each event's verification process
     - id (uuid PK), event_id (FK→events), timestamp, action, description
   - `alerts` — active alerts issued for severe events
     - id (uuid PK), alert_id (human-readable), event_id (FK→events), alert_type,
       severity, state, message, issued_at, status

3. Security
   - Single-tenant prototype, no sign-in. RLS enabled on all tables.
   - Policies allow anon + authenticated full CRUD (data is intentionally shared
     operational data within the control-room prototype).
*/

-- ===== EVENTS =====
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  severity text NOT NULL DEFAULT 'Moderate',
  status text NOT NULL DEFAULT 'Under Review',
  confidence int NOT NULL DEFAULT 0,
  state text NOT NULL,
  city text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  description text,
  detected_at timestamptz NOT NULL DEFAULT now(),
  source_count int NOT NULL DEFAULT 1,
  independent_reports int NOT NULL DEFAULT 1,
  evidence_location int DEFAULT 0,
  evidence_temporal int DEFAULT 0,
  evidence_imd int DEFAULT 0,
  evidence_sources int DEFAULT 0,
  evidence_media int DEFAULT 0,
  imd_correlation text DEFAULT 'Pending',
  source_reliability text DEFAULT 'Medium'
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_events" ON events;
CREATE POLICY "anon_select_events" ON events FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_events" ON events;
CREATE POLICY "anon_insert_events" ON events FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_events" ON events;
CREATE POLICY "anon_update_events" ON events FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_events" ON events;
CREATE POLICY "anon_delete_events" ON events FOR DELETE TO anon, authenticated USING (true);

-- ===== REPORTS =====
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id text UNIQUE NOT NULL,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  source_type text NOT NULL,
  source_name text NOT NULL,
  location text,
  state text,
  city text,
  latitude double precision,
  longitude double precision,
  reported_at timestamptz NOT NULL DEFAULT now(),
  event_type text,
  ai_classification text,
  confidence int DEFAULT 0,
  content text,
  is_duplicate boolean DEFAULT false,
  status text DEFAULT 'Pending'
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_reports" ON reports;
CREATE POLICY "anon_select_reports" ON reports FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_reports" ON reports;
CREATE POLICY "anon_insert_reports" ON reports FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_reports" ON reports;
CREATE POLICY "anon_update_reports" ON reports FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_reports" ON reports;
CREATE POLICY "anon_delete_reports" ON reports FOR DELETE TO anon, authenticated USING (true);

-- ===== VERIFICATION HISTORY =====
CREATE TABLE IF NOT EXISTS verification_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  action text NOT NULL,
  description text
);

ALTER TABLE verification_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_vh" ON verification_history;
CREATE POLICY "anon_select_vh" ON verification_history FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_vh" ON verification_history;
CREATE POLICY "anon_insert_vh" ON verification_history FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_vh" ON verification_history;
CREATE POLICY "anon_update_vh" ON verification_history FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_vh" ON verification_history;
CREATE POLICY "anon_delete_vh" ON verification_history FOR DELETE TO anon, authenticated USING (true);

-- ===== ALERTS =====
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id text UNIQUE NOT NULL,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  severity text NOT NULL,
  state text NOT NULL,
  message text,
  issued_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'Active'
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_alerts" ON alerts;
CREATE POLICY "anon_select_alerts" ON alerts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_alerts" ON alerts;
CREATE POLICY "anon_insert_alerts" ON alerts FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_alerts" ON alerts;
CREATE POLICY "anon_update_alerts" ON alerts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_alerts" ON alerts;
CREATE POLICY "anon_delete_alerts" ON alerts FOR DELETE TO anon, authenticated USING (true);

-- ===== INDEXES =====
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_state ON events(state);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_reports_event ON reports(event_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_vh_event ON verification_history(event_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
