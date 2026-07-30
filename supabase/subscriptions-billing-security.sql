begin;

-- These functions are invoked only by database triggers. They must not be
-- callable through Supabase RPC by anonymous or authenticated users.
revoke all on function public.create_designer_billing_account() from public;
revoke all on function public.create_studio_billing_account() from public;

-- Service-role webhook processing bypasses RLS. The explicit deny policy makes
-- the intended lack of direct client access clear to Supabase's security check.
drop policy if exists "No direct access to Stripe webhook events" on public.stripe_webhook_events;
create policy "No direct access to Stripe webhook events"
on public.stripe_webhook_events
for all
using (false)
with check (false);

commit;
