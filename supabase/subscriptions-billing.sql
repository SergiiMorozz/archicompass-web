-- ArchiCompass subscriptions, VAT-ready billing profiles, and finance controls.
-- Stripe is the payment processor. This migration never stores card data.

begin;

create table if not exists public.billing_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  subject_type text not null check (subject_type in ('designer', 'studio')),
  subject_id uuid not null,
  plan_code text check (plan_code in ('designer_monthly', 'designer_yearly', 'studio_monthly', 'studio_yearly')),
  status text not null default 'trialing'
    check (status in ('trialing', 'active', 'past_due', 'trial_expired', 'cancelled', 'suspended')),
  trial_started_at timestamptz not null default now(),
  trial_ends_at timestamptz not null default (now() + interval '90 days'),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  payment_failure_count integer not null default 0 check (payment_failure_count >= 0),
  billing_email text,
  legal_entity_name text check (legal_entity_name is null or char_length(legal_entity_name) <= 240),
  tax_id text check (tax_id is null or char_length(tax_id) <= 64),
  billing_address_line1 text check (billing_address_line1 is null or char_length(billing_address_line1) <= 240),
  billing_postal_code text check (billing_postal_code is null or char_length(billing_postal_code) <= 32),
  billing_city text check (billing_city is null or char_length(billing_city) <= 120),
  billing_country text not null default 'PL' check (billing_country ~ '^[A-Z]{2}$'),
  manual_access_until timestamptz,
  suspended_reason text check (suspended_reason is null or char_length(suspended_reason) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (subject_type, subject_id)
);

