-- Apply before releasing the 28 August 2026 legal-document update.
-- Existing accounts remain valid; this applies the new evidence fields and
-- required version only to accounts created after the migration.
begin;

alter table public.legal_acceptances
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists privacy_acknowledged_at timestamptz;

update public.legal_acceptances
set
  terms_accepted_at = coalesce(terms_accepted_at, accepted_at, created_at, now()),
  privacy_acknowledged_at = coalesce(privacy_acknowledged_at, accepted_at, created_at, now())
where terms_accepted_at is null or privacy_acknowledged_at is null;

alter table public.legal_acceptances
  alter column terms_accepted_at set not null,
  alter column privacy_acknowledged_at set not null;

create or replace function private.capture_required_legal_acceptance()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  acceptance jsonb := coalesce(new.raw_user_meta_data -> 'legal_acceptance', '{}'::jsonb);
  required_version constant text := '2026-08-28';
begin
  if acceptance ->> 'terms_version' <> required_version
    or acceptance ->> 'privacy_version' <> required_version
    or acceptance ->> 'cookies_version' <> required_version
    or acceptance ->> 'ai_transparency_version' <> required_version
    or acceptance ->> 'terms_accepted' <> 'true'
    or acceptance ->> 'privacy_acknowledged' <> 'true'
    or acceptance ->> 'locale' not in ('pl', 'en') then
    raise exception using
      errcode = 'P0001',
      message = 'Required legal acceptance is missing or invalid.';
  end if;

  insert into public.legal_acceptances (
    user_id,
    terms_version,
    privacy_version,
    cookies_version,
    ai_transparency_version,
    terms_accepted_at,
    privacy_acknowledged_at,
    accepted_locale
  )
  values (
    new.id,
    acceptance ->> 'terms_version',
    acceptance ->> 'privacy_version',
    acceptance ->> 'cookies_version',
    acceptance ->> 'ai_transparency_version',
    now(),
    now(),
    acceptance ->> 'locale'
  )
  on conflict (user_id, terms_version, privacy_version, cookies_version, ai_transparency_version)
  do nothing;

  return new;
end;
$$;

revoke all on function private.capture_required_legal_acceptance() from public, anon, authenticated;
grant usage on schema private to supabase_auth_admin;
grant execute on function private.capture_required_legal_acceptance() to supabase_auth_admin;

commit;
