-- Makes Portfolio Autopilot independent of an open browser tab. A server
-- worker leases each active job, and completion-email state is persisted so a
-- finished import is notified once even after retries.

begin;

alter table public.portfolio_import_jobs
  add column if not exists locale text,
  add column if not exists worker_lease_expires_at timestamptz,
  add column if not exists completion_email_status text,
  add column if not exists completion_email_attempts integer,
  add column if not exists completion_email_last_attempt_at timestamptz,
  add column if not exists completion_email_sent_at timestamptz,
  add column if not exists completion_email_error text;

update public.portfolio_import_jobs
set locale = coalesce(locale, 'pl'),
    completion_email_status = coalesce(completion_email_status, 'pending'),
    completion_email_attempts = coalesce(completion_email_attempts, 0);

alter table public.portfolio_import_jobs
  alter column locale set default 'pl',
  alter column locale set not null,
  alter column completion_email_status set default 'pending',
  alter column completion_email_status set not null,
  alter column completion_email_attempts set default 0,
  alter column completion_email_attempts set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'portfolio_import_jobs_locale_check'
  ) then
    alter table public.portfolio_import_jobs
      add constraint portfolio_import_jobs_locale_check check (locale in ('pl', 'en'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'portfolio_import_jobs_completion_email_status_check'
  ) then
    alter table public.portfolio_import_jobs
      add constraint portfolio_import_jobs_completion_email_status_check
      check (completion_email_status in ('pending', 'sending', 'sent', 'failed', 'skipped'));
  end if;
end;
$$;

-- Existing completed imports predate this notification feature. Do not send a
-- surprise email for them after the worker is first enabled.
update public.portfolio_import_jobs
set completion_email_status = 'skipped',
    completion_email_error = 'Completion predates background notifications.'
where status in ('READY_FOR_REVIEW', 'PUBLISHED')
  and completion_email_status = 'pending';

create index if not exists portfolio_import_jobs_worker_idx
  on public.portfolio_import_jobs (status, worker_lease_expires_at, created_at)
  where status in ('QUEUED', 'FETCHING', 'EXTRACTING', 'GROUPING', 'ANALYZING', 'BUILDING_PROFILE');

create index if not exists portfolio_import_jobs_completion_email_idx
  on public.portfolio_import_jobs (completion_email_status, completion_email_last_attempt_at, updated_at)
  where status in ('READY_FOR_REVIEW', 'PUBLISHED');

commit;
