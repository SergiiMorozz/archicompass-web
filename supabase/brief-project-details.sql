-- Structured Project Compass details and professional service capabilities.

begin;

alter table public.project_briefs
  add column if not exists area_m2 numeric,
  add column if not exists room_count integer,
  add column if not exists room_types text[] not null default '{}',
  add column if not exists property_status text,
  add column if not exists visualization_need text,
  add column if not exists supervision_need text;

alter table public.profiles
  add column if not exists service_capabilities text[] not null default '{}';

alter table public.studios
  add column if not exists service_capabilities text[] not null default '{}';

commit;
