-- =====================================================================
-- HireAI — Edge Function Persistent Rate Limiting Table
-- Bellek (in-memory map) yerine veritabanında kalıcı rate limiting.
-- IP adresleri ham olarak saklanmaz, SHA-256 ile hash'lenerek tutulur.
-- =====================================================================

create table if not exists rate_limits (
  ip_hash text primary key,
  request_count int not null default 1,
  window_start timestamptz not null default now()
);

alter table rate_limits enable row level security;

-- Sadece service_role (Edge Function vb.) erişebilir. Anon veya normal kullanıcılar erişemez.
create policy "service role full access rate_limits"
  on rate_limits for all
  using (false)
  with check (false);
