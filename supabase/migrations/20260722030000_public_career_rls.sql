-- =====================================================================
-- HireAI — Public Career Page RLS Policies
-- Anonim (oturum açmamış) adayların kariyer sayfasında yalnızca yayınlanmış
-- (published) pozisyonları ve organizasyon bilgilerini okuyabilmesi için RLS
-- =====================================================================

-- 1. Orgs (Public okuma erişimi - slug takma adı ile bulmak için)
create policy "public read orgs"
  on orgs for select
  using (true);

-- 2. Jobs (Sadece status = 'published' olanlar herkese açık okunabilir)
create policy "public read published jobs"
  on jobs for select
  using (status = 'published');
