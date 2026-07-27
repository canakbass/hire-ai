-- =====================================================================
-- HireAI — Database Webhook Trigger (pg_net) for n8n AI CV Analysis
-- Edge Function'dan tetikleme yapılmaz. applications tablosuna INSERT
-- olduğunda (kaynaktan bağımsız: web_form, email, linkedin vb.) otomatik
-- olarak n8n webhook adresine X-Webhook-Secret başlığı ile POST atılır.
-- =====================================================================

create extension if not exists pg_net;

-- Webhook URL ve Secret gibi veritabanı içi gizli/dinamik ayarları tutacağımız güvenli tablo
create table if not exists app_config (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table app_config enable row level security;

-- Sadece service_role ve security definer fonksiyonlar erişebilir
create policy "service role full access app_config"
  on app_config for all
  using (false)
  with check (false);

-- Varsayılan (placeholder) kayıtlar ekleyelim (Kullanıcı tunnel ve secret adresi verdiğinde güncellenir)
insert into app_config (key, value)
values 
  ('n8n_webhook_url', 'http://localhost:5678/webhook/hire-ai-cv-analyze'),
  ('n8n_webhook_secret', 'default_hireai_webhook_secret_change_me')
on conflict (key) do nothing;

-- Tetikleyici Fonksiyon
create or replace function trigger_n8n_cv_analysis()
returns trigger
language plpgsql
security definer
as $$
declare
  v_url text;
  v_secret text;
begin
  -- Sadece yeni başvurularda (status = 'new') çalıştır
  if (TG_OP = 'INSERT' and NEW.status = 'new') then
    select value into v_url from app_config where key = 'n8n_webhook_url';
    select value into v_secret from app_config where key = 'n8n_webhook_secret';

    if v_url is not null and v_url <> '' then
      perform net.http_post(
        url := v_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'X-Webhook-Secret', coalesce(v_secret, '')
        ),
        body := jsonb_build_object(
          'application_id', NEW.id,
          'org_id', NEW.org_id,
          'job_id', NEW.job_id,
          'cv_storage_path', NEW.cv_storage_path,
          'source', NEW.source,
          'created_at', NEW.created_at
        )
      );
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists on_application_insert_trigger_n8n on applications;
create trigger on_application_insert_trigger_n8n
  after insert on applications
  for each row
  execute function trigger_n8n_cv_analysis();
