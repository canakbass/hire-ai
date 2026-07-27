-- ==============================================================================
-- PHASE 2 MIGRATION: Update Webhook Config, HMAC Rate Limiting & Daily Cleanup
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Update app_config with active HTTP/2 Cloudflare Tunnel URL and Secret
INSERT INTO app_config (key, value)
VALUES 
  ('n8n_webhook_url', 'https://repeated-concerning-prevent-admit.trycloudflare.com/webhook/hire-ai-cv-analyze'),
  ('n8n_webhook_secret', 'whsec_hireai_secure_secret_2026_x9a')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- 3. Ensure trigger_n8n_cv_analysis() cleanly sends payload via pg_net
CREATE OR REPLACE FUNCTION trigger_n8n_cv_analysis()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_url TEXT;
  v_secret TEXT;
BEGIN
  -- Trigger ONLY when status is 'new' AND cv_storage_path is populated
  IF (NEW.status = 'new' AND NEW.cv_storage_path IS NOT NULL AND (
      TG_OP = 'INSERT' OR 
      (TG_OP = 'UPDATE' AND OLD.cv_storage_path IS DISTINCT FROM NEW.cv_storage_path)
    )) THEN
    SELECT value INTO v_url FROM app_config WHERE key = 'n8n_webhook_url';
    SELECT value INTO v_secret FROM app_config WHERE key = 'n8n_webhook_secret';

    IF v_url IS NOT NULL AND v_url <> '' THEN
      PERFORM net.http_post(
        url := v_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'X-Webhook-Secret', COALESCE(v_secret, '')
        ),
        body := jsonb_build_object(
          'application_id', NEW.id,
          'org_id', NEW.org_id,
          'job_id', NEW.job_id,
          'candidate_id', NEW.candidate_id,
          'cv_storage_path', NEW.cv_storage_path,
          'source', NEW.source,
          'status', NEW.status,
          'created_at', NEW.created_at
        )
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_application_insert_trigger_n8n ON applications;
CREATE TRIGGER on_application_insert_trigger_n8n
  AFTER INSERT OR UPDATE OF cv_storage_path ON applications
  FOR EACH ROW
  EXECUTE FUNCTION trigger_n8n_cv_analysis();

-- ==============================================================================
-- 4. HMAC-SHA256 RATE LIMITING WITH SERVER SALT & CRON CLEANUP
-- ==============================================================================

CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash TEXT,
  request_count INT NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rate_limits' AND column_name = 'ip_hmac') THEN
    ALTER TABLE rate_limits ADD COLUMN ip_hmac TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rate_limits' AND column_name = 'endpoint') THEN
    ALTER TABLE rate_limits ADD COLUMN endpoint TEXT DEFAULT 'submit-application';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);
CREATE INDEX IF NOT EXISTS idx_rate_limits_hash ON rate_limits(ip_hash);
CREATE INDEX IF NOT EXISTS idx_rate_limits_hmac ON rate_limits(ip_hmac, endpoint);

CREATE OR REPLACE FUNCTION check_rate_limit_hmac(
  p_ip_address TEXT,
  p_salt TEXT,
  p_endpoint TEXT,
  p_max_requests INT DEFAULT 10,
  p_window_seconds INT DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
  v_ip_hmac TEXT;
  v_current_window TIMESTAMPTZ;
  v_count INT;
BEGIN
  v_ip_hmac := encode(hmac(p_ip_address::bytea, p_salt::bytea, 'sha256'), 'hex');
  v_current_window := to_timestamp(floor(extract(epoch from NOW()) / p_window_seconds) * p_window_seconds);

  INSERT INTO rate_limits (ip_hmac, endpoint, request_count, window_start)
  VALUES (v_ip_hmac, p_endpoint, 1, v_current_window)
  ON CONFLICT (ip_hmac, endpoint, window_start)
  DO UPDATE SET request_count = rate_limits.request_count + 1
  RETURNING request_count INTO v_count;

  RETURN v_count <= p_max_requests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Cron Cleanup Function for GDPR & Privacy
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS VOID AS $$
BEGIN
  DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT cron.schedule('cleanup-rate-limits-daily', '0 4 * * *', 'SELECT cleanup_old_rate_limits();');
