-- Rapid Crisis Response System Migration

-- ENUM for emergency severity
CREATE TYPE emergency_severity AS ENUM ('critical', 'warning');

-- ENUM for trigger type
CREATE TYPE emergency_trigger_type AS ENUM ('auto', 'manual');

-- ENUM for emergency status
CREATE TYPE emergency_status AS ENUM ('alert_triggered', 'doctor_assigned', 'nurse_en_route', 'treatment_started', 'resolved');

-- Table: emergencies
CREATE TABLE emergencies (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    triggered_by INTEGER REFERENCES staff(id), -- Null if auto-triggered
    trigger_type emergency_trigger_type NOT NULL,
    severity emergency_severity NOT NULL DEFAULT 'critical',
    status emergency_status NOT NULL DEFAULT 'alert_triggered',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Table: emergency_events (timeline)
CREATE TABLE emergency_events (
    id SERIAL PRIMARY KEY,
    emergency_id INTEGER NOT NULL REFERENCES emergencies(id),
    event_type VARCHAR(50) NOT NULL, -- e.g., 'triggered', 'acknowledged', 'assigned', 'status_change', 'resolved'
    actor_id INTEGER REFERENCES staff(id),
    actor_role VARCHAR(50),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: emergency_notifications
CREATE TABLE emergency_notifications (
    id SERIAL PRIMARY KEY,
    emergency_id INTEGER NOT NULL REFERENCES emergencies(id),
    recipient_id INTEGER NOT NULL REFERENCES staff(id),
    delivered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_emergencies_status ON emergencies(status);
CREATE INDEX idx_emergencies_patient_id ON emergencies(patient_id);
CREATE INDEX idx_emergency_events_emergency_id ON emergency_events(emergency_id);
CREATE INDEX idx_emergency_notifications_recipient_id ON emergency_notifications(recipient_id);
