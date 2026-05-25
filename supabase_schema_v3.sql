-- ================================================================
-- EKANTA CRM — Complete Supabase Setup SQL  (v3 — May 2025)
-- Run this in Supabase → SQL Editor on a FRESH project.
-- For an EXISTING project run migration_v3.sql instead.
-- ================================================================

-- ─── EXTENSIONS ──────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- TABLE 1: users
-- ================================================================
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
  id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT    NOT NULL,
  username    TEXT    UNIQUE NOT NULL,
  password    TEXT    NOT NULL,
  role        TEXT    NOT NULL CHECK (role IN ('CEO','Manager','CRE','Viewer')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default users
INSERT INTO users (name, username, password, role) VALUES
  ('Admin',       'admin',      'admin123', 'CEO'),
  ('Vinodhini',   'vinodhini',  'pass123',  'CRE'),
  ('Arjun Kumar', 'arjun',      'pass123',  'Manager');

-- ================================================================
-- TABLE 2: funnels  (main leads/deals table)
-- ================================================================
DROP TABLE IF EXISTS funnels CASCADE;
CREATE TABLE funnels (
  id                UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Contact info
  name              TEXT    NOT NULL,
  phone             TEXT,
  email             TEXT,
  city_region       TEXT,

  -- Classification
  enquiry_type      TEXT,
  funnel_type       TEXT,
  lead_source       TEXT    NOT NULL DEFAULT 'WhatsApp',

  -- Scheduling
  next_follow_up    DATE,

  -- Products  (stored as JSON array: [{desc, category, qty, price}])
  products          JSONB   NOT NULL DEFAULT '[]',

  -- Notes
  remarks           TEXT,
  delivery_details  TEXT,
  payment_terms     TEXT,

  -- Assignment
  created_by        TEXT    NOT NULL DEFAULT 'admin',
  assigned_to       TEXT,

  -- Order / Quote
  order_number      TEXT,
  quote_qty         NUMERIC,
  quote_amount      NUMERIC CHECK (quote_amount IS NULL OR quote_amount >= 0),
  quote_desc        TEXT,

  -- Status
  status            TEXT    NOT NULL DEFAULT 'Pending'
                    CHECK (status IN ('Pending','Won','Lost','Drop')),
  lost_drop_reason  TEXT,

  -- Won proof (URL to image in Supabase Storage)
  won_proof_url     TEXT,

  -- Flags
  is_existing       BOOLEAN NOT NULL DEFAULT FALSE,

  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE 3: followup_logs
-- ================================================================
DROP TABLE IF EXISTS followup_logs CASCADE;
CREATE TABLE followup_logs (
  id                UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  funnel_id         UUID    NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
  logged_by         TEXT    NOT NULL,
  follow_up_date    DATE,
  customer_response TEXT,
  outcome           TEXT    CHECK (outcome IN (
                      'Interested','Needs Time','Callback Requested',
                      'Not Interested','Rescheduled','Order Confirmed','Other'
                    )),
  next_follow_up    DATE,
  logged_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE 4: audit_comments
-- ================================================================
DROP TABLE IF EXISTS audit_comments CASCADE;
CREATE TABLE audit_comments (
  id         UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  funnel_id  UUID    NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
  author     TEXT    NOT NULL,
  role       TEXT    NOT NULL,
  text       TEXT    NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- REALTIME  (enable live updates)
-- ================================================================
-- Drop existing publication entries before re-adding
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE funnels;
EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE users;
EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE audit_comments;
EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE followup_logs;
EXCEPTION WHEN others THEN NULL; END $$;

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnels        ENABLE ROW LEVEL SECURITY;
ALTER TABLE followup_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_comments ENABLE ROW LEVEL SECURITY;

-- Allow anon key (your frontend) to read & write everything.
-- This is required because the app uses username/password auth,
-- not Supabase Auth. For higher security, migrate to Supabase Auth.
CREATE POLICY "anon_all_users"    ON users          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_funnels"  ON funnels        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_followup" ON followup_logs  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_comments" ON audit_comments FOR ALL USING (true) WITH CHECK (true);

-- ================================================================
-- INDEXES  (performance)
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_funnels_status        ON funnels(status);
CREATE INDEX IF NOT EXISTS idx_funnels_created_at    ON funnels(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_funnels_assigned_to   ON funnels(assigned_to);
CREATE INDEX IF NOT EXISTS idx_funnels_next_followup ON funnels(next_follow_up);
CREATE INDEX IF NOT EXISTS idx_funnels_lead_source   ON funnels(lead_source);
CREATE INDEX IF NOT EXISTS idx_funnels_phone         ON funnels(phone);
CREATE INDEX IF NOT EXISTS idx_followup_funnel_id    ON followup_logs(funnel_id);
CREATE INDEX IF NOT EXISTS idx_followup_logged_at    ON followup_logs(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_funnel_id    ON audit_comments(funnel_id);


-- ================================================================
-- STORAGE BUCKET — Won Proof Images
-- ================================================================
-- Run these via Supabase Dashboard → Storage → New Bucket
-- OR paste into SQL Editor:

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ekanta-proofs',
  'ekanta-proofs',
  TRUE,             -- public: anyone with the URL can view
  10485760,         -- 10 MB max per file
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif','image/heic','image/heif']
)
ON CONFLICT (id) DO UPDATE SET
  public = TRUE,
  file_size_limit = 10485760;

-- Storage RLS — allow anon to upload and read
CREATE POLICY "anon_read_proofs"   ON storage.objects FOR SELECT USING (bucket_id = 'ekanta-proofs');
CREATE POLICY "anon_upload_proofs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ekanta-proofs');
CREATE POLICY "anon_update_proofs" ON storage.objects FOR UPDATE USING (bucket_id = 'ekanta-proofs');
CREATE POLICY "anon_delete_proofs" ON storage.objects FOR DELETE USING (bucket_id = 'ekanta-proofs');
