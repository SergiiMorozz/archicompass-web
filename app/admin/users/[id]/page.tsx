import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { getWorkspaceCopy } from "@/content/workspace-copy";

export const revalidate = 0;

type UserProfile = {
  full_name: string | null;
  bio: string | null;
  location: string | null;
  profession_type: string | null;
  user_type: string | null;
  specialties: string[];
  website: string | null;
  phone: string | null;
  email: string | null;
  hourly_rate: number | null;
  years_experience: number | null;
};

type UserCounts = {
  projects: number;
  briefs: number;
  sent_inquiries: number;
  received_inquiries: number;
  favorites: number;
  profile_views: number;
};

type UserProject = {
  id: string;
  title: string | null;
  category: string | null;
  created_at: string;
  visibility: string;
};

type UserReview = {
  status: string;
  internal_note: string | null;
  updated_at: string | null;
  updated_by: string | null;
};

type AdminUserDetail = {
  user_id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  profile: UserProfile;
  counts: UserCounts;
  projects: UserProject[];
  review: UserReview;
  admin_role: string | null;
  profile_visibility: string;
  profile_visibility_reason: string | null;
};

const fieldClass =
  "mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 text-foreground outline-none focus:border-primary";

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function formText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function formatDate(value: string | null, locale: string, never: string) {
  if (!value) return never;
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function displayValue(value: string | number | null | undefined, fallback: string) {
  return value === null || value === undefined || value === "" ? fallback : String(value);
}

function isProfessional(profile: UserProfile) {
  return profile.user_type === "professional" || Boolean(profile.profession_type);
}

async function updateUserReview(formData: FormData) {
  "use server";

  const copy = getWorkspaceCopy().adminUserDetail;
  const userId = formText(formData, "user_id");
  const status = formText(formData, "review_status");
  const note = formText(formData, "internal_note");

  if (!isUuid(userId)) redirect("/admin/users");
  if (!["clear", "needs_review", "priority"].includes(status)) {
    redirect(`/admin/users/${userId}?error=${encodeURIComponent(copy.errors.invalidReviewStatus)}`);
  }

  const { supabase } = await requireAdmin("moderation");
  const { error } = await supabase.rpc("admin_set_user_review", {
    review_note: note || null,
    review_status: status,
    target_user_id: userId,
  });

  if (error) redirect(`/admin/users/${userId}?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  redirect(`/admin/users/${userId}?updated=1`);
}

async function updateContentVisibility(formData: FormData) {
  "use server";

  const copy = getWorkspaceCopy().adminUserDetail;
  const userId = formText(formData, "user_id");
  const entityId = formText(formData, "entity_id");
  const entityType = formText(formData, "entity_type");
  const visibility = formText(formData, "visibility");
  const reason = formText(formData, "moderation_reason");

  if (!isUuid(userId) || !isUuid(entityId)) redirect("/admin/users");
  if (!["profile", "project"].includes(entityType)) {
    redirect(`/admin/users/${userId}?error=${encodeURIComponent(copy.errors.invalidContentType)}`);
  }
  if (!["visible", "hidden"].includes(visibility)) {
    redirect(`/admin/users/${userId}?error=${encodeURIComponent(copy.errors.invalidVisibility)}`);
  }

  const { supabase } = await requireAdmin("moderation");
  const { error } = await supabase.rpc("admin_set_content_visibility", {
    moderation_reason: reason || null,
    target_entity_id: entityId,
    target_entity_type: entityType,
    target_visibility: visibility,
  });

  if (error) redirect(`/admin/users/${userId}?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/designers");
  revalidatePath(`/designers/${userId}`);
  if (entityType === "project") revalidatePath(`/projects/${entityId}`);
  redirect(`/admin/users/${userId}?visibilityUpdated=1`);
}

export default async function AdminUserDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; updated?: string; visibilityUpdated?: string }>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const copy = getWorkspaceCopy().adminUserDetail;
  if (!isUuid(id)) notFound();

  const { supabase } = await requireAdmin(["users", "moderation"]);
  const { data, error } = await supabase.rpc("admin_user_detail", { target_user_id: id });
  if (error || !data) notFound();

  const detail = data as AdminUserDetail;
  const profile = detail.profile ?? ({} as UserProfile);
  const counts = detail.counts ?? ({} as UserCounts);
  const projects = detail.projects ?? [];
  const title = profile.full_name || detail.email || copy.unnamedAccount;
  const professional = isProfessional(profile);
  const reviewUpdated = detail.review?.updated_at;

  return (
    <main>
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/admin/users"
            className="inline-flex rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold text-muted hover:border-primary hover:text-primary"
          >
            {copy.back}
          </Link>
          <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                  {professional ? copy.professional : copy.client}
                </span>
                {detail.admin_role ? (
                  <span className="rounded-full bg-foreground px-3 py-1 text-xs font-semibold capitalize text-white">
                    {detail.admin_role}
                  </span>
                ) : null}
              </div>
              <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
              <p className="mt-3 text-muted">{detail.email || copy.noAccountEmail}</p>
            </div>
            {professional ? (
              <Link
                href={`/designers/${detail.user_id}`}
                className="rounded-xl border border-line bg-background px-5 py-3 text-center text-sm font-semibold hover:border-primary hover:text-primary"
              >
                {copy.publicProfile}
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {sp.updated ? (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
            {copy.updatedReview}
          </div>
        ) : sp.visibilityUpdated ? (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
            {copy.updatedVisibility}
          </div>
        ) : sp.error ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {sp.error}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {[
            [copy.stats[0], counts.projects],
            [copy.stats[1], counts.briefs],
            [copy.stats[2], counts.sent_inquiries],
            [copy.stats[3], counts.received_inquiries],
            [copy.stats[4], counts.favorites],
            [copy.stats[5], counts.profile_views],
          ].map(([label, value]) => (
            <article key={String(label)} className="rounded-lg border border-line bg-card p-5 shadow-sm">
              <div className="text-sm font-semibold text-muted">{label}</div>
              <div className="mt-2 text-3xl font-bold text-primary">{Number(value ?? 0)}</div>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="grid gap-7">
            <section className="rounded-lg border border-line bg-card p-6 shadow-sm">
              <div className="text-sm font-semibold text-primary">{copy.accountEyebrow}</div>
              <h2 className="mt-1 text-3xl font-bold">{copy.profileTitle}</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {[
                  [copy.fields[0], detail.email],
                  [copy.fields[1], profile.email],
                  [copy.fields[2], profile.location],
                  [copy.fields[3], profile.profession_type],
                  [copy.fields[4], profile.phone],
                  [copy.fields[5], profile.website],
                  [copy.fields[6], profile.hourly_rate ? `${profile.hourly_rate} PLN` : null],
                  [copy.fields[7], profile.years_experience ? `${profile.years_experience} ${copy.years}` : null],
                  [copy.fields[8], formatDate(detail.created_at, copy.dateLocale, copy.never)],
                  [copy.fields[9], formatDate(detail.last_sign_in_at, copy.dateLocale, copy.never)],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-lg bg-background p-4">
                    <div className="text-xs font-semibold uppercase text-muted">{label}</div>
                    <div className="mt-1 break-words font-semibold">{displayValue(value, copy.notSpecified)}</div>
                  </div>
                ))}
              </div>
              {profile.specialties?.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {profile.specialties.map((specialty) => (
                    <span key={specialty} className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                      {specialty}
                    </span>
                  ))}
                </div>
              ) : null}
              {profile.bio ? <p className="mt-5 text-sm leading-7 text-muted">{profile.bio}</p> : null}
            </section>

            {professional ? <section className="rounded-lg border border-line bg-card p-6 shadow-sm">
              <div className="text-sm font-semibold text-primary">{copy.publicContentEyebrow}</div>
              <h2 className="mt-1 text-3xl font-bold">{copy.portfolioTitle}</h2>
              {projects.length ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {projects.map((project) => (
                    <div key={project.id} className="overflow-hidden rounded-lg border border-line bg-background">
                      <Link
                        href={`/projects/${project.id}`}
                        className="block p-4 hover:bg-primary-soft/40"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold">{project.title || copy.untitledProject}</div>
                            <div className="mt-1 text-sm text-muted">
                              {project.category || copy.noCategory} | {formatDate(project.created_at, copy.dateLocale, copy.never)}
                            </div>
                          </div>
                          <span className={[
                            "rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                            project.visibility === "hidden"
                              ? "bg-red-50 text-red-700"
                              : "bg-emerald-50 text-emerald-800",
                          ].join(" ")}>
                            {project.visibility === "hidden" ? copy.hidden : copy.visible}
                          </span>
                        </div>
                      </Link>
                      <form action={updateContentVisibility} className="flex flex-wrap items-center gap-2 border-t border-line p-3">
                        <input type="hidden" name="user_id" value={detail.user_id} />
                        <input type="hidden" name="entity_id" value={project.id} />
                        <input type="hidden" name="entity_type" value="project" />
                        <input
                          type="hidden"
                          name="visibility"
                          value={project.visibility === "hidden" ? "visible" : "hidden"}
                        />
                        <input
                          type="hidden"
                          name="moderation_reason"
                          value={project.visibility === "hidden" ? "" : copy.moderationTitle}
                        />
                        <button className={[
                          "rounded-xl px-4 py-2.5 text-sm font-semibold",
                          project.visibility === "hidden"
                            ? "bg-primary text-white"
                            : "border border-red-200 bg-red-50 text-red-700",
                        ].join(" ")}>
                          {project.visibility === "hidden" ? copy.restoreProject : copy.hideProject}
                        </button>
                        <span className="text-xs text-muted">{copy.projectVisibilityInfo}</span>
                      </form>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted">{copy.noProjects}</p>
              )}
            </section> : (
              <section className="rounded-lg border border-line bg-card p-6 shadow-sm">
                <div className="text-sm font-semibold text-primary">{copy.visibilityEyebrow}</div>
                <h2 className="mt-2 text-2xl font-bold">{copy.noPublicProfileTitle}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {copy.noPublicProfileBody}
                </p>
              </section>
            )}
          </div>

          <aside className="grid h-fit gap-5 lg:sticky lg:top-40">
            {professional ? <section className="rounded-lg border border-line bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-primary">{copy.visibilityEyebrow}</div>
                <span className={[
                  "rounded-full px-3 py-1 text-xs font-semibold capitalize",
                  detail.profile_visibility === "hidden"
                    ? "bg-red-50 text-red-700"
                    : "bg-emerald-50 text-emerald-800",
                ].join(" ")}>
                  {detail.profile_visibility === "hidden" ? copy.hidden : copy.visible}
                </span>
              </div>
              <h2 className="mt-2 text-2xl font-bold">{copy.moderationTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                {copy.moderationBody}
              </p>
              <form action={updateContentVisibility} className="mt-5 grid gap-4">
                <input type="hidden" name="user_id" value={detail.user_id} />
                <input type="hidden" name="entity_id" value={detail.user_id} />
                <input type="hidden" name="entity_type" value="profile" />
                <label className="text-sm font-semibold">
                  {copy.visibilityLabel}
                  <select name="visibility" defaultValue={detail.profile_visibility || "visible"} className={fieldClass}>
                    <option value="visible">{copy.visible}</option>
                    <option value="hidden">{copy.hidden}</option>
                  </select>
                </label>
                <label className="text-sm font-semibold">
                  {copy.moderationReason}
                  <textarea
                    name="moderation_reason"
                    defaultValue={detail.profile_visibility_reason || ""}
                    rows={3}
                    maxLength={1000}
                    placeholder={copy.moderationPlaceholder}
                    className={fieldClass}
                  />
                </label>
                <button className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">
                  {copy.updateVisibility}
                </button>
              </form>
            </section> : (
              <section className="rounded-lg border border-line bg-card p-6 shadow-sm">
                <div className="text-sm font-semibold text-primary">{copy.visibilityEyebrow}</div>
                <h2 className="mt-2 text-2xl font-bold">{copy.noPublicProfileTitle}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {copy.noPublicProfileBody}
                </p>
              </section>
            )}

            <section className="rounded-lg border border-line bg-card p-6 shadow-sm">
              <div className="text-sm font-semibold text-primary">{copy.reviewEyebrow}</div>
              <h2 className="mt-1 text-2xl font-bold">{copy.reviewTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                {copy.reviewBody}
              </p>
              <form action={updateUserReview} className="mt-5 grid gap-4">
                <input type="hidden" name="user_id" value={detail.user_id} />
                <label className="text-sm font-semibold">
                  {copy.reviewStatus}
                  <select name="review_status" defaultValue={detail.review?.status || "clear"} className={fieldClass}>
                    <option value="clear">{copy.clear}</option>
                    <option value="needs_review">{copy.needsReview}</option>
                    <option value="priority">{copy.priority}</option>
                  </select>
                </label>
                <label className="text-sm font-semibold">
                  {copy.internalNote}
                  <textarea
                    name="internal_note"
                    defaultValue={detail.review?.internal_note || ""}
                    rows={6}
                    maxLength={4000}
                    placeholder={copy.internalNotePlaceholder}
                    className={fieldClass}
                  />
                </label>
                <button className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">
                  {copy.saveReview}
                </button>
              </form>
              {reviewUpdated ? (
                <div className="mt-4 text-xs text-muted">{copy.lastUpdated(formatDate(reviewUpdated, copy.dateLocale, copy.never))}</div>
              ) : null}
              <div className="mt-5 border-t border-line pt-4 text-xs leading-5 text-muted">
                {copy.privacyNote}
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
