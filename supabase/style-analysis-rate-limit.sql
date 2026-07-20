-- Daily AI photo-analysis quota for guests and signed-in accounts.
begin;

create table if not exists public.style_analysis_daily_usage (
  usage_date date not null default current_date,
  actor_hash text not null check (actor_hash ~ '^[0-9a-f]{64}$'),
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (usage_date, actor_hash)
);

alter table public.style_analysis_daily_usage enable row level security;
revoke all on public.style_analysis_daily_usage from anon, authenticated;

create or replace function public.consume_style_analysis_quota(
  target_actor_hash text,
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
  if target_actor_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid quota identity' using errcode = '22023';
  end if;
  if daily_limit < 1 or daily_limit > 100 then
    raise exception 'Invalid daily limit' using errcode = '22023';
  end if;

  insert into public.style_analysis_daily_usage (
    usage_date,
    actor_hash,
    request_count,
    updated_at
  )
  values (current_date, target_actor_hash, 1, now())
  on conflict (usage_date, actor_hash) do update
  set
    request_count = public.style_analysis_daily_usage.request_count + 1,
    updated_at = now()
  where public.style_analysis_daily_usage.request_count < daily_limit
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

revoke all on function public.consume_style_analysis_quota(text, integer) from public;
revoke all on function public.consume_style_analysis_quota(text, integer) from anon, authenticated;
-- The public AI endpoint calls this only with the service-role key.
-- Keeping it server-only prevents clients from bypassing the daily limit.

commit;
