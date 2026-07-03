-- External Google Business rating details supplied by professionals.
-- Individual review text remains on Google; ArchiCompass stores only the link and summary.

begin;

alter table public.profiles
  add column if not exists google_business_url text,
  add column if not exists google_place_id text,
  add column if not exists google_rating numeric(2,1)
    check (google_rating is null or google_rating between 1 and 5),
  add column if not exists google_review_count integer
    check (google_review_count is null or google_review_count >= 0),
  add column if not exists google_rating_updated_at timestamptz;

alter table public.studios
  add column if not exists google_business_url text,
  add column if not exists google_place_id text,
  add column if not exists google_rating numeric(2,1)
    check (google_rating is null or google_rating between 1 and 5),
  add column if not exists google_review_count integer
    check (google_review_count is null or google_review_count >= 0),
  add column if not exists google_rating_updated_at timestamptz;

commit;
