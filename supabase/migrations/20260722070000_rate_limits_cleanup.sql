-- =====================================================================
-- HireAI — Rate Limits Cleanup Function & Cron Job
-- Kişisel veriyi (HMAC-SHA256 IP hash) süresiz tutmamak ve KVKK/GDPR uyumu
-- için 24 saatten eski kayıtları temizleyen veritabanı fonksiyonu.
-- =====================================================================

create or replace function cleanup_expired_rate_limits()
returns void
language plpgsql
security definer
as $$
begin
  delete from rate_limits
  where window_start < now() - interval '24 hours';
end;
$$;

-- Eğer Supabase projesinde pg_cron eklentisi aktifse her gece saat 03:00'te temizliği çalıştır:
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('cleanup_rate_limits_job', '0 3 * * *', 'select cleanup_expired_rate_limits()');
  end if;
exception
  when others then
    -- pg_cron yetkisi veya eklentisi yoksa hata vermez, fonksiyon manuel/cron edge işiyle çağrılabilir.
    null;
end $$;
