-- ================================================================
-- EKANTA CRM — Migration v3  (for EXISTING Supabase projects)
-- Safe to run multiple times. Does not delete existing data.
-- ================================================================

-- ─── Add missing columns to funnels ──────────────────────────────
DO $$ BEGIN
  -- Rename old column names if coming from v1 schema
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funnels' AND column_name='contact')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funnels' AND column_name='name') THEN
    ALTER TABLE funnels RENAME COLUMN contact TO name;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funnels' AND column_name='quote_no')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funnels' AND column_name='order_number') THEN
    ALTER TABLE funnels RENAME COLUMN quote_no TO order_number;
  END IF;

  -- Add missing columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funnels' AND column_name='assigned_to') THEN
    ALTER TABLE funnels ADD COLUMN assigned_to TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funnels' AND column_name='lost_drop_reason') THEN
    ALTER TABLE funnels ADD COLUMN lost_drop_reason TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funnels' AND column_name='won_proof_url') THEN
    ALTER TABLE funnels ADD COLUMN won_proof_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funnels' AND column_name='is_existing') THEN
    ALTER TABLE funnels ADD COLUMN is_existing BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funnels' AND column_name='order_number') THEN
    ALTER TABLE funnels ADD COLUMN order_number TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funnels' AND column_name='quote_desc') THEN
    ALTER TABLE funnels ADD COLUMN quote_desc TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funnels' AND column_name='delivery_details') THEN
    ALTER TABLE funnels ADD COLUMN delivery_details TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funnels' AND column_name='payment_terms') THEN
    ALTER TABLE funnels ADD COLUMN payment_terms TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funnels' AND column_name='city_region') THEN
    ALTER TABLE funnels ADD COLUMN city_region TEXT;
  END IF;

  -- Remove old unused columns
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funnels' AND column_name='stage') THEN
    ALTER TABLE funnels DROP COLUMN stage;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funnels' AND column_name='company') THEN
    ALTER TABLE funnels DROP COLUMN company;
  END IF;

  -- Make next_follow_up nullable
  ALTER TABLE funnels ALTER COLUMN next_follow_up DROP NOT NULL;

  -- Add quote_amount check if not exists
  BEGIN
    ALTER TABLE funnels ADD CONSTRAINT funnels_quote_amount_check CHECK (quote_amount IS NULL OR quote_amount >= 0);
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- ─── Create followup_logs if missing ─────────────────────────────
CREATE TABLE IF NOT EXISTS followup_logs (
  id                UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  funnel_id         UUID    NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
  logged_by         TEXT    NOT NULL,
  follow_up_date    DATE,
  customer_response TEXT,
  outcome           TEXT,
  next_follow_up    DATE,
  logged_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Realtime ─────────────────────────────────────────────────────
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE followup_logs; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE funnels; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE users; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE audit_comments; EXCEPTION WHEN others THEN NULL; END $$;

-- ─── RLS ──────────────────────────────────────────────────────────
ALTER TABLE followup_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on followup_logs" ON followup_logs;
DROP POLICY IF EXISTS "anon_read_followuplogs"     ON followup_logs;
DROP POLICY IF EXISTS "anon_write_followuplogs"    ON followup_logs;
DROP POLICY IF EXISTS "anon_all_followup"          ON followup_logs;
CREATE POLICY "anon_all_followup" ON followup_logs FOR ALL USING (true) WITH CHECK (true);

-- Recreate clean policies for all tables
DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow all on funnels"       ON funnels;
  DROP POLICY IF EXISTS "Allow all on users"          ON users;
  DROP POLICY IF EXISTS "Allow all on audit_comments" ON audit_comments;
  DROP POLICY IF EXISTS "anon_read_funnels"           ON funnels;
  DROP POLICY IF EXISTS "anon_write_funnels"          ON funnels;
  DROP POLICY IF EXISTS "anon_read_users"             ON users;
  DROP POLICY IF EXISTS "anon_write_users"            ON users;
  DROP POLICY IF EXISTS "anon_read_comments"          ON audit_comments;
  DROP POLICY IF EXISTS "anon_write_comments"         ON audit_comments;
  DROP POLICY IF EXISTS "anon_all_users"              ON users;
  DROP POLICY IF EXISTS "anon_all_funnels"            ON funnels;
  DROP POLICY IF EXISTS "anon_all_comments"           ON audit_comments;
EXCEPTION WHEN others THEN NULL; END $$;

ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnels        ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all_users"    ON users          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_funnels"  ON funnels        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_comments" ON audit_comments FOR ALL USING (true) WITH CHECK (true);

-- ─── Indexes ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_funnels_status        ON funnels(status);
CREATE INDEX IF NOT EXISTS idx_funnels_created_at    ON funnels(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_funnels_assigned_to   ON funnels(assigned_to);
CREATE INDEX IF NOT EXISTS idx_funnels_next_followup ON funnels(next_follow_up);
CREATE INDEX IF NOT EXISTS idx_funnels_phone         ON funnels(phone);
CREATE INDEX IF NOT EXISTS idx_followup_funnel_id    ON followup_logs(funnel_id);
CREATE INDEX IF NOT EXISTS idx_comments_funnel_id    ON audit_comments(funnel_id);

-- ─── Storage bucket for won proof images ─────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ekanta-proofs', 'ekanta-proofs', TRUE, 10485760,
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif','image/heic','image/heif']
)
ON CONFLICT (id) DO UPDATE SET public = TRUE, file_size_limit = 10485760;

-- Storage policies (drop old first)
DROP POLICY IF EXISTS "anon_read_proofs"   ON storage.objects;
DROP POLICY IF EXISTS "anon_upload_proofs" ON storage.objects;
DROP POLICY IF EXISTS "anon_update_proofs" ON storage.objects;
DROP POLICY IF EXISTS "anon_delete_proofs" ON storage.objects;

CREATE POLICY "anon_read_proofs"   ON storage.objects FOR SELECT USING (bucket_id = 'ekanta-proofs');
CREATE POLICY "anon_upload_proofs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ekanta-proofs');
CREATE POLICY "anon_update_proofs" ON storage.objects FOR UPDATE USING (bucket_id = 'ekanta-proofs');
CREATE POLICY "anon_delete_proofs" ON storage.objects FOR DELETE USING (bucket_id = 'ekanta-proofs');
