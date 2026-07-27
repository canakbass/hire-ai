-- =====================================================================
-- HireAI — Update app_config with Cloudflare Tunnel URL
-- =====================================================================

insert into app_config (key, value)
values ('n8n_webhook_url', 'https://methodology-hood-sue-crossword.trycloudflare.com/webhook/hire-ai-cv-analyze')
on conflict (key) do update set value = excluded.value, updated_at = now();
