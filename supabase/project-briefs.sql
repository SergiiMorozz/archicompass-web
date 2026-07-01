-- Project Compass saved briefs and reference photos.
-- Run after `supabase/rls.sql`.

begin;

create table if not exists public.project_briefs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  project_type text,
  goal text,
  style_direction text,
  support_scope text,
  budget_signal text,
  area_m2 numeric,
  room_count integer,
  room_types text[] not null default '{}',
  property_status text,
  visualization_need text,
  supervision_need text,
  location text,
  notes text,
  visual_cues text[] not null default '{}',
  reference_photo_names text[] not null default '{}',
  reference_photo_paths text[] not null default '{}',
  brief_text text not null,
  designer_search_href text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.project_briefs
  add column if not exists area_m2 numeric,
  add column if not exists room_count integer,
  add column if not exists room_types text[] not null default '{}',
  add column if not exists property_status text,
  add column if not exists visualization_need text,
  add column if not exists supervision_need text;

alter table public.project_briefs enable row level security;

drop policy if exists "project_briefs_select_owner" on public.project_briefs;
create policy "project_briefs_select_owner"
on public.project_briefs
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "project_briefs_insert_owner" on public.project_briefs;
create policy "project_briefs_insert_owner"
on public.project_briefs
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "project_briefs_update_owner" on public.project_briefs;
create policy "project_briefs_update_owner"
on public.project_briefs
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "project_briefs_delete_owner" on public.project_briefs;
create policy "project_briefs_delete_owner"
on public.project_briefs
for delete
to authenticated
using (user_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'brief-reference-photos',
  'brief-reference-photos',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "brief_reference_photos_select_owner" on storage.objects;
create policy "brief_reference_photos_select_owner"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'brief-reference-photos'
  and name like auth.uid()::text || '/%'
);

drop policy if exists "brief_reference_photos_insert_owner" on storage.objects;
create policy "brief_reference_photos_insert_owner"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'brief-reference-photos'
  and name like auth.uid()::text || '/%'
);

drop policy if exists "brief_reference_photos_update_owner" on storage.objects;
create policy "brief_reference_photos_update_owner"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'brief-reference-photos'
  and name like auth.uid()::text || '/%'
)
with check (
  bucket_id = 'brief-reference-photos'
  and name like auth.uid()::text || '/%'
);

drop policy if exists "brief_reference_photos_delete_owner" on storage.objects;
create policy "brief_reference_photos_delete_owner"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'brief-reference-photos'
  and name like auth.uid()::text || '/%'
);

commit;
