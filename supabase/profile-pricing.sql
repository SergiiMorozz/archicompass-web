-- Transparent professional pricing and cooperation terms.

begin;

alter table public.profiles
  add column if not exists pricing_model text,
  add column if not exists price_from numeric,
  add column if not exists price_to numeric,
  add column if not exists minimum_project_budget numeric,
  add column if not exists work_modes text[] not null default '{}',
  add column if not exists availability_status text,
  add column if not exists cooperation_terms text;

alter table public.studios
  add column if not exists pricing_model text,
  add column if not exists price_from numeric,
  add column if not exists price_to numeric,
  add column if not exists minimum_project_budget numeric,
  add column if not exists work_modes text[] not null default '{}',
  add column if not exists availability_status text,
  add column if not exists cooperation_terms text;

commit;
