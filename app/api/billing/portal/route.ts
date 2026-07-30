import { NextResponse } from "next/server";
import { billingAppUrl, createStripeClient } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { accountId?: unknown } | null;
  const accountId = typeof body?.accountId === "string" ? body.accountId : "";
  if (!accountId) return NextResponse.json({ error: "Billing account is required." }, { status: 400 });

  const { data: account } = await supabase
    .from("billing_accounts")
    .select("stripe_customer_id")
    .eq("id", accountId)
    .eq("owner_user_id", user.id)
    .maybeSingle();
  const stripe = createStripeClient();
  if (!stripe || !account?.stripe_customer_id) {
    return NextResponse.json({ error: "The billing portal is not available yet." }, { status: 503 });
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: account.stripe_customer_id,
    return_url: `${billingAppUrl()}/studio/billing`,
  });
  return NextResponse.json({ url: portal.url });
}
