-- Portfolio Autopilot: designer-editable project description in the review
-- step (previously only the title was editable; the AI summary was
-- read-only and was never even carried through to the published project).

begin;

alter table public.portfolio_projects
  add column if not exists custom_summary text;

commit;
