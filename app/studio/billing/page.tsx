import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import BillingCheckoutButton from "@/components/BillingCheckoutButton";
import BillingPortalButton from "@/components/BillingPortalButton";
import { getBillingCopy } from "@/content/billing-copy";
import {
  billingHasAccess,
  billingPlans,
  billingStatusTone,
  formatBillingAmount,
  formatBillingDate,
  type BillingAccount,
  type BillingInvoice,
  type BillingPlanCode,
} from "@/lib/billing";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 0;

const fieldClass = "mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary";

function textValue(formData: FormData, key: string, limit = 240) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function saveBillingProfile(formData: FormData) {
  "use server";

  const accountId = textValue(formData, "billing_account_id", 80);
  if (!isUuid(accountId)) redirect("/studio/billing?error=1");

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login?next=/studio/billing");

  const { error } = await supabase
    .from("billing_accounts")
    .update({
      billing_address_line1: textValue(formData, "billing_address_line1") || null,
      billing_city: textValue(formData, "billing_city", 120) || null,
      billing_country: (textValue(formData, "billing_country", 2) || "PL").toUpperCase(),
      billing_email: textValue(formData, "billing_email", 320) || null,
      billing_postal_code: textValue(formData, "billing_postal_code", 32) || null,
      legal_entity_name: textValue(formData, "legal_entity_name") || null,
      tax_id: textValue(formData, "tax_id", 64) || null,
    })
    .eq("id", accountId)
    .eq("owner_user_id", user.id);

  if (error) redirect("/studio/billing?error=1");
  revalidatePath("/studio/billing");
  redirect("/studio/billing?saved=1");
}

function statusClass(status: BillingAccount["status"]) {
  const tone = billingStatusTone(status);
  if (tone === "success") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (tone === "warning") return "border-amber-200 bg-amber-50 text-amber-800";
  if (tone === "danger") return "border-red-200 bg-red-50 text-red-700";
  return "border-primary/20 bg-primary-soft text-primary";
}

