-- =====================================================================
-- HireAI — Storage Bucket & Storage RLS Policies Migration
-- KVKK uyumlu PRIVATE cv-files bucket & organizasyon izolasyonu
-- =====================================================================

-- Helper function to safely try casting text to uuid inside storage policies
create or replace function public.try_cast_uuid(text_val text)
returns uuid language plpgsql stable as $$
begin
  return text_val::uuid;
exception when others then
  return null;
end;
$$;

-- 1. Create PRIVATE bucket for CV files if not exists
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cv-files',
  'cv-files',
  false,
  5242880, -- 5 MB in bytes
  array['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = array['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- 2. Storage Objects RLS policies for cv-files bucket
-- Only members of the organization (first folder in storage path {org_id}/{job_id}/{application_id}.{ext}) can read objects
drop policy if exists "org members read own cv-files" on storage.objects;
create policy "org members read own cv-files"
  on storage.objects for select
  using (
    bucket_id = 'cv-files' 
    and auth.role() = 'authenticated'
    and public.is_org_member(public.try_cast_uuid(split_part(name, '/', 1)))
  );

-- Allow org members to delete their own org's CV files if needed (e.g. KVKK deletion requests)
drop policy if exists "org members delete own cv-files" on storage.objects;
create policy "org members delete own cv-files"
  on storage.objects for delete
  using (
    bucket_id = 'cv-files' 
    and auth.role() = 'authenticated'
    and public.is_org_member(public.try_cast_uuid(split_part(name, '/', 1)))
  );
