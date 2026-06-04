-- STEP 5 — Create Database Tables
-- Create ONLY these tables first.

-- stores
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_code TEXT,
    store_name TEXT,
    city TEXT
);

-- cameras
CREATE TABLE cameras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id),
    camera_code TEXT,
    camera_type TEXT
);

-- visitors
CREATE TABLE visitors (
    visitor_id TEXT PRIMARY KEY,
    store_id UUID REFERENCES stores(id),
    first_seen TIMESTAMP,
    last_seen TIMESTAMP,
    is_staff BOOLEAN DEFAULT FALSE
);

-- sessions
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id TEXT REFERENCES visitors(visitor_id),
    entry_time TIMESTAMP,
    exit_time TIMESTAMP,
    session_duration_seconds INTEGER,
    conversion_status BOOLEAN DEFAULT FALSE,
    basket_value_inr NUMERIC DEFAULT 0.0,
    correlated_transaction_id TEXT
);

-- events
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id TEXT REFERENCES visitors(visitor_id),
    event_type TEXT,
    timestamp TIMESTAMP,
    zone_id UUID, -- Keeping as UUID although we don't have a zones table in this phase
    confidence FLOAT,
    metadata JSONB
);

-- anomalies
CREATE TABLE anomalies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anomaly_type TEXT,
    severity TEXT,
    description TEXT,
    status TEXT
);

-- pos_transactions
CREATE TABLE pos_transactions (
    transaction_id TEXT PRIMARY KEY,
    store_code TEXT,
    timestamp TIMESTAMP,
    basket_value_inr NUMERIC,
    is_correlated BOOLEAN DEFAULT FALSE
);
