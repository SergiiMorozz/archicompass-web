-- Professional and studio profile completion: bilingual, service packages,
-- transparent career stage, and secure owner-initiated studio deletion.

begin;

alter table public.profiles add column if not exists languages text[] not null default '{}';
alter table public.profiles add column if not exists career_stage text;
alter table public.profiles add column if not exists custom_specialties_pl text[] not null default '{}';
alter table public.profiles add column if not exists custom_specialties_en text[] not null default '{}';
alter table public.profiles add column if not exists service_offerings jsonb not null default '[]'::jsonb;
alter table public.profiles add column if not exists contact_availability_pl text;
alter table public.profiles add column if not exists contact_availability_en text;

alter table public.studios add column if not exists languages text[] not null default '{}';
alter table public.studios add column if not exists career_stage text;
alter table public.studios add column if not exists custom_specialties_pl text[] not null default '{}';
alter table public.studios add column if not exists custom_specialties_en text[] not null default '{}';
alter table public.studios add column if not exists service_offerings jsonb not null default '[]'::jsonb;
alter table public.studios add column if not exists contact_availability_pl text;
alter table public.studios add column if not exists contact_availability_en text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_career_stage_check') then
    alter table public.profiles add constraint profiles_career_stage_check
      check (career_stage is null or career_stage in ('student', 'recent_graduate', 'early_career', 'established'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'studios_career_stage_check') then
    alter table public.studios add constraint studios_career_stage_check
      check (career_stage is null or career_stage in ('student', 'recent_graduate', 'early_career', 'established'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_service_offerings_array_check') then
    alter table public.profiles add constraint profiles_service_offerings_array_check
      check (jsonb_typeof(service_offerings) = 'array');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'studios_service_offerings_array_check') then
    alter table public.studios add constraint studios_service_offerings_array_check
      check (jsonb_typeof(service_offerings) = 'array');
  end if;
end
$$;

create index if not exists profiles_career_stage_idx on public.profiles (career_stage);
create index if not exists studios_career_stage_idx on public.studios (career_stage);

grant delete on public.studios to authenticated;
drop policy if exists "studios_delete_owner" on public.studios;
create policy "studios_delete_owner"
on public.studios
for delete
to authenticated
using (owner_id = (select auth.uid()));

commit;
