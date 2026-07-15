-- Public profile and studio copy can be entered in Polish and English.
-- Legacy fields remain populated with the preferred available value so older
-- readers continue to receive a useful fallback during the locale migration.

begin;

alter table public.profiles
  add column if not exists profile_headline_pl text,
  add column if not exists profile_headline_en text,
  add column if not exists bio_pl text,
  add column if not exists bio_en text,
  add column if not exists cooperation_terms_pl text,
  add column if not exists cooperation_terms_en text;

alter table public.studios
  add column if not exists profile_headline_pl text,
  add column if not exists profile_headline_en text,
  add column if not exists bio_pl text,
  add column if not exists bio_en text,
  add column if not exists cooperation_terms_pl text,
  add column if not exists cooperation_terms_en text;

update public.profiles
set
  profile_headline_pl = coalesce(profile_headline_pl, profile_headline),
  bio_pl = coalesce(bio_pl, bio),
  cooperation_terms_pl = coalesce(cooperation_terms_pl, cooperation_terms)
where profile_headline_pl is null
   or bio_pl is null
   or cooperation_terms_pl is null;

update public.studios
set
  profile_headline_pl = coalesce(profile_headline_pl, profile_headline),
  bio_pl = coalesce(bio_pl, bio),
  cooperation_terms_pl = coalesce(cooperation_terms_pl, cooperation_terms)
where profile_headline_pl is null
   or bio_pl is null
   or cooperation_terms_pl is null;

commit;
