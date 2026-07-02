-- Run after adding CRON_SECRET and SUPABASE_SERVICE_ROLE_KEY to Vercel.
-- Replace <CRON_SECRET> with the same random value used in Vercel.

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select vault.create_secret(
  '<CRON_SECRET>',
  'archicompass_unread_reminder_cron_secret',
  'Authorization token for the hourly unread-message reminder job'
)
where not exists (
  select 1
  from vault.decrypted_secrets
  where name = 'archicompass_unread_reminder_cron_secret'
);

select cron.unschedule(jobid)
from cron.job
where jobname = 'archicompass-unread-message-reminders';

select cron.schedule(
  'archicompass-unread-message-reminders',
  '0 * * * *',
  $job$
    select net.http_get(
      url := 'https://archicompass-web-cqyf.vercel.app/api/cron/unread-message-reminders',
      headers := jsonb_build_object(
        'Authorization',
        'Bearer ' || (
          select decrypted_secret
          from vault.decrypted_secrets
          where name = 'archicompass_unread_reminder_cron_secret'
        )
      ),
      timeout_milliseconds := 50000
    );
  $job$
);
