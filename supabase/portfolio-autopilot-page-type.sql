-- Portfolio Autopilot: page-type classification for crawled pages.
-- Distinguishes a dedicated project/album detail page (strong project
-- boundary evidence) from a portfolio index, homepage, or an about/services
-- page that may incidentally contain interior photos - see
-- classifyDiscoveredPageType() and stepGrouping()'s use of it.

begin;

alter table public.portfolio_import_pages
  add column if not exists page_type text not null default 'generic'
    check (page_type in ('homepage', 'portfolio_index', 'portfolio_project_detail', 'about', 'generic'));

commit;
