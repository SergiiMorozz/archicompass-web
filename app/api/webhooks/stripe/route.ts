import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createStripeClient, stripeStatusToBillingStatus, unixToIso } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function stringId(value: string | { id: string } | null | undefined) {
  return typeof value === "string" ? value : value?.id || null;
}

function taxAmount(invoice: Stripe.Invoice) {
  const taxRows = (invoice as unknown as { total_tax_amounts?: Array<{ amount?: number | null }> }).total_tax_amounts || [];
  return taxRows.reduce((sum: number, item) => sum + (item.amount || 0), 0);
}

async function syncSubscription(subscription: Stripe.Subscription, accountId?: string | null) {
  const supabase = createSupabaseAdminClient();
  const metadataAccountId = subscription.metadata?.archicompass_billing_account_id || null;
  const targetAccountId = accountId || metadataAccountId;
  const update = {
    cancel_at_period_end: subscription.cancel_at_period_end,
    current_period_end: unixToIso((subscription as unknown as { current_period_end?: number }).current_period_end),
    payment_failure_count: subscription.status === "past_due" ? 1 : 0,
    plan_code: subscription.metadata?.archicompass_plan_code || null,
    status: stripeStatusToBillingStatus(subscription.status),
    stripe_customer_id: stringId(subscription.customer),
    stripe_price_id: subscription.items.data[0]?.price.id || null,
    stripe_subscription_id: subscription.id,
  };
  if (targetAccountId) {
    await supabase.from("billing_accounts").update(update).eq("id", targetAccountId);
  } else {
    await supabase.from("billing_accounts").update(update).eq("stripe_subscription_id", subscription.id);
  }
}

async function syncInvoice(invoice: Stripe.Invoice) {
  const supabase = createSupabaseAdminClient();
  const subscriptionId = stringId((invoice as unknown as { subscription?: string | { id: string } | null }).subscription);
  const metadataAccountId = invoice.metadata?.archicompass_billing_account_id || null;
  const { data: billingAccount } = metadataAccountId
    ? await supabase.from("billing_accounts").select("id").eq("id", metadataAccountId).maybeSingle()
    : subscriptionId
      ? await supabase.from("billing_accounts").select("id").eq("stripe_subscription_id", subscriptionId).maybeSingle()
      : { data: null };
  if (!billingAccount?.id) return;

  await supabase.from("billing_invoices").upsert(
    {
      amount_total: invoice.amount_paid || invoice.total || null,
      billing_account_id: billingAccount.id,
      currency: invoice.currency || "pln",
      due_date: unixToIso(invoice.due_date),
      hosted_invoice_url: invoice.hosted_invoice_url,
      invoice_number: invoice.number,
      invoice_pdf_url: invoice.invoice_pdf,
      issued_at: unixToIso(invoice.created),
      status: invoice.status || "open",
      stripe_invoice_id: invoice.id,
      stripe_subscription_id: subscriptionId,
      tax_amount: taxAmount(invoice),
    },
    { onConflict: "stripe_invoice_id" }
  );
}

export async function POST(request: Request) {
  const stripe = createStripeClient();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!stripe || !secret || !signature) return NextResponse.json({ error: "Webhook is not configured." }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: knownEvent } = await supabase
    .from("stripe_webhook_events")
    .select("stripe_event_id")
    .eq("stripe_event_id", event.id)
    .maybeSingle();
  if (knownEvent) return NextResponse.json({ received: true, duplicate: true });

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const accountId = session.client_reference_id || session.metadata?.archicompass_billing_account_id || null;
    const subscriptionId = stringId(session.subscription);
    if (accountId && subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await syncSubscription(subscription, accountId);
    }
  } else if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    await syncSubscription(event.data.object as Stripe.Subscription);
  } else if (event.type === "invoice.payment_succeeded" || event.type === "invoice.payment_failed" || event.type === "invoice.finalized") {
    await syncInvoice(event.data.object as Stripe.Invoice);
  }

  await supabase.from("stripe_webhook_events").insert({ stripe_event_id: event.id, event_type: event.type });
  return NextResponse.json({ received: true });
}