create table if not exists public.billing_invoices (
  id uuid primary key default gen_random_uuid(),
  billing_account_id uuid not null references public.billing_accounts(id) on delete cascade,
  stripe_invoice_id text unique,
  stripe_subscription_id text,
  status text not null default 'draft',
  amount_total integer,
  tax_amount integer,
  currency text not null default 'pln',
  invoice_number text,
  hosted_invoice_url text,
  invoice_pdf_url text,
  issued_at timestamptz,
  due_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stripe_webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

create index if not exists billing_accounts_owner_idx
  on public.billing_accounts (owner_user_id, created_at desc);
create index if not exists billing_accounts_status_idx
  on public.billing_accounts (status, trial_ends_at, current_period_end);
create index if not exists billing_invoices_account_idx
  on public.billing_invoices (billing_account_id, issued_at desc);

create or replace function public.touch_billing_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists billing_accounts_touch_updated_at on public.billing_accounts;
create trigger billing_accounts_touch_updated_at
before update on public.billing_accounts
for each row execute function public.touch_billing_updated_at();

drop trigger if exists billing_invoices_touch_updated_at on public.billing_invoices;
create trigger billing_invoices_touch_updated_at
before update on public.billing_invoices
for each row execute function public.touch_billing_updated_at();

-- Existing designer accounts begin their founder period from this activation.
insert into public.billing_accounts (
  owner_user_id,
  subject_type,
  subject_id,
  billing_email,
  trial_started_at,
  trial_ends_at
)
select
  role_record.user_id,
  'designer',
  role_record.user_id,
  user_record.email,
  now(),
  now() + interval '90 days'
from public.account_roles role_record
join auth.users user_record on user_record.id = role_record.user_id
where role_record.role = 'designer'
on conflict (subject_type, subject_id) do nothing;

create or replace function public.create_designer_billing_account()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  account_email text;
begin
  if new.role = 'designer' then
    select email into account_email from auth.users where id = new.user_id;
    insert into public.billing_accounts (
      owner_user_id,
      subject_type,
      subject_id,
      billing_email,
      trial_started_at,
      trial_ends_at
    )
    values (
      new.user_id,
      'designer',
      new.user_id,
      account_email,
      now(),
      now() + interval '90 days'
    )
    on conflict (subject_type, subject_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists account_roles_create_billing_account on public.account_roles;
create trigger account_roles_create_billing_account
after insert or update of role on public.account_roles
for each row execute function public.create_designer_billing_account();

create or replace function public.create_studio_billing_account()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.billing_accounts (
    owner_user_id,
    subject_type,
    subject_id,
    billing_email,
    trial_started_at,
    trial_ends_at
  )
  values (
    new.owner_id,
    'studio',
    new.id,
    new.email,
    now(),
    now() + interval '90 days'
  )
  on conflict (subject_type, subject_id) do nothing;
  return new;
end;
$$;

drop trigger if exists studios_create_billing_account on public.studios;
create trigger studios_create_billing_account
after insert on public.studios
for each row execute function public.create_studio_billing_account();

alter table public.billing_accounts enable row level security;
alter table public.billing_invoices enable row level security;
alter table public.stripe_webhook_events enable row level security;

revoke all on public.billing_accounts from anon, authenticated;
revoke all on public.billing_invoices from anon, authenticated;
revoke all on public.stripe_webhook_events from anon, authenticated;

grant select on public.billing_accounts to authenticated;
grant update (
  billing_email,
  legal_entity_name,
  tax_id,
  billing_address_line1,
  billing_postal_code,
  billing_city,
  billing_country
) on public.billing_accounts to authenticated;
grant select on public.billing_invoices to authenticated;

create or replace function public.has_admin_permission(required_permission text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.admin_roles role_record
    where role_record.user_id = auth.uid()
      and role_record.active
      and (
        role_record.role = 'owner'
        or (role_record.role = 'admin' and required_permission = any(role_record.permissions))
      )
  );
$$;

revoke all on function public.has_admin_permission(text) from public;
grant execute on function public.has_admin_permission(text) to authenticated;

drop policy if exists "billing_accounts_select_owner_or_finance" on public.billing_accounts;
create policy "billing_accounts_select_owner_or_finance"
on public.billing_accounts
for select
to authenticated
using (owner_user_id = auth.uid() or public.has_admin_permission('finance'));

drop policy if exists "billing_accounts_update_owner_details" on public.billing_accounts;
create policy "billing_accounts_update_owner_details"
on public.billing_accounts
for update
to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

drop policy if exists "billing_invoices_select_owner_or_finance" on public.billing_invoices;
create policy "billing_invoices_select_owner_or_finance"
on public.billing_invoices
for select
to authenticated
using (
  exists (
    select 1 from public.billing_accounts account_record
    where account_record.id = billing_invoices.billing_account_id
      and (account_record.owner_user_id = auth.uid() or public.has_admin_permission('finance'))
  )
);

create or replace function public.billing_access_active(
  account_status text,
  account_trial_ends_at timestamptz,
  account_period_end timestamptz,
  account_manual_access_until timestamptz
)
returns boolean
language sql
stable
set search_path = public, pg_temp
as $$
  select
    coalesce(account_manual_access_until > now(), false)
    or (account_status = 'trialing' and account_trial_ends_at > now())
    or (account_status = 'active' and (account_period_end is null or account_period_end > now()));
$$;

create or replace function public.is_billing_subject_accessible(
  requested_subject_type text,
  requested_subject_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select not exists (
    select 1
    from public.billing_accounts account_record
    where account_record.subject_type = requested_subject_type
      and account_record.subject_id = requested_subject_id
      and not public.billing_access_active(
        account_record.status,
        account_record.trial_ends_at,
        account_record.current_period_end,
        account_record.manual_access_until
      )
  );
$$;

revoke all on function public.is_billing_subject_accessible(text, uuid) from public;
grant execute on function public.is_billing_subject_accessible(text, uuid) to anon, authenticated;

-- Keep unpaid professional profiles out of the public catalogue while retaining
-- their private account, history, and an administrator's ability to restore access.
drop policy if exists "profiles_select_visible_or_authorized" on public.profiles;
create policy "profiles_select_visible_or_authorized"
on public.profiles
for select
to public
using (
  id = auth.uid()
  or public.is_admin()
  or (
    public.is_content_visible('profile', id)
    and public.is_billing_subject_accessible('designer', id)
  )
  or exists (
    select 1
    from public.designer_inquiries inquiry_record
    where (
      inquiry_record.client_id = auth.uid()
      and inquiry_record.designer_id = profiles.id
    ) or (
      inquiry_record.designer_id = auth.uid()
      and inquiry_record.client_id = profiles.id
    )
  )
);

drop policy if exists "projects_select_visible_or_authorized" on public.projects;
create policy "projects_select_visible_or_authorized"
on public.projects
for select
to public
using (
  profile_id = auth.uid()
  or public.is_admin()
  or (
    public.is_content_visible('profile', profile_id)
    and public.is_content_visible('project', id)
    and public.is_billing_subject_accessible('designer', profile_id)
  )
);

drop policy if exists "studios_select_public_or_team" on public.studios;
create policy "studios_select_public_or_team"
on public.studios
for select
to public
using (
  (
    published
    and public.is_content_visible('studio', id)
    and public.is_billing_subject_accessible('studio', id)
  )
  or owner_id = auth.uid()
  or public.is_active_studio_member(id)
  or public.is_admin()
);

drop policy if exists "designer_inquiries_insert_client" on public.designer_inquiries;
create policy "designer_inquiries_insert_client"
on public.designer_inquiries
for insert
to authenticated
with check (
  client_id = auth.uid()
  and public.current_account_role() = 'client'
  and designer_id <> auth.uid()
  and (
    brief_id is null
    or exists (
      select 1
      from public.project_briefs brief_record
      where brief_record.id = brief_id
        and brief_record.user_id = auth.uid()
    )
  )
  and (
    (
      studio_id is null
      and public.is_designer_account(designer_id)
      and public.is_billing_subject_accessible('designer', designer_id)
    )
    or exists (
      select 1
      from public.studios studio_record
      where studio_record.id = studio_id
        and studio_record.owner_id = designer_id
        and studio_record.published
        and public.is_content_visible('studio', studio_record.id)
        and public.is_billing_subject_accessible('studio', studio_record.id)
    )
  )
);

create or replace function public.admin_billing_summary()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.has_admin_permission('finance') then
    raise exception 'Wymagany dostęp do finansów' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'trialing', (select count(*) from public.billing_accounts where status = 'trialing' and trial_ends_at > now()),
    'active', (select count(*) from public.billing_accounts where status = 'active' and public.billing_access_active(status, trial_ends_at, current_period_end, manual_access_until)),
    'payment_issue', (select count(*) from public.billing_accounts where status in ('past_due', 'trial_expired', 'cancelled')),
    'restricted', (select count(*) from public.billing_accounts where not public.billing_access_active(status, trial_ends_at, current_period_end, manual_access_until))
  );
end;
$$;

create or replace function public.admin_billing_directory(
  search_text text default null,
  status_filter text default 'all',
  page_limit integer default 100
)
returns table (
  billing_account_id uuid,
  owner_user_id uuid,
  email text,
  account_name text,
  subject_type text,
  subject_name text,
  effective_status text,
  has_access boolean,
  plan_code text,
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  manual_access_until timestamptz,
  tax_id text,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.has_admin_permission('finance') then
    raise exception 'Wymagany dostęp do finansów' using errcode = '42501';
  end if;

  return query
  with records as (
    select
      billing_record.*,
      user_record.email::text as user_email,
      coalesce(nullif(trim(profile_record.full_name), ''), user_record.email::text) as owner_name,
      case
        when billing_record.subject_type = 'studio' then coalesce(studio_record.name, 'Pracownia')
        else coalesce(nullif(trim(profile_record.full_name), ''), user_record.email::text)
      end as display_subject,
      case
        when billing_record.status = 'trialing' and billing_record.trial_ends_at <= now() then 'trial_expired'
        else billing_record.status
      end as resolved_status,
      public.billing_access_active(
        billing_record.status,
        billing_record.trial_ends_at,
        billing_record.current_period_end,
        billing_record.manual_access_until
      ) as access_active
    from public.billing_accounts billing_record
    join auth.users user_record on user_record.id = billing_record.owner_user_id
    left join public.profiles profile_record on profile_record.id = billing_record.owner_user_id
    left join public.studios studio_record
      on billing_record.subject_type = 'studio'
      and studio_record.id = billing_record.subject_id
  )
  select
    records.id,
    records.owner_user_id,
    records.user_email,
    records.owner_name,
    records.subject_type,
    records.display_subject,
    records.resolved_status,
    records.access_active,
    records.plan_code,
    records.trial_ends_at,
    records.current_period_end,
    records.manual_access_until,
    records.tax_id,
    count(*) over()
  from records
  where (
    nullif(trim(coalesce(search_text, '')), '') is null
    or records.user_email ilike '%' || trim(search_text) || '%'
    or records.owner_name ilike '%' || trim(search_text) || '%'
    or records.display_subject ilike '%' || trim(search_text) || '%'
    or coalesce(records.tax_id, '') ilike '%' || trim(search_text) || '%'
  )
  and (status_filter = 'all' or records.resolved_status = status_filter)
  order by
    case when records.access_active then 1 else 0 end,
    records.trial_ends_at asc nulls last,
    records.created_at desc
  limit greatest(1, least(coalesce(page_limit, 100), 200));
end;
$$;

create or replace function public.admin_set_billing_access(
  target_billing_account_id uuid,
  target_action text,
  action_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  normalized_action text := lower(trim(coalesce(target_action, '')));
  audit_action text;
begin
  if not public.has_admin_permission('finance') then
    raise exception 'Wymagany dostęp do finansów' using errcode = '42501';
  end if;

  if normalized_action = 'extend_trial' then
    update public.billing_accounts
    set
      status = 'trialing',
      trial_ends_at = greatest(coalesce(trial_ends_at, now()), now()) + interval '30 days',
      manual_access_until = null,
      suspended_reason = null
    where id = target_billing_account_id;
    audit_action := 'billing_trial_extended';
  elsif normalized_action = 'restore_access' then
    update public.billing_accounts
    set
      manual_access_until = now() + interval '30 days',
      suspended_reason = null
    where id = target_billing_account_id;
    audit_action := 'billing_access_restored';
  elsif normalized_action = 'restrict' then
    update public.billing_accounts
    set
      status = 'suspended',
      manual_access_until = null,
      suspended_reason = nullif(trim(action_reason), '')
    where id = target_billing_account_id;
    audit_action := 'billing_access_restricted';
  else
    raise exception 'Nieprawidłowa akcja rozliczeniowa' using errcode = '22023';
  end if;

  if not found then
    raise exception 'Nie znaleziono konta rozliczeniowego' using errcode = 'P0002';
  end if;

  insert into public.admin_audit_log (actor_id, action, target_type, target_id, metadata)
  values (
    auth.uid(),
    audit_action,
    'billing_account',
    target_billing_account_id::text,
    jsonb_build_object('reason', nullif(trim(action_reason), ''), 'action', normalized_action)
  );
end;
$$;

revoke all on function public.admin_billing_summary() from public;
revoke all on function public.admin_billing_directory(text, text, integer) from public;
revoke all on function public.admin_set_billing_access(uuid, text, text) from public;
grant execute on function public.admin_billing_summary() to authenticated;
grant execute on function public.admin_billing_directory(text, text, integer) to authenticated;
grant execute on function public.admin_set_billing_access(uuid, text, text) to authenticated;

commit;
