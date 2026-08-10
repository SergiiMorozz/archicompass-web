-- Generic daily rate limit for authenticated write actions (designer
-- inquiries, favorites, portfolio projects). Mirrors the quota pattern in
-- style-analysis-rate-limit.sql but keys usage by real user id instead of a
-- hashed guest identity, since these actions always require a logged-in
-- account.
begin;

create table if not exists public.action_quota_daily_usage (
  usage_date date not null default current_date,
  actor_id uuid not null references auth.users(id) on delete cascade,
  action_key text not null check (action_key ~ '^[a-z0-9_]{1,64}$'),
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (usage_date, actor_id, action_key)
);

alter table public.action_quota_daily_usage enable row level security;
revoke all on public.action_quota_daily_usage from anon, authenticated;

create or replace function public.consume_action_quota(
  target_actor_id uuid,
  target_action_key text,
  daily_limit integer
)
returns table (
  allowed boolean,
  remaining integer,
  reset_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  new_count integer;
begin
  if target_action_key !~ '^[a-z0-9_]{1,64}$' then
    raise exception 'Invalid quota action' using errcode = '22023';
  end if;
  if daily_limit < 1 or daily_limit > 1000 then
    raise exception 'Invalid daily limit' using errcode = '22023';
  end if;

  insert into public.action_quota_daily_usage (
    usage_date,
    actor_id,
    action_key,
    request_count,
    updated_at
  )
  values (current_date, target_actor_id, target_action_key, 1, now())
  on conflict (usage_date, actor_id, action_key) do update
  set
    request_count = public.action_quota_daily_usage.request_count + 1,
    updated_at = now()
  where public.action_quota_daily_usage.request_count < daily_limit
  returning request_count into new_count;

  if new_count is null then
    return query select false, 0, date_trunc('day', now()) + interval '1 day';
    return;
  end if;

  return query select
    true,
    greatest(daily_limit - new_count, 0),
    date_trunc('day', now()) + interval '1 day';
end;
$$;

revoke all on function public.consume_action_quota(uuid, text, integer) from public;
revoke all on function public.consume_action_quota(uuid, text, integer) from anon, authenticated;
-- Called only with the service-role key from trusted server code paths.

commit;
