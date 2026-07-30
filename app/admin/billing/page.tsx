import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getBillingCopy } from "@/content/billing-copy";
import { formatBillingDate, isBillingPlanCode, type BillingStatus } from "@/lib/billing";
import { requireAdmin } from "@/lib/admin";

export const revalidate = 0;

type Summary = { trialing?: number; active?: number; payment_issue?: number; restricted?: number };
type BillingRow = {
  billing_account_id: string;
  owner_user_id: string;
  email: string | null;
  account_name: string | null;
  subject_type: "designer" | "studio";
  subject_name: string | null;
  effective_status: BillingStatus;
  has_access: boolean;
  plan_code: string | null;
  trial_ends_at: string | null;
  current_period_end: string | null;
  manual_access_until: string | null;
  tax_id: string | null;
};

function textValue(formData: FormData, key: string, max = 1000) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function statusClass(status: BillingStatus) {
  if (status === "active") return "bg-emerald-50 text-emerald-800";
  if (status === "trialing") return "bg-primary-soft text-primary";
  if (status === "past_due") return "bg-amber-50 text-amber-800";
  return "bg-red-50 text-red-700";
}

function planLabel(planCode: string | null) {
  if (!planCode || !isBillingPlanCode(planCode)) return null;
  const plan = getBillingCopy().plans[planCode];
  return `${plan.label} · ${plan.interval}`;
}

async function changeBillingAccess(formData: FormData) {
  "use server";
  const accountId = textValue(formData, "billing_account_id", 80);
  const action = textValue(formData, "billing_action", 40);
  const reason = textValue(formData, "reason", 1000);
  const { supabase } = await requireAdmin("finance");
  const { error } = await supabase.rpc("admin_set_billing_access", {
    action_reason: reason || null,
    target_action: action,
    target_billing_account_id: accountId,
  });
  if (error) redirect(`/admin/billing?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin");
  revalidatePath("/admin/billing");
  revalidatePath("/designers");
  redirect("/admin/billing?updated=1");
}

export default async function AdminBillingPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; q?: string; status?: string; updated?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const copy = getBillingCopy().admin;
  const { supabase } = await requireAdmin("finance");
  const status = ["all", "trialing", "active", "past_due", "trial_expired", "cancelled", "suspended"].includes(sp.status || "") ? sp.status || "all" : "all";
  const q = (sp.q || "").trim().slice(0, 120);
  const [summaryResult, rowsResult] = await Promise.all([
    supabase.rpc("admin_billing_summary"),
    supabase.rpc("admin_billing_directory", { page_limit: 100, search_text: q || null, status_filter: status }),
  ]);
  const summary = (summaryResult.data ?? {}) as Summary;
  const rows = (rowsResult.data ?? []) as BillingRow[];

  return (
    <main>
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl"><div className="text-sm font-semibold text-primary">{copy.eyebrow}</div><h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{copy.title}</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-muted">{copy.intro}</p></div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {sp.updated ? <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{copy.updated}</div> : null}
        {sp.error || summaryResult.error || rowsResult.error ? <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{sp.error || copy.error}</div> : null}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[[copy.summary.trialing, summary.trialing], [copy.summary.active, summary.active], [copy.summary.paymentIssue, summary.payment_issue], [copy.summary.restricted, summary.restricted]].map(([label, value]) => <article key={String(label)} className="rounded-xl border border-line bg-card p-5 shadow-sm"><div className="text-sm font-semibold text-muted">{label}</div><div className="mt-2 text-4xl font-bold text-primary">{Number(value || 0)}</div></article>)}</div>

        <form className="mt-8 grid gap-3 rounded-xl border border-line bg-card p-5 sm:grid-cols-[minmax(0,1fr)_200px_auto]">
          <label className="grid gap-2 text-sm font-semibold">{copy.filters.search}<input name="q" defaultValue={q} placeholder={copy.filters.searchPlaceholder} className="rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none focus:border-primary" /></label>
          <label className="grid gap-2 text-sm font-semibold">{copy.filters.status}<select name="status" defaultValue={status} className="rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none focus:border-primary"><option value="all">{copy.filters.all}</option>{(["trialing", "active", "past_due", "trial_expired", "cancelled", "suspended"] as BillingStatus[]).map((value) => <option key={value} value={value}>{getBillingCopy().statuses[value]}</option>)}</select></label>
          <button className="self-end rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white">{copy.filters.apply}</button>
        </form>

        <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-card shadow-sm">
          {rows.length ? (
            <table className="min-w-[1050px] w-full text-left text-sm">
              <thead className="border-b border-line bg-background text-xs font-bold uppercase tracking-[0.08em] text-muted">
                <tr>{[copy.columns.account, copy.columns.subject, copy.columns.status, copy.columns.access, copy.columns.plan, copy.columns.renewal, copy.columns.action].map((label) => <th key={label} className="px-4 py-4">{label}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const hasAccess = row.has_access;
                  const date = row.effective_status === "trialing" ? row.trial_ends_at : row.current_period_end;
                  return (
                    <tr key={row.billing_account_id} className="border-b border-line align-top last:border-b-0">
                      <td className="px-4 py-4"><Link href={`/admin/users/${row.owner_user_id}`} className="font-bold hover:text-primary">{row.account_name || row.email}</Link><div className="mt-1 text-xs text-muted">{row.email}{row.tax_id ? ` · ${row.tax_id}` : ""}</div></td>
                      <td className="px-4 py-4"><div className="font-semibold">{row.subject_name || copy.noAccounts}</div><div className="mt-1 text-xs text-muted">{row.subject_type === "studio" ? getBillingCopy().plans.studio_monthly.label : getBillingCopy().plans.designer_monthly.label}</div></td>
                      <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(row.effective_status)}`}>{getBillingCopy().statuses[row.effective_status]}</span></td>
                      <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${hasAccess ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>{hasAccess ? copy.accessGranted : copy.accessRestricted}</span></td>
                      <td className="px-4 py-4 font-semibold">{planLabel(row.plan_code) || copy.noPlan}</td>
                      <td className="px-4 py-4 text-muted">{formatBillingDate(date) || copy.noDate}</td>
                      <td className="px-4 py-4">
                        <div className="grid gap-2">
                          <form action={changeBillingAccess}><input type="hidden" name="billing_account_id" value={row.billing_account_id} /><input type="hidden" name="billing_action" value="extend_trial" /><button className="rounded-lg border border-line px-3 py-2 text-xs font-bold text-primary">{copy.extendTrial}</button></form>
                          <form action={changeBillingAccess}><input type="hidden" name="billing_account_id" value={row.billing_account_id} /><input type="hidden" name="billing_action" value="restore_access" /><button className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">{copy.restoreAccess}</button></form>
                          <form action={changeBillingAccess}><input type="hidden" name="billing_account_id" value={row.billing_account_id} /><input type="hidden" name="billing_action" value="restrict" /><button className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{copy.restrict}</button></form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : <div className="p-7 text-sm text-muted">{copy.noAccounts}</div>}
        </div>
      </section>
    </main>
  );
}
