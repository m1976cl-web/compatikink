-- CompatKink — Supabase Hardening Migration (001_hardening.sql)
-- Run this in Supabase SQL Editor for existing databases.

-- 1. Ensure expires_at column exists
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours');

-- 2. Create Rate-Limiting table
CREATE TABLE IF NOT EXISTS rpc_rate_limits (
  bucket TEXT PRIMARY KEY,
  hits INT NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE rpc_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE rpc_rate_limits FROM anon, authenticated;

-- 3. Rate-limiting helper function
CREATE OR REPLACE FUNCTION check_and_increment_rate_limit(
  p_bucket TEXT,
  p_max_hits INT,
  p_window_seconds INT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
  v_window_start TIMESTAMPTZ;
  v_hits INT;
BEGIN
  SELECT window_start, hits INTO v_window_start, v_hits
  FROM rpc_rate_limits
  WHERE bucket = p_bucket;

  IF NOT FOUND THEN
    INSERT INTO rpc_rate_limits (bucket, hits, window_start)
    VALUES (p_bucket, 1, v_now);
    RETURN TRUE;
  END IF;

  IF v_now > (v_window_start + (p_window_seconds || ' seconds')::INTERVAL) THEN
    UPDATE rpc_rate_limits
    SET hits = 1, window_start = v_now
    WHERE bucket = p_bucket;
    RETURN TRUE;
  END IF;

  IF v_hits >= p_max_hits THEN
    RETURN FALSE;
  END IF;

  UPDATE rpc_rate_limits
  SET hits = hits + 1
  WHERE bucket = p_bucket;
  RETURN TRUE;
END;
$$;

-- 4. Purge expired sessions function
CREATE OR REPLACE FUNCTION purge_expired_sessions()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INT;
BEGIN
  DELETE FROM sessions WHERE expires_at < NOW();
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;
