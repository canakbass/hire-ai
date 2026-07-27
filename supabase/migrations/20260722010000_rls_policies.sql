-- =====================================================================
-- HireAI — RLS Policies Migration
-- Tüm org-scoped ve kullanıcı-scoped tablolar için RLS politikaları
-- =====================================================================

-- 1. Orgs
create policy "org members full access orgs"
  on orgs for all
  using (is_org_member(id))
  with check (is_org_member(id));

-- 2. Org Members
create policy "org members full access org_members"
  on org_members for all
  using (user_id = auth.uid() or is_org_member(org_id))
  with check (user_id = auth.uid() or is_org_member(org_id));

-- 3. Profiles
create policy "users full access own profile"
  on profiles for all
  using (id = auth.uid())
  with check (id = auth.uid());

-- 4. Job Settings
create policy "org members full access job_settings"
  on job_settings for all
  using (is_org_member(org_id))
  with check (is_org_member(org_id));

-- 5. Candidates
create policy "org members full access candidates"
  on candidates for all
  using (is_org_member(org_id))
  with check (is_org_member(org_id));

-- 6. Applications
create policy "org members full access applications"
  on applications for all
  using (is_org_member(org_id))
  with check (is_org_member(org_id));

-- 7. CV Analyses
create policy "org members full access cv_analyses"
  on cv_analyses for all
  using (is_org_member(org_id))
  with check (is_org_member(org_id));

-- 8. Interviews
create policy "org members full access interviews"
  on interviews for all
  using (is_org_member(org_id))
  with check (is_org_member(org_id));

-- 9. Evaluations
create policy "org members full access evaluations"
  on evaluations for all
  using (is_org_member(org_id))
  with check (is_org_member(org_id));
