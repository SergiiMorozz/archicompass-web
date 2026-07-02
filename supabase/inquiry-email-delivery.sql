-- Safely record delivery results after an inquiry has been persisted.

begin;

create or replace function public.record_my_inquiry_email_delivery(
  target_inquiry_id uuid,
  delivery_status text,
  delivered_at timestamptz default null,
  delivery_error text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if delivery_status not in ('not_configured', 'sent', 'failed', 'skipped') then
    raise exception 'Invalid email delivery status' using errcode = '22023';
  end if;

  update public.designer_inquiries
  set
    notification_email_status = delivery_status,
    notification_email_sent_at = case when delivery_status = 'sent' then delivered_at else null end,
    notification_email_error = nullif(left(trim(coalesce(delivery_error, '')), 500), ''),
    updated_at = now()
  where id = target_inquiry_id
    and client_id = auth.uid();

  if not found then
    raise exception 'Inquiry not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.record_my_inquiry_email_delivery(uuid, text, timestamptz, text) from public;
grant execute on function public.record_my_inquiry_email_delivery(uuid, text, timestamptz, text) to authenticated;

commit;
