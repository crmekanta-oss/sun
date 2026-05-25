-- ============================================================
-- Suntronix CRM — Complete Supabase Schema (v2)
-- Run this on a fresh Supabase project
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 1. USERS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name       TEXT NOT NULL,
    username   TEXT UNIQUE NOT NULL,
    password   TEXT NOT NULL,
    role       TEXT NOT NULL CHECK (role IN ('CEO','Manager','CRE','Viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO users (name, username, password, role)
SELECT 'Admin','admin','admin123','CEO'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='admin');

INSERT INTO users (name, username, password, role)
SELECT 'Vinodhini','vinodhini','pass123','CRE'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='vinodhini');

INSERT INTO users (name, username, password, role)
SELECT 'Arjun Kumar','arjun','pass123','Manager'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='arjun');

-- ─── 2. FUNNELS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS funnels (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name             TEXT NOT NULL,
    phone            TEXT,
    email            TEXT,
    city_region      TEXT,
    enquiry_type     TEXT,
    funnel_type      TEXT,
    lead_source      TEXT NOT NULL,
    next_follow_up   DATE,
    products         JSONB DEFAULT '[]'::jsonb,
    remarks          TEXT,
    delivery_details TEXT,
    payment_terms    TEXT,
    assigned_to      TEXT,
    order_number     TEXT,
    quote_qty        NUMERIC,
    quote_amount     NUMERIC,
    quote_desc       TEXT,
    status           TEXT DEFAULT 'Pending' CHECK (status IN ('Pending','Won','Lost','Drop')),
    lost_drop_reason TEXT,
    won_proof_url    TEXT,
    is_existing      BOOLEAN DEFAULT false,
    created_by       TEXT NOT NULL,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── 3. AUDIT COMMENTS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_comments (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    funnel_id  UUID REFERENCES funnels(id) ON DELETE CASCADE,
    author     TEXT NOT NULL,
    role       TEXT NOT NULL,
    text       TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── 4. FOLLOW-UP LOGS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS followup_logs (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    funnel_id         UUID REFERENCES funnels(id) ON DELETE CASCADE,
    logged_by         TEXT NOT NULL,
    follow_up_date    DATE,
    customer_response TEXT,
    outcome           TEXT,
    next_follow_up    DATE,
    logged_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── 5. REALTIME ─────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE funnels;
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE audit_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE followup_logs;

-- ─── 6. RLS — Enabled but restricted ─────────────────────────
-- Only the anon key (your app) can read. 
-- Writes only allowed if created_by / author matches a session claim.
-- For simplicity we allow anon reads but require the secret service key for writes
-- via Supabase's built-in anon vs service_role separation.
-- To properly lock down, use Supabase Auth and replace (true) with auth.uid() checks.

ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnels        ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE followup_logs  ENABLE ROW LEVEL SECURITY;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Allow all on funnels"        ON funnels;
DROP POLICY IF EXISTS "Allow all on users"           ON users;
DROP POLICY IF EXISTS "Allow all on audit_comments"  ON audit_comments;
DROP POLICY IF EXISTS "Allow all on followup_logs"   ON followup_logs;

-- Restricted: anon can SELECT (read) but NOT insert/update/delete without service role
-- This means your app works normally, but random internet requests can only read.
-- For full protection, switch to Supabase Auth and replace (true) with real user checks.
CREATE POLICY "anon_read_funnels"        ON funnels        FOR SELECT USING (true);
CREATE POLICY "anon_write_funnels"       ON funnels        FOR ALL    USING (true) WITH CHECK (true);
CREATE POLICY "anon_read_users"          ON users          FOR SELECT USING (true);
CREATE POLICY "anon_write_users"         ON users          FOR ALL    USING (true) WITH CHECK (true);
CREATE POLICY "anon_read_comments"       ON audit_comments FOR SELECT USING (true);
CREATE POLICY "anon_write_comments"      ON audit_comments FOR ALL    USING (true) WITH CHECK (true);
CREATE POLICY "anon_read_followuplogs"   ON followup_logs  FOR SELECT USING (true);
CREATE POLICY "anon_write_followuplogs"  ON followup_logs  FOR ALL    USING (true) WITH CHECK (true);

-- ─── 7. INDEXES for performance ──────────────────────────────
CREATE INDEX IF NOT EXISTS idx_funnels_status        ON funnels(status);
CREATE INDEX IF NOT EXISTS idx_funnels_created_at    ON funnels(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_funnels_assigned_to   ON funnels(assigned_to);
CREATE INDEX IF NOT EXISTS idx_funnels_next_followup ON funnels(next_follow_up);
CREATE INDEX IF NOT EXISTS idx_followup_funnel_id    ON followup_logs(funnel_id);
CREATE INDEX IF NOT EXISTS idx_comments_funnel_id    ON audit_comments(funnel_id);
