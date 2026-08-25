-- Profile Autocomplete: field provenance metadata.
-- Tracks where each AI/site-derived profile field's current value came
-- from and whether the designer has confirmed it. public.profiles stays
-- the source of truth for the value itself - this table is metadata only,
-- and is deliberately kept separate rather than turning profiles columns
-- into jsonb, since dozens of existing call sites in the profile editor
-- and the public designer page read those columns as plain scalars/arrays.
-- Run after supabase/portfolio-autopilot-profile-draft.sql.

begin;

create table if not exists public.profile_field_provenance (
  user_id uuid not null references auth.users(id) on delete cascade,
  field_key text not null check (field_key in (
    'headline', 'about', 'specialties', 'service_capabilities',
    'instagram_url', 'facebook_url', 'behance_url', 'linkedin_url',
    'location', 'website', 'phone', 'email', 'languages', 'work_modes'
  )),
  source text not null check (source in (
    'website_extracted', 'ai_inferred', 'designer_declared', 'admin_verified'
  )),
  confidence numeric,
  suggested_value jsonb,
  confirmed_by_designer boolean not null default false,
  set_by_job_id uuid references public.portfolio_import_jobs(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  confirmed_at timestamptz,
  primary key (user_id, field_key)
);

alter table public.profile_field_provenance enable row level security;
revoke all on public.profile_field_provenance from anon;
grant select, insert, update on public.profile_field_provenance to authenticated;

drop policy if exists "profile_field_provenance_select_owner" on public.profile_field_provenance;
create policy "profile_field_provenance_select_owner"
on public.profile_field_provenance
for select
to authenticated
using (user_id = auth.uid() or private.is_admin());

drop policy if exists "profile_field_provenance_insert_owner" on public.profile_field_provenance;
create policy "profile_field_provenance_insert_owner"
on public.profile_field_provenance
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "profile_field_provenance_update_owner" on public.profile_field_provenance;
create policy "profile_field_provenance_update_owner"
on public.profile_field_provenance
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

commit;
