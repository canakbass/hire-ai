-- =====================================================================
-- HireAI — SaaS İşe Alım Platformu  |  Supabase (Postgres) Şema v1
-- Multi-tenant + RLS + pozisyon-başına ayarlanabilir eleme/mülakat/kısa liste
-- NOT: Bu bir v1 taslaktır; üzerinde iterasyon yapılacaktır.
-- =====================================================================

-- ------- Uzantılar -----------------------------------------------------
create extension if not exists "uuid-ossp";

-- ------- ENUM tipleri --------------------------------------------------
create type app_role         as enum ('owner','admin','recruiter','viewer');
create type job_status       as enum ('draft','published','paused','closed');
create type app_source       as enum ('web_form','email','linkedin','manual');
create type app_status       as enum (
  'new','analyzing','analyzed','potential','irrelevant','review',
  'interview_pending','interviewed','shortlisted','rejected','hired'
);

-- =====================================================================
-- ORGANİZASYONLAR (tenant kökü)
-- =====================================================================
create table orgs (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text unique not null,
  plan        text not null default 'free',   -- faturalama sonradan
  created_at  timestamptz not null default now()
);

-- auth.users ile 1:1 profil
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- kullanıcı <-> org (rollerle)
create table org_members (
  org_id      uuid not null references orgs(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  role        app_role not null default 'recruiter',
  created_at  timestamptz not null default now(),
  primary key (org_id, user_id)
);

-- =====================================================================
-- POZİSYONLAR + POZİSYON AYARLARI (varsayılanlı, düzenlenebilir)
-- =====================================================================
create table jobs (
  id              uuid primary key default uuid_generate_v4(),
  org_id          uuid not null references orgs(id) on delete cascade,
  title           text not null,
  department      text,
  location        text,
  employment_type text default 'full_time',   -- full_time|part_time|contract|intern
  seniority       text default 'mid',         -- junior|mid|senior|lead
  description     text,                        -- JD
  status          job_status not null default 'draft',
  created_by      uuid references profiles(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Pozisyon başına eleme/mülakat/kısa liste ayarları (1:1)
-- Yeni pozisyonda bu satır varsayılanlarla otomatik oluşturulur, İK override eder.
create table job_settings (
  job_id                    uuid primary key references jobs(id) on delete cascade,
  org_id                    uuid not null references orgs(id) on delete cascade,

  -- kriterler
  required_skills           text[] default '{}',
  nice_to_have_skills       text[] default '{}',
  min_experience_years      int    default 0,
  education_level           text,                          -- lise|onlisans|lisans|yuksek
  languages                 text[] default '{}',

  -- skorlama rubriği (ağırlıklar toplamı 100 olmalı)
  scoring_weights           jsonb  default
    '{"skills":40,"experience":30,"education":15,"other":15}'::jsonb,
  pass_threshold            int    default 70,   -- >= => potential
  reject_threshold          int    default 40,   -- <  => irrelevant, arası => review
  knockout_rules            jsonb  default '[]'::jsonb,  -- ["work_permit","drivers_license"...]

  -- mülakat (Vapi)
  interview_enabled         boolean default true,
  interview_questions       jsonb  default '[]'::jsonb,   -- JD'den üretilir, düzenlenebilir
  interview_language        text   default 'tr',
  interview_max_minutes     int    default 6,
  interview_voice           text   default 'default',
  interview_pass_threshold  int    default 70,

  -- kısa liste (eski "final 5" -> artık ayarlanabilir)
  shortlist_size            int    default 5,
  ranking_weights           jsonb  default
    '{"cv":50,"interview":50}'::jsonb,

  -- otomasyon güvenliği: potansiyeller İK onayı olmadan otomatik ARANMAZ
  require_manual_call_approval boolean default true,

  updated_at                timestamptz not null default now()
);

-- =====================================================================
-- ADAYLAR + BAŞVURULAR (kaynaktan bağımsız)
-- =====================================================================
create table candidates (
  id          uuid primary key default uuid_generate_v4(),
  org_id      uuid not null references orgs(id) on delete cascade,
  full_name   text,
  email       text,
  phone       text,
  created_at  timestamptz not null default now(),
  unique (org_id, email)          -- org içinde e-posta ile tekilleştirme
);

create table applications (
  id              uuid primary key default uuid_generate_v4(),
  org_id          uuid not null references orgs(id) on delete cascade,
  job_id          uuid not null references jobs(id) on delete cascade,
  candidate_id    uuid not null references candidates(id) on delete cascade,
  source          app_source not null default 'web_form',
  cv_storage_path text,                          -- Supabase Storage yolu
  status          app_status not null default 'new',
  consent_given   boolean not null default false, -- KVKK açık rıza
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- =====================================================================
-- AI CV ANALİZİ (Gemini çıktısı, yapılandırılmış)
-- =====================================================================
create table cv_analyses (
  id              uuid primary key default uuid_generate_v4(),
  application_id  uuid not null references applications(id) on delete cascade,
  org_id          uuid not null references orgs(id) on delete cascade,
  match_score     int,                           -- 0-100
  extracted       jsonb,                         -- name,skills,experience,education...
  strengths       jsonb default '[]'::jsonb,
  gaps            jsonb default '[]'::jsonb,
  verdict         text,                          -- potential|irrelevant|review
  model           text,                          -- gemini-flash / gemini-pro
  created_at      timestamptz not null default now()
);

-- =====================================================================
-- AI VOICE MÜLAKAT (Vapi çıktısı)
-- =====================================================================
create table interviews (
  id              uuid primary key default uuid_generate_v4(),
  application_id  uuid not null references applications(id) on delete cascade,
  org_id          uuid not null references orgs(id) on delete cascade,
  vapi_call_id    text,
  transcript      text,
  scores          jsonb default '{}'::jsonb,     -- iletisim,teknik,problem_cozme...
  overall_score   int,                           -- 0-100
  recording_url   text,
  status          text default 'pending',        -- pending|completed|failed
  created_at      timestamptz not null default now()
);

-- =====================================================================
-- DEĞERLENDİRME + KISA LİSTE (CV + mülakat birleşik)
-- =====================================================================
create table evaluations (
  id              uuid primary key default uuid_generate_v4(),
  application_id  uuid not null references applications(id) on delete cascade,
  org_id          uuid not null references orgs(id) on delete cascade,
  cv_score        int,
  interview_score int,
  final_score     int,                           -- ranking_weights ile hesaplanır
  rank            int,                           -- pozisyon içi sıra
  is_shortlisted  boolean default false,         -- rank <= shortlist_size
  decision        text,                          -- pending|approved|rejected
  decided_by      uuid references profiles(id),  -- human-in-the-loop
  created_at      timestamptz not null default now()
);

-- =====================================================================
-- İNDEKSLER
-- =====================================================================
create index on applications (org_id, job_id, status);
create index on cv_analyses  (org_id, application_id);
create index on interviews   (org_id, application_id);
create index on evaluations  (org_id, application_id);

-- =====================================================================
-- RLS: her tablo org bazında izole
-- =====================================================================
alter table orgs          enable row level security;
alter table org_members   enable row level security;
alter table jobs          enable row level security;
alter table job_settings  enable row level security;
alter table candidates    enable row level security;
alter table applications  enable row level security;
alter table cv_analyses   enable row level security;
alter table interviews    enable row level security;
alter table evaluations   enable row level security;

-- yardımcı: kullanıcı bu org'un üyesi mi?
create or replace function is_org_member(target_org uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from org_members
    where org_id = target_org and user_id = auth.uid()
  );
$$;

-- org üyeliği gereken tablolar için genel politika (örnek: jobs)
create policy "org members read/write jobs"
  on jobs for all
  using (is_org_member(org_id))
  with check (is_org_member(org_id));

-- Aynı desen diğer org-scoped tablolara da uygulanır:
--   job_settings, candidates, applications, cv_analyses, interviews, evaluations
-- (her biri için is_org_member(org_id) ile for all policy)

-- NOT: Anonim (giriş yapmamış) aday başvurusu bu politikalara TAKILIR.
-- Bu yüzden public başvuru bir Supabase EDGE FUNCTION üzerinden,
-- service_role ile ve yalnızca status='published' bir job_id'ye yazacak.
-- Böylece aday veri ekler ama hiçbir org verisini okuyamaz.
