import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadOwnedJob } from "@/lib/portfolio-ingestion/job-access";
import { profileReadinessScore } from "@/lib/profile-readiness";
import { getPortfolioAutopilotCopy } from "@/content/portfolio-autopilot-copy";
import { localePublicPath, siteLocale } from "@/lib/site-locale";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

type TrackedField = {
  key: string;
  provenanceKey: string | null;
  hasValue: boolean;
};

function hasValue(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  return Boolean(value);
}

export default async function PortfolioAutopilotNextStepsPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const copy = getPortfolioAutopilotCopy().nextSteps;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect(localePublicPath(siteLocale, "/login"));

  const job = await loadOwnedJob(supabase, jobId, user.id);
  if (!job) notFound();

  const [{ data: profile }, { data: provenanceRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "full_name, location, profession_type, email, bio, profile_headline, specialties, service_capabilities, pricing_model, price_from, price_to, work_modes, availability_status, years_experience"
      )
      .eq("id", user.id)
      .maybeSingle(),
    supabase.from("profile_field_provenance").select("field_key, confirmed_by_designer").eq("user_id", user.id),
  ]);

  const confirmedByKey = new Map((provenanceRows ?? []).map((row) => [row.field_key, row.confirmed_by_designer]));
  const score = profileReadinessScore(profile, true);

  const fields: TrackedField[] = [
    { key: "full_name", provenanceKey: null, hasValue: hasValue(profile?.full_name) },
    { key: "location", provenanceKey: null, hasValue: hasValue(profile?.location) },
    { key: "profession_type", provenanceKey: null, hasValue: hasValue(profile?.profession_type) },
    { key: "email", provenanceKey: null, hasValue: hasValue(profile?.email) },
    { key: "bio", provenanceKey: "about", hasValue: hasValue(profile?.bio) },
    { key: "profile_headline", provenanceKey: "headline", hasValue: hasValue(profile?.profile_headline) },
    { key: "specialties", provenanceKey: "specialties", hasValue: hasValue(profile?.specialties) },
    { key: "service_capabilities", provenanceKey: "service_capabilities", hasValue: hasValue(profile?.service_capabilities) },
    { key: "pricing_model", provenanceKey: null, hasValue: hasValue(profile?.pricing_model) },
    { key: "price_range", provenanceKey: null, hasValue: hasValue(profile?.price_from) || hasValue(profile?.price_to) },
    { key: "work_modes", provenanceKey: null, hasValue: hasValue(profile?.work_modes) },
    { key: "availability_status", provenanceKey: null, hasValue: hasValue(profile?.availability_status) },
    { key: "years_experience", provenanceKey: null, hasValue: hasValue(profile?.years_experience) },
  ];

  const ready: TrackedField[] = [];
  const toConfirm: TrackedField[] = [];
  const toComplete: TrackedField[] = [];

  for (const field of fields) {
    if (!field.hasValue) {
      toComplete.push(field);
    } else if (field.provenanceKey && confirmedByKey.get(field.provenanceKey) === false) {
      toConfirm.push(field);
    } else {
      ready.push(field);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">{copy.eyebrow}</p>
      <h1 className="mt-2 text-3xl font-bold text-foreground">{copy.title(score)}</h1>
      <p className="mt-2 text-sm text-muted">
        {copy.summary(ready.length, toConfirm.length, toComplete.length)}
      </p>

      {toConfirm.length ? (
        <section className="mt-8 rounded-2xl border border-line bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">{copy.toConfirmTitle}</h2>
          <ul className="mt-3 grid gap-2">
            {toConfirm.map((field) => (
              <li key={field.key} className="text-sm text-foreground">
                {copy.fieldLabels[field.key as keyof typeof copy.fieldLabels]}
              </li>
            ))}
          </ul>
          <a
            href={localePublicPath(siteLocale, "/account/profile")}
            className="mt-4 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            {copy.confirmCta}
          </a>
        </section>
      ) : null}

      {toComplete.length ? (
        <section className="mt-6 rounded-2xl border border-line bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">{copy.toCompleteTitle}</h2>
          <ul className="mt-3 grid gap-2">
            {toComplete.map((field) => (
              <li key={field.key} className="text-sm text-foreground">
                {copy.fieldLabels[field.key as keyof typeof copy.fieldLabels]}
              </li>
            ))}
          </ul>
          <a
            href={localePublicPath(siteLocale, "/account/profile")}
            className="mt-4 inline-block rounded-xl border border-line px-5 py-3 text-sm font-semibold text-foreground hover:border-primary"
          >
            {copy.completeCta}
          </a>
        </section>
      ) : null}

      {!toConfirm.length && !toComplete.length ? <p className="mt-8 text-base text-foreground">{copy.allDoneNote}</p> : null}
    </main>
  );
}
