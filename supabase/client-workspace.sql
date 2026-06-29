-- Client workspace favorites. The generic entity type keeps the table ready
-- for future Inspiration Hub articles without changing the client data model.

begin;

alter table public.project_briefs
  add column if not exists timeline text;

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (
    entity_type in ('designer', 'project', 'article', 'inspiration')
  ),
  entity_key text not null,
  created_at timestamptz not null default now(),
  unique (user_id, entity_type, entity_key)
);

create index if not exists favorites_user_created_idx
  on public.favorites (user_id, created_at desc);

alter table public.favorites enable row level security;

revoke all on table public.favorites from anon, authenticated;
grant select, insert, delete on table public.favorites to authenticated;

drop policy if exists "favorites_select_owner" on public.favorites;
create policy "favorites_select_owner"
on public.favorites
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "favorites_insert_owner" on public.favorites;
create policy "favorites_insert_owner"
on public.favorites
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "favorites_delete_owner" on public.favorites;
create policy "favorites_delete_owner"
on public.favorites
for delete
to authenticated
using (user_id = auth.uid());

commit;
