-- ArchiCompass Row Level Security policies.
-- Run this in Supabase SQL Editor.
--
-- Assumptions:
-- - public.profiles.id is the same UUID as auth.users.id.
-- - public.projects.profile_id references public.profiles.id.
-- - Public visitors may browse profiles and portfolio projects.
-- - Only the owner may create/update their own profile and projects.

begin;

-- =========================
-- PROFILES
-- =========================

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public"
on public.profiles
for select
to public
using (true);

drop policy if exists "profiles_insert_owner" on public.profiles;
create policy "profiles_insert_owner"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "profiles_update_owner" on public.profiles;
create policy "profiles_update_owner"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- =========================
-- PROJECTS
-- =========================

alter table public.projects enable row level security;

drop policy if exists "projects_select_public" on public.projects;
create policy "projects_select_public"
on public.projects
for select
to public
using (true);

drop policy if exists "projects_insert_owner" on public.projects;
create policy "projects_insert_owner"
on public.projects
for insert
to authenticated
with check (profile_id = auth.uid());

drop policy if exists "projects_update_owner" on public.projects;
create policy "projects_update_owner"
on public.projects
for update
to authenticated
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

drop policy if exists "projects_delete_owner" on public.projects;
create policy "projects_delete_owner"
on public.projects
for delete
to authenticated
using (profile_id = auth.uid());

commit;
