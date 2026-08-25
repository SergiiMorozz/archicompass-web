-- Designer Portfolio Autopilot (Phase 1 MVP).
-- Ingests a designer's existing portfolio (website URL or manual upload),
-- clusters images into draft projects, runs AI analysis, and lets the
-- designer review/publish into the existing public.projects table.
-- Everything here is new and additive: no existing table is altered except
-- widening the product_events.event_type check constraint (see bottom).
-- Run after `supabase/security-definer-private-helpers.sql` (uses
-- private.is_admin()) and `supabase/action-quota-rate-limit.sql`.

begin;

create table if not exists public.portfolio_import_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_type text not null check (source_type in ('website', 'upload')),
  source_url text,
  status text not null default 'QUEUED' check (status in (
    'QUEUED', 'FETCHING', 'EXTRACTING', 'GROUPING', 'ANALYZING',
    'BUILDING_PROFILE', 'READY_FOR_REVIEW', 'FAILED', 'PUBLISHED'
  )),
  error text,
  images_found integer not null default 0,
  projects_found integer not null default 0,
  rights_confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portfolio_import_jobs_user_idx
  on public.portfolio_import_jobs (user_id, created_at desc);

-- portfolio_projects and portfolio_assets reference each other (a project has
-- a cover asset, an asset belongs to a project cluster); create both tables
-- first, then add the cross-referencing foreign key.
create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.portfolio_import_jobs(id) on delete cascade,
  suggested_title text,
  cover_asset_id uuid,
  confidence numeric,
  room_types text[] not null default '{}',
  status text not null default 'pending_review' check (status in (
    'pending_review', 'kept', 'hidden', 'published'
  )),
  is_featured boolean not null default false,
  published_project_id uuid references public.projects(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portfolio_projects_job_idx
  on public.portfolio_projects (job_id);

create table if not exists public.portfolio_assets (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.portfolio_import_jobs(id) on delete cascade,
  source_page_url text,
  source_image_url text,
  storage_path text,
  page_title text,
  alt_text text,
  content_hash text,
  cluster_project_id uuid references public.portfolio_projects(id) on delete set null,
  selected boolean not null default true,
  discovered_at timestamptz not null default now()
);

create index if not exists portfolio_assets_job_idx
  on public.portfolio_assets (job_id);
create index if not exists portfolio_assets_cluster_idx
  on public.portfolio_assets (cluster_project_id);

alter table public.portfolio_projects
  drop constraint if exists portfolio_projects_cover_asset_fkey;
alter table public.portfolio_projects
  add constraint portfolio_projects_cover_asset_fkey
  foreign key (cover_asset_id) references public.portfolio_assets(id) on delete set null;

create table if not exists public.project_ai_analysis (
  id uuid primary key default gen_random_uuid(),
  portfolio_project_id uuid not null references public.portfolio_projects(id) on delete cascade,
  model text not null,
  model_version text,
  prompt_version text not null,
  result jsonb,
  status text not null default 'pending' check (status in ('pending', 'done', 'failed')),
  error text,
  created_at timestamptz not null default now(),
  unique (portfolio_project_id)
);

create table if not exists public.designer_intelligence_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  dominant_styles jsonb not null default '[]'::jsonb,
  secondary_styles jsonb not null default '[]'::jsonb,
  materials text[] not null default '{}',
  colors text[] not null default '{}',
  room_experience text[] not null default '{}',
  property_types text[] not null default '{}',
  attributes jsonb not null default '{}'::jsonb,
  project_count integer not null default 0,
  evidence_strength numeric not null default 0,
  confidence_scores jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Row level security. All four job-scoped tables are owner-only (joined back
-- to portfolio_import_jobs.user_id) plus admin read via private.is_admin().
-- Background work (advance/publish routes) runs through the cookie-authenticated
-- server client under the owning user's session, so these owner policies are
-- sufficient without a service-role bypass.

alter table public.portfolio_import_jobs enable row level security;
revoke all on public.portfolio_import_jobs from anon;
grant select, insert, update on public.portfolio_import_jobs to authenticated;

drop policy if exists "portfolio_import_jobs_select_owner_or_admin" on public.portfolio_import_jobs;
create policy "portfolio_import_jobs_select_owner_or_admin"
on public.portfolio_import_jobs
for select
to authenticated
using (user_id = auth.uid() or private.is_admin());

drop policy if exists "portfolio_import_jobs_insert_owner" on public.portfolio_import_jobs;
create policy "portfolio_import_jobs_insert_owner"
on public.portfolio_import_jobs
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "portfolio_import_jobs_update_owner" on public.portfolio_import_jobs;
create policy "portfolio_import_jobs_update_owner"
on public.portfolio_import_jobs
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

alter table public.portfolio_assets enable row level security;
revoke all on public.portfolio_assets from anon;
grant select, insert, update, delete on public.portfolio_assets to authenticated;

drop policy if exists "portfolio_assets_select_owner_or_admin" on public.portfolio_assets;
create policy "portfolio_assets_select_owner_or_admin"
on public.portfolio_assets
for select
to authenticated
using (
  private.is_admin()
  or exists (
    select 1 from public.portfolio_import_jobs job
    where job.id = portfolio_assets.job_id and job.user_id = auth.uid()
  )
);

drop policy if exists "portfolio_assets_insert_owner" on public.portfolio_assets;
create policy "portfolio_assets_insert_owner"
on public.portfolio_assets
for insert
to authenticated
with check (
  exists (
    select 1 from public.portfolio_import_jobs job
    where job.id = portfolio_assets.job_id and job.user_id = auth.uid()
  )
);

drop policy if exists "portfolio_assets_update_owner" on public.portfolio_assets;
create policy "portfolio_assets_update_owner"
on public.portfolio_assets
for update
to authenticated
using (
  exists (
    select 1 from public.portfolio_import_jobs job
    where job.id = portfolio_assets.job_id and job.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.portfolio_import_jobs job
    where job.id = portfolio_assets.job_id and job.user_id = auth.uid()
  )
);

drop policy if exists "portfolio_assets_delete_owner" on public.portfolio_assets;
create policy "portfolio_assets_delete_owner"
on public.portfolio_assets
for delete
to authenticated
using (
  exists (
    select 1 from public.portfolio_import_jobs job
    where job.id = portfolio_assets.job_id and job.user_id = auth.uid()
  )
);

alter table public.portfolio_projects enable row level security;
revoke all on public.portfolio_projects from anon;
grant select, insert, update on public.portfolio_projects to authenticated;

drop policy if exists "portfolio_projects_select_owner_or_admin" on public.portfolio_projects;
create policy "portfolio_projects_select_owner_or_admin"
on public.portfolio_projects
for select
to authenticated
using (
  private.is_admin()
  or exists (
    select 1 from public.portfolio_import_jobs job
    where job.id = portfolio_projects.job_id and job.user_id = auth.uid()
  )
);

drop policy if exists "portfolio_projects_insert_owner" on public.portfolio_projects;
create policy "portfolio_projects_insert_owner"
on public.portfolio_projects
for insert
to authenticated
with check (
  exists (
    select 1 from public.portfolio_import_jobs job
    where job.id = portfolio_projects.job_id and job.user_id = auth.uid()
  )
);

drop policy if exists "portfolio_projects_update_owner" on public.portfolio_projects;
create policy "portfolio_projects_update_owner"
on public.portfolio_projects
for update
to authenticated
using (
  exists (
    select 1 from public.portfolio_import_jobs job
    where job.id = portfolio_projects.job_id and job.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.portfolio_import_jobs job
    where job.id = portfolio_projects.job_id and job.user_id = auth.uid()
  )
);

alter table public.project_ai_analysis enable row level security;
revoke all on public.project_ai_analysis from anon;
grant select, insert, update on public.project_ai_analysis to authenticated;

drop policy if exists "project_ai_analysis_select_owner_or_admin" on public.project_ai_analysis;
create policy "project_ai_analysis_select_owner_or_admin"
on public.project_ai_analysis
for select
to authenticated
using (
  private.is_admin()
  or exists (
    select 1 from public.portfolio_projects proj
    join public.portfolio_import_jobs job on job.id = proj.job_id
    where proj.id = project_ai_analysis.portfolio_project_id and job.user_id = auth.uid()
  )
);

drop policy if exists "project_ai_analysis_insert_owner" on public.project_ai_analysis;
create policy "project_ai_analysis_insert_owner"
on public.project_ai_analysis
for insert
to authenticated
with check (
  exists (
    select 1 from public.portfolio_projects proj
    join public.portfolio_import_jobs job on job.id = proj.job_id
    where proj.id = project_ai_analysis.portfolio_project_id and job.user_id = auth.uid()
  )
);

drop policy if exists "project_ai_analysis_update_owner" on public.project_ai_analysis;
create policy "project_ai_analysis_update_owner"
on public.project_ai_analysis
for update
to authenticated
using (
  exists (
    select 1 from public.portfolio_projects proj
    join public.portfolio_import_jobs job on job.id = proj.job_id
    where proj.id = project_ai_analysis.portfolio_project_id and job.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.portfolio_projects proj
    join public.portfolio_import_jobs job on job.id = proj.job_id
    where proj.id = project_ai_analysis.portfolio_project_id and job.user_id = auth.uid()
  )
);

alter table public.designer_intelligence_profiles enable row level security;
revoke all on public.designer_intelligence_profiles from anon;
grant select, insert, update on public.designer_intelligence_profiles to authenticated;

drop policy if exists "designer_intelligence_profiles_select_owner_or_admin" on public.designer_intelligence_profiles;
create policy "designer_intelligence_profiles_select_owner_or_admin"
on public.designer_intelligence_profiles
for select
to authenticated
using (user_id = auth.uid() or private.is_admin());

drop policy if exists "designer_intelligence_profiles_insert_owner" on public.designer_intelligence_profiles;
create policy "designer_intelligence_profiles_insert_owner"
on public.designer_intelligence_profiles
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "designer_intelligence_profiles_update_owner" on public.designer_intelligence_profiles;
create policy "designer_intelligence_profiles_update_owner"
on public.designer_intelligence_profiles
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Private staging bucket: imported images live here, invisible to anyone but
-- the owning designer (and admins via signed URL issued through server code)
-- until publish copies selected files into the existing public project-images
-- bucket. Mirrors the brief-reference-photos bucket pattern exactly.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-import-staging',
  'portfolio-import-staging',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "portfolio_import_staging_select_owner" on storage.objects;
create policy "portfolio_import_staging_select_owner"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'portfolio-import-staging'
  and name like auth.uid()::text || '/%'
);

