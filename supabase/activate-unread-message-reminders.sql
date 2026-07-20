-- Activates the hourly reminder job after CRON_SECRET is configured in Vercel
-- and stored in Supabase Vault as archicompass_unread_reminder_cron_secret.

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

do $$
begin
  if not exists (
    select 1
    from vault.secrets
    where name = 'archicompass_unread_reminder_cron_secret'
  ) then
    raise exception 'Missing Vault secret: archicompass_unread_reminder_cron_secret';
  end if;
end;
$$;

select cron.unschedule(jobid)
from cron.job
where jobname = 'archicompass-unread-message-reminders';

select cron.schedule(
  'archicompass-unread-message-reminders',
  '0 * * * *',
  $job$
    select net.http_get(
      url := 'https://archicompass.pl/api/cron/unread-message-reminders',
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
