begin;

alter table public.projects
add column if not exists project_url text;

commit;
