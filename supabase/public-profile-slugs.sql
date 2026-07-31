-- Human-readable, stable public URLs for professional profiles.
-- Existing UUID URLs keep working in the app and redirect to the canonical slug.

begin;

alter table public.profiles
  add column if not exists public_slug text;

create or replace function public.profile_public_slug_base(source_value text, profile_id uuid)
returns text
language sql
immutable
as $$
  select coalesce(
    nullif(
      left(
        trim(both '-' from regexp_replace(
          translate(lower(coalesce(source_value, '')), 'ąćęłńóśźż', 'acelnoszz'),
          '[^a-z0-9]+',
          '-',
          'g'
        )),
        72
      ),
      ''
    ),
    'profile-' || left(profile_id::text, 8)
  );
$$;

create or replace function public.assign_profile_public_slug()
returns trigger
language plpgsql
as $$
declare
  base_slug text;
  candidate_slug text;
  suffix integer := 2;
  automatic_fallback text;
begin
  if new.user_type is distinct from 'professional' then
    new.public_slug := null;
    return new;
  end if;

  automatic_fallback := public.profile_public_slug_base(null, new.id);

  if new.public_slug is null
     or btrim(new.public_slug) = ''
     or (
       tg_op = 'UPDATE'
       and old.full_name is distinct from new.full_name
       and old.public_slug = automatic_fallback
     ) then
    base_slug := public.profile_public_slug_base(new.full_name, new.id);
  else
    base_slug := public.profile_public_slug_base(new.public_slug, new.id);
  end if;

  candidate_slug := base_slug;
  while exists (
    select 1
    from public.profiles profile
    where profile.public_slug = candidate_slug
      and profile.id <> new.id
  ) loop
    candidate_slug := left(base_slug, 66) || '-' || suffix;
    suffix := suffix + 1;
  end loop;

  new.public_slug := candidate_slug;
  return new;
end;
$$;

alter function public.profile_public_slug_base(text, uuid) set search_path = '';
alter function public.assign_profile_public_slug() set search_path = '';

drop trigger if exists profiles_assign_public_slug on public.profiles;
create trigger profiles_assign_public_slug
before insert or update of full_name, user_type, public_slug on public.profiles
for each row execute function public.assign_profile_public_slug();

update public.profiles
set public_slug = null
where user_type = 'professional'
  and public_slug is null;

create unique index if not exists profiles_public_slug_unique_idx
  on public.profiles (public_slug)
  where public_slug is not null;

alter table public.profiles
  drop constraint if exists profiles_public_slug_format;
alter table public.profiles
  add constraint profiles_public_slug_format
  check (public_slug is null or public_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');

commit;