drop policy if exists "portfolio_import_staging_insert_owner" on storage.objects;
create policy "portfolio_import_staging_insert_owner"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'portfolio-import-staging'
  and name like auth.uid()::text || '/%'
);

drop policy if exists "portfolio_import_staging_update_owner" on storage.objects;
create policy "portfolio_import_staging_update_owner"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'portfolio-import-staging'
  and name like auth.uid()::text || '/%'
)
with check (
  bucket_id = 'portfolio-import-staging'
  and name like auth.uid()::text || '/%'
);

drop policy if exists "portfolio_import_staging_delete_owner" on storage.objects;
create policy "portfolio_import_staging_delete_owner"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'portfolio-import-staging'
  and name like auth.uid()::text || '/%'
);

-- Extend the existing product_events funnel with the Portfolio Autopilot
-- steps (spec section 28). Additive only: widens the allowed event_type set,
-- does not touch existing rows or the trigger-based events.
alter table public.product_events
  drop constraint if exists product_events_event_type_check;
alter table public.product_events
  add constraint product_events_event_type_check
  check (event_type in (
    'account_registered',
    'ai_analysis_completed',
    'brief_saved',
    'inquiry_sent',
    'message_sent',
    'portfolio_project_added',
    'designer_onboarding_started',
    'portfolio_source_added',
    'portfolio_import_started',
    'portfolio_import_completed',
    'portfolio_import_failed',
    'profile_ai_generated',
    'profile_review_started',
    'portfolio_autopilot_project_hidden',
    'portfolio_autopilot_project_featured',
    'portfolio_autopilot_profile_published'
  ));

commit;
