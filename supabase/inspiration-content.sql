-- Inspiration Hub publishing and admin content operations.

begin;

create table if not exists public.inspiration_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 3 and 180),
  excerpt text not null default '' check (char_length(excerpt) <= 700),
  body text not null default '' check (char_length(body) <= 50000),
  category text not null default 'Design' check (char_length(category) between 2 and 80),
  image_url text check (image_url is null or char_length(image_url) <= 1000),
  author_name text check (author_name is null or char_length(author_name) <= 160),
  status text not null default 'draft' check (status in ('draft', 'published')),
  featured boolean not null default false,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists inspiration_articles_public_idx
on public.inspiration_articles (status, featured desc, published_at desc);

alter table public.inspiration_articles enable row level security;
revoke all on public.inspiration_articles from anon, authenticated;
grant select on public.inspiration_articles to anon, authenticated;
grant insert, update, delete on public.inspiration_articles to authenticated;

drop policy if exists "inspiration_articles_select_public_or_admin" on public.inspiration_articles;
create policy "inspiration_articles_select_public_or_admin"
on public.inspiration_articles
for select
to public
using (status = 'published' or public.is_admin());

drop policy if exists "inspiration_articles_insert_admin" on public.inspiration_articles;
create policy "inspiration_articles_insert_admin"
on public.inspiration_articles
for insert
to authenticated
with check (public.is_admin() and created_by = auth.uid() and updated_by = auth.uid());

drop policy if exists "inspiration_articles_update_admin" on public.inspiration_articles;
create policy "inspiration_articles_update_admin"
on public.inspiration_articles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin() and updated_by = auth.uid());

drop policy if exists "inspiration_articles_delete_admin" on public.inspiration_articles;
create policy "inspiration_articles_delete_admin"
on public.inspiration_articles
for delete
to authenticated
using (public.is_admin());

insert into public.inspiration_articles (
  slug,
  title,
  excerpt,
  body,
  category,
  image_url,
  author_name,
  status,
  featured,
  published_at
)
values
  (
    'modern-living-room-trends',
    'Modern Living Room Trends',
    'Warm minimalism, curved furniture, natural textures, and light-driven layouts.',
    E'A modern living room works best when the layout begins with everyday movement, not decoration. Keep the main circulation path clear and group furniture around one strong social focal point.\n\nWarm woods, tactile fabrics, and quieter wall colours make minimal spaces feel lived in rather than empty. Curved forms can soften the room, but they should support comfort and scale instead of becoming a theme.\n\nUse layered lighting: general light for practical use, focused light for reading, and softer accents for the evening. The result should be adaptable, calm, and easy to maintain.',
    'Modern',
    'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?auto=format&fit=crop&w=1600&q=85',
    'ArchiCompass Editorial',
    'published',
    true,
    now()
  ),
  (
    'sustainable-architecture-guide',
    'Sustainable Architecture Guide',
    'How material choices, daylight, and passive design shape better buildings.',
    E'Sustainable design starts before finishes are selected. Orientation, daylight, ventilation, and an efficient plan can reduce energy demand while making a space more comfortable.\n\nPrefer durable materials with transparent sourcing and consider how each layer can be repaired, reused, or recycled. Local products are useful when they also meet the project''s performance needs.\n\nA good sustainability brief balances measurable targets with the client''s budget, maintenance capacity, and long-term plans for the property.',
    'Sustainable',
    'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1600&q=85',
    'ArchiCompass Editorial',
    'published',
    true,
    now() - interval '1 day'
  ),
  (
    'minimalist-kitchen-design',
    'Minimalist Kitchen Design',
    'Storage, lighting, and quiet surfaces for kitchens that age beautifully.',
    E'Minimalist kitchens are not defined by having fewer things. They work because storage, preparation, cooking, and cleaning have been organised around real habits.\n\nStart with the items used every day and place them close to the relevant work zone. Full-height storage can reduce visual noise, while open shelves should be reserved for objects that are genuinely useful or meaningful.\n\nChoose a restrained material palette, practical worktop lighting, and hardware that can withstand repeated use. Simplicity is the result of detailed planning.',
    'Minimalist',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    'ArchiCompass Editorial',
    'published',
    true,
    now() - interval '2 days'
  )
on conflict (slug) do nothing;

commit;
