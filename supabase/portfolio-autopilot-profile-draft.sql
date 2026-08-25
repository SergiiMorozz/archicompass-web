-- Portfolio Autopilot: Profile Autocomplete draft layer.
-- Stages AI-suggested / site-extracted public-profile fields (headline,
-- about text, specialties, service checklist, social links) for designer
-- review, separate from the live public.profiles row. Nothing here is
-- written to public.profiles until the designer explicitly publishes it via
-- the profile-draft publish route, and even then only into fields the
-- designer hasn't already filled in themselves.
-- Run after supabase/portfolio-autopilot.sql.

begin;

alter table public.portfolio_import_jobs
  add column if not exists discovered_social_links jsonb not null default '{}'::jsonb;

create table if not exists public.portfolio_profile_drafts (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.portfolio_import_jobs(id) on delete cascade,
  headline text,
  about text,
  specialties text[] not null default '{}',
  suggested_service_capabilities text[] not null default '{}',
  instagram_url text,
  facebook_url text,
  behance_url text,
  linkedin_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id)
);

alter table public.portfolio_profile_drafts enable row level security;
revoke all on public.portfolio_profile_drafts from anon;
grant select, insert, update on public.portfolio_profile_drafts to authenticated;

drop policy if exists "portfolio_profile_drafts_select_owner_or_admin" on public.portfolio_profile_drafts;
create policy "portfolio_profile_drafts_select_owner_or_admin"
on public.portfolio_profile_drafts
for select
to authenticated
using (
  private.is_admin()
  or exists (
    select 1 from public.portfolio_import_jobs job
    where job.id = portfolio_profile_drafts.job_id and job.user_id = auth.uid()
  )
);

drop policy if exists "portfolio_profile_drafts_insert_owner" on public.portfolio_profile_drafts;
create policy "portfolio_profile_drafts_insert_owner"
on public.portfolio_profile_drafts
for insert
to authenticated
with check (
  exists (
    select 1 from public.portfolio_import_jobs job
    where job.id = portfolio_profile_drafts.job_id and job.user_id = auth.uid()
  )
);

drop policy if exists "portfolio_profile_drafts_update_owner" on public.portfolio_profile_drafts;
create policy "portfolio_profile_drafts_update_owner"
on public.portfolio_profile_drafts
for update
to authenticated
using (
  exists (
    select 1 from public.portfolio_import_jobs job
    where job.id = portfolio_profile_drafts.job_id and job.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.portfolio_import_jobs job
    where job.id = portfolio_profile_drafts.job_id and job.user_id = auth.uid()
  )
);

commit;
