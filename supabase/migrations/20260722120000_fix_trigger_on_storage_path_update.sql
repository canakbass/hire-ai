-- ==============================================================================
-- PHASE 2 FIX: Trigger n8n webhook AFTER cv_storage_path is set (uploaded)
-- ==============================================================================

CREATE OR REPLACE FUNCTION trigger_n8n_cv_analysis()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_url TEXT;
  v_secret TEXT;
BEGIN
  -- Trigger ONLY when status is 'new' AND cv_storage_path IS NOT NULL AND (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.cv_storage_path IS DISTINCT FROM NEW.cv_storage_path))
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
