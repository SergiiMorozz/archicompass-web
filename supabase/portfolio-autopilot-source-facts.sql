-- Portfolio Autopilot: separate source-page facts from AI-generated content.
-- A dedicated project page's own title/description are ground truth (object
-- type, area, location, project stage) and must never be overwritten by AI
-- output - the AI's own title lives in a separate ai_title column instead of
-- clobbering suggested_title as it did before.

begin;

alter table public.portfolio_projects
  add column if not exists original_title text,
  add column if not exists ai_title text,
  add column if not exists object_type text,
  add column if not exists area_m2 numeric,
  add column if not exists location text,
  add column if not exists project_stage text,
  add column if not exists original_description text;

alter table public.portfolio_projects
  drop constraint if exists portfolio_projects_project_stage_check;
alter table public.portfolio_projects
  add constraint portfolio_projects_project_stage_check
  check (project_stage is null or project_stage in ('realized', 'concept'));

-- Captured once per crawled page at fetch time (the raw HTML isn't kept
-- around for stepGrouping to re-derive this later).
alter table public.portfolio_import_pages
  add column if not exists original_description text;

commit;
