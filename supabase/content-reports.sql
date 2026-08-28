-- Public-content reports for moderation. Apply after launch-hardening.sql and
-- before deploying the report route. Browser roles have no direct table access;
-- the validated server route writes through the service role.

begin;

create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('profile', 'project')),
  target_profile_id uuid not null references public.profiles(id) on delete cascade,
  target_project_id uuid references public.projects(id) on delete cascade,
  category text not null check (category in ('copyright', 'impersonation', 'misleading', 'privacy', 'illegal', 'spam', 'other')),
  details text check (details is null or char_length(details) <= 2000),
  reporter_user_id uuid references auth.users(id) on delete set null,
  reporter_fingerprint text not null check (char_length(reporter_fingerprint) = 64),
  source_path text not null check (char_length(source_path) <= 500),
  status text not null default 'pending' check (status in ('pending', 'reviewing', 'resolved', 'dismissed')),
  moderation_note text check (moderation_note is null or char_length(moderation_note) <= 4000),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (target_type = 'profile' and target_project_id is null)
    or (target_type = 'project' and target_project_id is not null)
  )
);

create index if not exists content_reports_status_created_idx
  on public.content_reports (status, created_at asc);
create index if not exists content_reports_profile_idx
  on public.content_reports (target_profile_id, created_at desc);
create index if not exists content_reports_project_idx
  on public.content_reports (target_project_id, created_at desc)
  where target_project_id is not null;
create index if not exists content_reports_reporter_created_idx
  on public.content_reports (reporter_user_id, created_at desc)
  where reporter_user_id is not null;
create index if not exists content_reports_fingerprint_created_idx
  on public.content_reports (reporter_fingerprint, created_at desc);

create or replace function public.touch_content_report_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists content_reports_touch_updated_at on public.content_reports;
create trigger content_reports_touch_updated_at
before update on public.content_reports
for each row execute function public.touch_content_report_updated_at();

alter table public.content_reports enable row level security;
revoke all on table public.content_reports from public, anon, authenticated;
revoke all on function public.touch_content_report_updated_at() from public, anon, authenticated;

commit;
