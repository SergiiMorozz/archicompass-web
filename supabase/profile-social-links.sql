begin;

alter table public.profiles
  add column if not exists instagram_url text,
  add column if not exists facebook_url text,
  add column if not exists behance_url text,
  add column if not exists linkedin_url text;

alter table public.studios
  add column if not exists instagram_url text,
  add column if not exists facebook_url text,
  add column if not exists behance_url text,
  add column if not exists linkedin_url text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_social_url_length'
  ) then
    alter table public.profiles
      add constraint profiles_social_url_length check (
        coalesce(char_length(instagram_url), 0) <= 500
        and coalesce(char_length(facebook_url), 0) <= 500
        and coalesce(char_length(behance_url), 0) <= 500
        and coalesce(char_length(linkedin_url), 0) <= 500
      );
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'studios_social_url_length'
  ) then
    alter table public.studios
      add constraint studios_social_url_length check (
        coalesce(char_length(instagram_url), 0) <= 500
        and coalesce(char_length(facebook_url), 0) <= 500
        and coalesce(char_length(behance_url), 0) <= 500
        and coalesce(char_length(linkedin_url), 0) <= 500
      );
  end if;
end $$;

commit;
