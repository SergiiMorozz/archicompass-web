import Stripe from "stripe";
import type { BillingStatus } from "@/lib/billing";
import { localePublicUrl, siteLocale } from "@/lib/site-locale";

export function createStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  return key ? new Stripe(key) : null;
}

export function stripeStatusToBillingStatus(status: string | null | undefined): BillingStatus {
  if (status === "active") return "active";
  if (status === "trialing") return "trialing";
  if (status === "past_due" || status === "unpaid" || status === "incomplete") return "past_due";
  if (status === "canceled" || status === "incomplete_expired") return "cancelled";
  return "past_due";
}

export function unixToIso(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? new Date(value * 1000).toISOString()
    : null;
}

export function billingAppUrl() {
  return localePublicUrl(siteLocale).replace(/\/$/, "");
}
