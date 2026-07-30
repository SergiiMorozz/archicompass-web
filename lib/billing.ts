import { siteLocale, type SiteLocale } from "@/lib/site-locale";

export const billingPlanCodes = [
  "designer_monthly",
  "designer_yearly",
  "studio_monthly",
  "studio_yearly",
] as const;

export type BillingPlanCode = (typeof billingPlanCodes)[number];
export type BillingSubjectType = "designer" | "studio";
export type BillingStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "trial_expired"
  | "cancelled"
  | "suspended";

export type BillingAccount = {
  id: string;
  owner_user_id: string;
  subject_type: BillingSubjectType;
  subject_id: string | null;
  plan_code: BillingPlanCode | null;
  status: BillingStatus;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  billing_email: string | null;
  legal_entity_name: string | null;
  tax_id: string | null;
  billing_address_line1: string | null;
  billing_postal_code: string | null;
  billing_city: string | null;
  billing_country: string | null;
  manual_access_until: string | null;
  suspended_reason: string | null;
};

export type BillingInvoice = {
  id: string;
  status: string;
  amount_total: number | null;
  tax_amount: number | null;
  currency: string;
  invoice_number: string | null;
  hosted_invoice_url: string | null;
  invoice_pdf_url: string | null;
  issued_at: string | null;
  due_date: string | null;
};

export const billingPlans: Record<
  BillingPlanCode,
  {
    subjectType: BillingSubjectType;
    interval: "month" | "year";
    amount: number;
    envKey: string;
  }
> = {
  designer_monthly: {
    subjectType: "designer",
    interval: "month",
    amount: 89,
    envKey: "STRIPE_PRICE_DESIGNER_MONTHLY",
  },
  designer_yearly: {
    subjectType: "designer",
    interval: "year",
    amount: 599,
    envKey: "STRIPE_PRICE_DESIGNER_YEARLY",
  },
  studio_monthly: {
    subjectType: "studio",
    interval: "month",
    amount: 199,
    envKey: "STRIPE_PRICE_STUDIO_MONTHLY",
  },
  studio_yearly: {
    subjectType: "studio",
    interval: "year",
    amount: 1099,
    envKey: "STRIPE_PRICE_STUDIO_YEARLY",
  },
};

export function isBillingPlanCode(value: string): value is BillingPlanCode {
  return billingPlanCodes.includes(value as BillingPlanCode);
}

export function configuredStripePrice(planCode: BillingPlanCode) {
  return process.env[billingPlans[planCode].envKey] || null;
}

export function isStripeBillingConfigured(planCode?: BillingPlanCode | null) {
  if (!process.env.STRIPE_SECRET_KEY) return false;
  return planCode ? Boolean(configuredStripePrice(planCode)) : true;
}

export function billingHasAccess(account: Pick<BillingAccount, "status" | "trial_ends_at" | "current_period_end" | "manual_access_until">, now = new Date()) {
  const nowTime = now.getTime();
  const manualUntil = account.manual_access_until ? new Date(account.manual_access_until).getTime() : 0;
  if (manualUntil > nowTime) return true;

  if (account.status === "trialing") {
    return Boolean(account.trial_ends_at && new Date(account.trial_ends_at).getTime() > nowTime);
  }

  if (account.status === "active") {
    return !account.current_period_end || new Date(account.current_period_end).getTime() > nowTime;
  }

  return false;
}

export function billingStatusTone(status: BillingStatus) {
  if (status === "active") return "success";
  if (status === "trialing") return "primary";
  if (status === "past_due") return "warning";
  return "danger";
}

export function formatBillingAmount(amount: number, locale: SiteLocale = siteLocale) {
  return new Intl.NumberFormat(locale === "pl" ? "pl-PL" : "en-GB", {
    currency: "PLN",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount);
}

export function formatBillingDate(value: string | null, locale: SiteLocale = siteLocale) {
  if (!value) return null;
  return new Intl.DateTimeFormat(locale === "pl" ? "pl-PL" : "en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}
