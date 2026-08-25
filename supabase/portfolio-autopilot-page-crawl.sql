-- Portfolio Autopilot: multi-page site crawling.
-- Adds the page queue that lets a website import crawl beyond the single
-- entry URL (see supabase/portfolio-autopilot.sql for the base tables).
-- Run after supabase/portfolio-autopilot.sql.

begin;

create table if not exists public.portfolio_import_pages (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.portfolio_import_jobs(id) on delete cascade,
  page_url text not null,
  status text not null default 'pending' check (status in ('pending', 'done', 'failed')),
  error text,
  created_at timestamptz not null default now()
);

create index if not exists portfolio_import_pages_job_idx
  on public.portfolio_import_pages (job_id, status);

alter table public.portfolio_import_pages enable row level security;
revoke all on public.portfolio_import_pages from anon;
grant select, insert, update on public.portfolio_import_pages to authenticated;

drop policy if exists "portfolio_import_pages_select_owner_or_admin" on public.portfolio_import_pages;
create policy "portfolio_import_pages_select_owner_or_admin"
on public.portfolio_import_pages
for select
to authenticated
using (
  private.is_admin()
  or exists (
    select 1 from public.portfolio_import_jobs job
    where job.id = portfolio_import_pages.job_id and job.user_id = auth.uid()
  )
);

drop policy if exists "portfolio_import_pages_insert_owner" on public.portfolio_import_pages;
create policy "portfolio_import_pages_insert_owner"
on public.portfolio_import_pages
for insert
to authenticated
with check (
  exists (
    select 1 from public.portfolio_import_jobs job
    where job.id = portfolio_import_pages.job_id and job.user_id = auth.uid()
  )
);

drop policy if exists "portfolio_import_pages_update_owner" on public.portfolio_import_pages;
create policy "portfolio_import_pages_update_owner"
on public.portfolio_import_pages
for update
to authenticated
using (
  exists (
    select 1 from public.portfolio_import_jobs job
    where job.id = portfolio_import_pages.job_id and job.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.portfolio_import_jobs job
    where job.id = portfolio_import_pages.job_id and job.user_id = auth.uid()
  )
);

commit;
