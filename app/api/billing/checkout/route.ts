import { NextResponse } from "next/server";
import { billingPlans, configuredStripePrice, isBillingPlanCode } from "@/lib/billing";
import { getBillingCopy } from "@/content/billing-copy";
import { billingAppUrl, createStripeClient } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { accountId?: unknown; planCode?: unknown } | null;
  const accountId = typeof body?.accountId === "string" ? body.accountId : "";
  const planCode = typeof body?.planCode === "string" ? body.planCode : "";
  if (!isUuid(accountId) || !isBillingPlanCode(planCode)) {
    return NextResponse.json({ error: "Invalid billing selection." }, { status: 400 });
  }

  const plan = billingPlans[planCode];
  const priceId = configuredStripePrice(planCode);
  const stripe = createStripeClient();
  if (!stripe || !priceId) {
    return NextResponse.json({ code: "BILLING_NOT_CONFIGURED", error: "Online billing is not configured." }, { status: 503 });
  }

  const { data: account, error: accountError } = await supabase
    .from("billing_accounts")
    .select("id, owner_user_id, subject_type, stripe_customer_id, billing_email, legal_entity_name, tax_id, billing_address_line1, billing_postal_code, billing_city, billing_country")
    .eq("id", accountId)
    .eq("owner_user_id", user.id)
    .maybeSingle();
  if (accountError || !account || account.subject_type !== plan.subjectType) {
    return NextResponse.json({ error: "Billing account was not found." }, { status: 404 });
  }

  if (plan.subjectType === "designer") {
    const { data: coverage } = await supabase.rpc("current_user_studio_billing_coverage");
    if (Array.isArray(coverage) && coverage.length) {
      return NextResponse.json(
        { code: "PROFILE_COVERED_BY_STUDIO", error: getBillingCopy().billing.includedWithStudio },
        { status: 409 }
      );
    }
  }

  const address = account.billing_address_line1
    ? {
        city: account.billing_city || undefined,
        country: account.billing_country || "PL",
        line1: account.billing_address_line1,
        postal_code: account.billing_postal_code || undefined,
      }
    : undefined;
  let customerId = account.stripe_customer_id as string | null;
  if (customerId) {
    await stripe.customers.update(customerId, {
      address,
      email: account.billing_email || user.email || undefined,
      name: account.legal_entity_name || undefined,
    });
  } else {
    const customer = await stripe.customers.create({
      address,
      email: account.billing_email || user.email || undefined,
      metadata: { archicompass_billing_account_id: account.id, archicompass_owner_id: user.id },
      name: account.legal_entity_name || undefined,
    });
    customerId = customer.id;
    await supabase.from("billing_accounts").update({ stripe_customer_id: customerId }).eq("id", account.id);
  }

  const appUrl = billingAppUrl();
  const session = await stripe.checkout.sessions.create({
    allow_promotion_codes: false,
    automatic_tax: { enabled: process.env.STRIPE_AUTOMATIC_TAX === "true" },
    billing_address_collection: "required",
    cancel_url: `${appUrl}/studio/billing?checkout=cancelled`,
    client_reference_id: account.id,
    customer: customerId,
    customer_update: { address: "auto", name: "auto" },
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      archicompass_billing_account_id: account.id,
      archicompass_plan_code: planCode,
      archicompass_subject_type: account.subject_type,
    },
    mode: "subscription",
    subscription_data: {
      metadata: {
        archicompass_billing_account_id: account.id,
        archicompass_plan_code: planCode,
      },
    },
    success_url: `${appUrl}/studio/billing?checkout=success`,
    tax_id_collection: { enabled: true },
  });

  if (!session.url) return NextResponse.json({ error: "Checkout could not be created." }, { status: 500 });
  return NextResponse.json({ url: session.url });
}