export default async function StudioBillingPage({
  searchParams,
}: {
  searchParams?: Promise<{ checkout?: string; error?: string; saved?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const copy = getBillingCopy();
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login?next=/studio/billing");

  const { data: accountData, error: accountError } = await supabase
    .from("billing_accounts")
    .select("id, owner_user_id, subject_type, subject_id, plan_code, status, trial_started_at, trial_ends_at, current_period_end, cancel_at_period_end, billing_email, legal_entity_name, tax_id, billing_address_line1, billing_postal_code, billing_city, billing_country, manual_access_until, suspended_reason, stripe_customer_id")
    .eq("owner_user_id", user.id)
    .order("subject_type", { ascending: true });
  const accounts = (accountData ?? []) as Array<BillingAccount & { stripe_customer_id: string | null }>;
  const accountIds = accounts.map((account) => account.id);
  const { data: invoiceData } = accountIds.length
    ? await supabase
        .from("billing_invoices")
        .select("id, billing_account_id, status, amount_total, tax_amount, currency, invoice_number, hosted_invoice_url, invoice_pdf_url, issued_at, due_date")
        .in("billing_account_id", accountIds)
        .order("issued_at", { ascending: false })
    : { data: [] };
  const invoicesByAccount = new Map<string, BillingInvoice[]>();
  for (const invoice of (invoiceData ?? []) as Array<BillingInvoice & { billing_account_id: string }>) {
    const entries = invoicesByAccount.get(invoice.billing_account_id) ?? [];
    entries.push(invoice);
    invoicesByAccount.set(invoice.billing_account_id, entries);
  }

  return (
    <main>
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-sm font-semibold text-primary">{copy.billing.eyebrow}</div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{copy.billing.title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">{copy.billing.intro}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {sp.saved ? <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{copy.billing.saved}</div> : null}
        {sp.error ? <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{copy.billing.saveError}</div> : null}
        {sp.checkout === "success" ? <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{copy.billing.accessActive}</div> : null}
        {sp.checkout === "cancelled" ? <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{copy.checkout.unavailable}</div> : null}
        {accountError ? <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{copy.billing.saveError}</div> : null}

        <section className="rounded-2xl border border-accent/25 bg-accent-soft p-6 shadow-sm sm:p-7">
          <div className="inline-flex rounded-full bg-card px-3 py-1 text-xs font-bold text-accent">{copy.billing.founderBadge}</div>
          <p className="mt-3 max-w-4xl leading-7 text-foreground/80">{copy.billing.founderBody}</p>
        </section>

        {accounts.length ? (
          <div className="mt-7 grid gap-7">
            {accounts.map((account) => {
              const hasAccess = billingHasAccess(account);
              const planOptions = (Object.entries(billingPlans) as Array<[BillingPlanCode, (typeof billingPlans)[BillingPlanCode]]>).filter(([, plan]) => plan.subjectType === account.subject_type);
              const invoices = invoicesByAccount.get(account.id) ?? [];
              const nextDate = account.status === "trialing" ? account.trial_ends_at : account.current_period_end;
              const selectedPlan = account.plan_code ? copy.plans[account.plan_code] : null;

              return (
                <article key={account.id} className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
                  <div className="flex flex-col gap-4 border-b border-line px-6 py-6 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-primary">{account.subject_type === "studio" ? copy.plans.studio_monthly.label : copy.plans.designer_monthly.label}</div>
                      <h2 className="mt-1 text-2xl font-bold">{selectedPlan ? `${selectedPlan.label} · ${selectedPlan.interval}` : copy.billing.selectPlan}</h2>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass(account.status)}`}>{copy.statuses[account.status]}</span>
                        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${hasAccess ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"}`}>{hasAccess ? copy.billing.accessActive : copy.billing.accessRestricted}</span>
                      </div>
                    </div>
                    {account.stripe_customer_id ? <BillingPortalButton accountId={account.id} errorLabel={copy.checkout.error} label={copy.billing.managePayment} /> : null}
                  </div>

                  <div className="grid gap-7 p-6 lg:grid-cols-[minmax(0,1fr)_390px]">
                    <div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-line bg-background p-4">
                          <div className="text-xs font-bold uppercase tracking-[0.1em] text-muted">{copy.billing.plan}</div>
                          <div className="mt-2 font-bold">{selectedPlan ? `${selectedPlan.label} · ${selectedPlan.interval}` : copy.billing.notAvailable}</div>
                        </div>
                        <div className="rounded-xl border border-line bg-background p-4">
                          <div className="text-xs font-bold uppercase tracking-[0.1em] text-muted">{account.status === "trialing" ? copy.billing.trialEnds : copy.billing.nextPayment}</div>
                          <div className="mt-2 font-bold">{formatBillingDate(nextDate) || copy.billing.notAvailable}</div>
                        </div>
                      </div>

                      <h3 className="mt-7 text-xl font-bold">{copy.billing.selectPlan}</h3>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {planOptions.map(([planCode, plan]) => (
                          <div key={planCode} className="rounded-xl border border-line bg-background p-4">
                            <div className="text-sm font-bold">{copy.plans[planCode].label}</div>
                            <div className="mt-1 text-sm text-muted">{copy.plans[planCode].interval}</div>
                            <div className="mt-3 text-2xl font-bold text-primary">{formatBillingAmount(plan.amount)}</div>
                            <div className="mt-1 text-xs text-muted">{copy.billing.net}</div>
                            <div className="mt-4">
                              <BillingCheckoutButton accountId={account.id} errorLabel={copy.checkout.error} label={copy.billing.activatePlan} planCode={planCode} unavailableLabel={copy.checkout.unavailable} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <form action={saveBillingProfile} className="h-fit rounded-xl border border-line bg-background p-5">
                      <input type="hidden" name="billing_account_id" value={account.id} />
                      <div className="text-lg font-bold">{copy.billing.billingProfileTitle}</div>
                      <p className="mt-2 text-sm leading-6 text-muted">{copy.billing.billingProfileBody}</p>
                      <div className="mt-5 grid gap-4">
                        <label className="text-sm font-semibold">{copy.billing.billingEmail}<input name="billing_email" type="email" defaultValue={account.billing_email || user.email || ""} className={fieldClass} /></label>
                        <label className="text-sm font-semibold">{copy.billing.legalEntityName}<input name="legal_entity_name" defaultValue={account.legal_entity_name || ""} className={fieldClass} /></label>
                        <label className="text-sm font-semibold">{copy.billing.taxId}<input name="tax_id" defaultValue={account.tax_id || ""} className={fieldClass} /></label>
                        <label className="text-sm font-semibold">{copy.billing.addressLine}<input name="billing_address_line1" defaultValue={account.billing_address_line1 || ""} className={fieldClass} /></label>
                        <div className="grid grid-cols-2 gap-3">
                          <label className="text-sm font-semibold">{copy.billing.postalCode}<input name="billing_postal_code" defaultValue={account.billing_postal_code || ""} className={fieldClass} /></label>
                          <label className="text-sm font-semibold">{copy.billing.city}<input name="billing_city" defaultValue={account.billing_city || ""} className={fieldClass} /></label>
                        </div>
                        <label className="text-sm font-semibold">{copy.billing.country}<input name="billing_country" defaultValue={account.billing_country || "PL"} maxLength={2} className={fieldClass} /></label>
                        <button className="rounded-xl border border-primary bg-card px-4 py-3 text-sm font-bold text-primary transition hover:bg-primary hover:text-white">{copy.billing.saveBillingProfile}</button>
                      </div>
                    </form>
                  </div>

                  <section className="border-t border-line bg-background px-6 py-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <div><h3 className="text-xl font-bold">{copy.billing.invoiceTitle}</h3><p className="mt-1 text-sm leading-6 text-muted">{copy.billing.invoiceBody}</p></div>
                    </div>
                    {invoices.length ? <div className="mt-4 grid gap-3">{invoices.map((invoice) => <div key={invoice.id} className="flex flex-col gap-3 rounded-xl border border-line bg-card p-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="font-semibold">{invoice.invoice_number || copy.billing.invoiceTitle}</div><div className="mt-1 text-sm text-muted">{formatBillingDate(invoice.issued_at) || copy.billing.notAvailable} · {invoice.amount_total !== null ? formatBillingAmount(invoice.amount_total / 100) : copy.billing.notAvailable}</div></div><div className="flex gap-2">{invoice.hosted_invoice_url ? <a href={invoice.hosted_invoice_url} target="_blank" rel="noreferrer" className="rounded-lg border border-line px-3 py-2 text-sm font-semibold text-primary">{copy.billing.openInvoice}</a> : null}{invoice.invoice_pdf_url ? <a href={invoice.invoice_pdf_url} target="_blank" rel="noreferrer" className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white">{copy.billing.downloadPdf}</a> : null}</div></div>)}</div> : <p className="mt-4 text-sm text-muted">{copy.billing.noInvoices}</p>}
                    <p className="mt-4 text-xs leading-5 text-muted">{copy.billing.createInvoiceNote}</p>
                  </section>
                </article>
              );
            })}
          </div>
        ) : (
          <section className="mt-7 rounded-2xl border border-line bg-card p-7">
            <h2 className="text-2xl font-bold">{copy.billing.notAvailable}</h2>
            <p className="mt-3 max-w-2xl text-muted">{copy.billing.paymentUnavailableBody}</p>
            <Link href="/account/profile" className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white">{copy.accountCard.cta}</Link>
          </section>
        )}
      </section>
    </main>
  );
}
