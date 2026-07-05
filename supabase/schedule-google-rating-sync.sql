-- Run after CRON_SECRET, SUPABASE_SERVICE_ROLE_KEY, and GOOGLE_PLACES_API_KEY
-- are configured in Vercel. Reuses the Vault secret created for email reminders.

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select cron.unschedule(jobid)
from cron.job
where jobname = 'archicompass-google-rating-sync';

select cron.schedule(
  'archicompass-google-rating-sync',
  '15 3 * * *',
  $job$
    select net.http_get(
      url := 'https://archicompass.pl/api/cron/google-rating-sync',
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
