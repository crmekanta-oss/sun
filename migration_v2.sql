-- ============================================================
-- Suntronix CRM — Migration v2
-- Run this if you already have an existing Supabase project.
-- Safe to run multiple times (all changes are idempotent).
-- ============================================================

-- Add missing columns to funnels table
DO $$ BEGIN
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
    ALTER TABLE funnels ADD COLUMN is_existing BOOLEAN DEFAULT false;
  END IF;
  -- Rename contact → name if old schema
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funnels' AND column_name='contact')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funnels' AND column_name='name') THEN
    ALTER TABLE funnels RENAME COLUMN contact TO name;
  END IF;
  -- Rename quote_no → order_number if old schema
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funnels' AND column_name='quote_no')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funnels' AND column_name='order_number') THEN
    ALTER TABLE funnels RENAME COLUMN quote_no TO order_number;
  END IF;
  -- Drop old unused columns
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funnels' AND column_name='stage') THEN
    ALTER TABLE funnels DROP COLUMN stage;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funnels' AND column_name='company') THEN
    ALTER TABLE funnels DROP COLUMN company;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funnels' AND column_name='billed_amount') THEN
    ALTER TABLE funnels DROP COLUMN billed_amount;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funnels' AND column_name='billed_date') THEN
    ALTER TABLE funnels DROP COLUMN billed_date;
  END IF;
  -- Make next_follow_up nullable (required for Won deals to skip it)
  ALTER TABLE funnels ALTER COLUMN next_follow_up DROP NOT NULL;
END $$;

-- Create followup_logs table if missing
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

-- Enable realtime on followup_logs
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE followup_logs;
EXCEPTION WHEN others THEN NULL; END $$;

-- Enable RLS on followup_logs
ALTER TABLE followup_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on followup_logs"  ON followup_logs;
DROP POLICY IF EXISTS "anon_read_followuplogs"       ON followup_logs;
DROP POLICY IF EXISTS "anon_write_followuplogs"      ON followup_logs;
CREATE POLICY "anon_read_followuplogs"  ON followup_logs FOR SELECT USING (true);
CREATE POLICY "anon_write_followuplogs" ON followup_logs FOR ALL    USING (true) WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_funnels_status        ON funnels(status);
CREATE INDEX IF NOT EXISTS idx_funnels_created_at    ON funnels(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_funnels_assigned_to   ON funnels(assigned_to);
CREATE INDEX IF NOT EXISTS idx_funnels_next_followup ON funnels(next_follow_up);
CREATE INDEX IF NOT EXISTS idx_followup_funnel_id    ON followup_logs(funnel_id);
CREATE INDEX IF NOT EXISTS idx_comments_funnel_id    ON audit_comments(funnel_id);

-- Update existing RLS policies to be consistent
DROP POLICY IF EXISTS "Allow all on funnels"       ON funnels;
DROP POLICY IF EXISTS "Allow all on users"          ON users;
DROP POLICY IF EXISTS "Allow all on audit_comments" ON audit_comments;
DROP POLICY IF EXISTS "anon_read_funnels"           ON funnels;
DROP POLICY IF EXISTS "anon_write_funnels"          ON funnels;
DROP POLICY IF EXISTS "anon_read_users"             ON users;
DROP POLICY IF EXISTS "anon_write_users"            ON users;
DROP POLICY IF EXISTS "anon_read_comments"          ON audit_comments;
DROP POLICY IF EXISTS "anon_write_comments"         ON audit_comments;

CREATE POLICY "anon_read_funnels"   ON funnels        FOR SELECT USING (true);
CREATE POLICY "anon_write_funnels"  ON funnels        FOR ALL    USING (true) WITH CHECK (true);
CREATE POLICY "anon_read_users"     ON users          FOR SELECT USING (true);
CREATE POLICY "anon_write_users"    ON users          FOR ALL    USING (true) WITH CHECK (true);
CREATE POLICY "anon_read_comments"  ON audit_comments FOR SELECT USING (true);
CREATE POLICY "anon_write_comments" ON audit_comments FOR ALL    USING (true) WITH CHECK (true);
