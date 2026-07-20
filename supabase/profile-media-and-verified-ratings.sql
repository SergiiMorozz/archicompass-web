begin;

alter table public.profiles
  add column if not exists profile_headline text,
  add column if not exists profile_logo_path text,
  add column if not exists profile_banner_path text;

alter table public.studios
  add column if not exists profile_headline text,
  add column if not exists profile_logo_path text,
  add column if not exists profile_banner_path text;

-- Remove legacy values that were typed manually before Google verification existed.
update public.profiles
set google_business_url = null,
    google_rating = null,
    google_review_count = null,
    google_rating_updated_at = null
where google_place_id is null;

update public.studios
set google_business_url = null,
    google_rating = null,
    google_review_count = null,
    google_rating_updated_at = null
where google_place_id is null;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-media',
  'profile-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- The bucket is public, so direct image URLs remain readable. No broad SELECT
-- policy is needed; removing it prevents listing the entire bucket through the API.
drop policy if exists "Public profile media is readable" on storage.objects;

drop policy if exists "Professionals upload own profile media" on storage.objects;
create policy "Professionals upload own profile media"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'profile-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Professionals update own profile media" on storage.objects;
create policy "Professionals update own profile media"
on storage.objects for update to authenticated
using (
  bucket_id = 'profile-media'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'profile-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Professionals delete own profile media" on storage.objects;
create policy "Professionals delete own profile media"
on storage.objects for delete to authenticated
using (
  bucket_id = 'profile-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

commit;
