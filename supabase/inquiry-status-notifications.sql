-- Keep inquiry status changes and client notifications in one transaction.

begin;

create or replace function public.update_inquiry_status_with_message(
  target_inquiry_id uuid,
  new_status text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_status text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if new_status not in ('reviewing', 'accepted', 'declined') then
    raise exception 'Choose a valid request status' using errcode = '22023';
  end if;

  if not public.can_manage_inquiry(target_inquiry_id) then
    raise exception 'This conversation is not available' using errcode = '42501';
  end if;

  select inquiry_record.status
  into current_status
  from public.designer_inquiries inquiry_record
  where inquiry_record.id = target_inquiry_id
  for update;

  if current_status is null then
    raise exception 'This conversation is not available' using errcode = 'P0002';
  end if;

  if current_status = new_status then
    return;
  end if;

  update public.designer_inquiries
  set status = new_status, updated_at = now()
  where id = target_inquiry_id;

  insert into public.inquiry_messages (inquiry_id, sender_id, body)
  values (
    target_inquiry_id,
    auth.uid(),
    'Request status changed to ' || initcap(new_status) || '.'
  );
end;
$$;

revoke all on function public.update_inquiry_status_with_message(uuid, text) from public;
grant execute on function public.update_inquiry_status_with_message(uuid, text) to authenticated;

commit;
