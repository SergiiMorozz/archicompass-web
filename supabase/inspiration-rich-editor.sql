-- Rich, bilingual Inspiration Hub articles.
-- Run this after supabase/inspiration-content.sql in the Supabase SQL Editor.

begin;

alter table public.inspiration_articles
  add column if not exists title_pl text,
  add column if not exists title_en text,
  add column if not exists excerpt_pl text,
  add column if not exists excerpt_en text,
  add column if not exists author_name_pl text,
  add column if not exists author_name_en text,
  add column if not exists cover_alt_pl text,
  add column if not exists cover_alt_en text,
  add column if not exists meta_title_pl text,
  add column if not exists meta_title_en text,
  add column if not exists meta_description_pl text,
  add column if not exists meta_description_en text,
  add column if not exists focus_keyword_pl text,
  add column if not exists focus_keyword_en text,
  add column if not exists content_blocks jsonb not null default '[]'::jsonb,
  add column if not exists noindex boolean not null default false;

alter table public.inspiration_articles
  drop constraint if exists inspiration_articles_title_pl_length,
  add constraint inspiration_articles_title_pl_length
    check (title_pl is null or char_length(title_pl) between 3 and 180),
  drop constraint if exists inspiration_articles_title_en_length,
  add constraint inspiration_articles_title_en_length
    check (title_en is null or char_length(title_en) between 3 and 180),
  drop constraint if exists inspiration_articles_excerpt_pl_length,
  add constraint inspiration_articles_excerpt_pl_length
    check (excerpt_pl is null or char_length(excerpt_pl) <= 700),
  drop constraint if exists inspiration_articles_excerpt_en_length,
  add constraint inspiration_articles_excerpt_en_length
    check (excerpt_en is null or char_length(excerpt_en) <= 700),
  drop constraint if exists inspiration_articles_meta_title_pl_length,
  add constraint inspiration_articles_meta_title_pl_length
    check (meta_title_pl is null or char_length(meta_title_pl) <= 180),
  drop constraint if exists inspiration_articles_meta_title_en_length,
  add constraint inspiration_articles_meta_title_en_length
    check (meta_title_en is null or char_length(meta_title_en) <= 180),
  drop constraint if exists inspiration_articles_meta_description_pl_length,
  add constraint inspiration_articles_meta_description_pl_length
    check (meta_description_pl is null or char_length(meta_description_pl) <= 360),
  drop constraint if exists inspiration_articles_meta_description_en_length,
  add constraint inspiration_articles_meta_description_en_length
    check (meta_description_en is null or char_length(meta_description_en) <= 360),
  drop constraint if exists inspiration_articles_content_blocks_array,
  add constraint inspiration_articles_content_blocks_array
    check (jsonb_typeof(content_blocks) = 'array');

-- Existing records keep their original content as the English fallback. The
-- Polish public copy already present in the application remains intact.
update public.inspiration_articles
set
  title_en = coalesce(nullif(title_en, ''), title),
  excerpt_en = coalesce(nullif(excerpt_en, ''), excerpt),
  author_name_en = coalesce(nullif(author_name_en, ''), author_name)
where title_en is null or excerpt_en is null or author_name_en is null;

create index if not exists inspiration_articles_public_indexable_idx
  on public.inspiration_articles (status, noindex, featured desc, published_at desc);

commit;
