-- =====================================================================
-- HireAI — Supabase Realtime Publication Migration
-- applications tablosundaki yeni başvurular ve durum değişikliklerinin
-- anlık olarak istemcilere iletilebilmesi için supabase_realtime
-- yayınına (publication) eklenmesi
-- =====================================================================

do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'applications'
  ) then
    alter publication supabase_realtime add table applications;
  end if;
end $$;
