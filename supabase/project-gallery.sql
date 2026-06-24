-- ArchiCompass project gallery support.
-- Run after `supabase/storage.sql`.
--
-- Keeps existing `image_url` and `image_path` as the primary image fields while
-- adding arrays for project galleries.

begin;

alter table public.projects
add column if not exists image_urls text[] not null default '{}';

alter table public.projects
add column if not exists image_paths text[] not null default '{}';

update public.projects
set image_urls = array[image_url]
where image_url is not null
  and cardinality(image_urls) = 0;

update public.projects
set image_paths = array[image_path]
where image_path is not null
  and cardinality(image_paths) = 0;

commit;
