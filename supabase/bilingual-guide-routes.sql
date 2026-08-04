-- Applied to production as the `add_bilingual_guide_routing` migration.
-- Existing Inspiration Hub articles keep their current URLs. Guides receive
-- separate locale-specific public slugs for correct canonical and hreflang URLs.

begin;

alter table public.inspiration_articles
  add column if not exists content_section text not null default 'inspiration',
  add column if not exists slug_pl text,
  add column if not exists slug_en text;

alter table public.inspiration_articles
  drop constraint if exists inspiration_articles_content_section_check;

alter table public.inspiration_articles
  add constraint inspiration_articles_content_section_check
  check (content_section in ('inspiration', 'guide'));

update public.inspiration_articles
set
  slug_pl = coalesce(nullif(slug_pl, ''), slug),
  slug_en = coalesce(nullif(slug_en, ''), slug)
where slug_pl is null or slug_en is null;

create unique index if not exists inspiration_articles_slug_pl_unique
  on public.inspiration_articles (slug_pl)
  where slug_pl is not null;

create unique index if not exists inspiration_articles_slug_en_unique
  on public.inspiration_articles (slug_en)
  where slug_en is not null;

create index if not exists inspiration_articles_public_listing_idx
  on public.inspiration_articles (content_section, status, noindex, featured desc, published_at desc);

commit;
