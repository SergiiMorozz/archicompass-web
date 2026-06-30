import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

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

function formatDate(value: string | null) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function displayValue(value: string | number | null | undefined) {
  return value === null || value === undefined || value === "" ? "Not provided" : String(value);
}

function isProfessional(profile: UserProfile) {
  return profile.user_type === "professional" || Boolean(profile.profession_type);
}

async function updateUserReview(formData: FormData) {
  "use server";

  const userId = formText(formData, "user_id");
  const status = formText(formData, "review_status");
  const note = formText(formData, "internal_note");

  if (!isUuid(userId)) redirect("/admin/users");
  if (!["clear", "needs_review", "priority"].includes(status)) {
    redirect(`/admin/users/${userId}?error=Invalid%20review%20status`);
  }

  const { supabase } = await requireAdmin();
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

  const userId = formText(formData, "user_id");
  const entityId = formText(formData, "entity_id");
  const entityType = formText(formData, "entity_type");
  const visibility = formText(formData, "visibility");
  const reason = formText(formData, "moderation_reason");

  if (!isUuid(userId) || !isUuid(entityId)) redirect("/admin/users");
  if (!["profile", "project"].includes(entityType)) {
    redirect(`/admin/users/${userId}?error=Invalid%20content%20type`);
  }
  if (!["visible", "hidden"].includes(visibility)) {
    redirect(`/admin/users/${userId}?error=Invalid%20visibility`);
  }

  const { supabase } = await requireAdmin();
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
  if (!isUuid(id)) notFound();

  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.rpc("admin_user_detail", { target_user_id: id });
  if (error || !data) notFound();

  const detail = data as AdminUserDetail;
  const profile = detail.profile ?? ({} as UserProfile);
  const counts = detail.counts ?? ({} as UserCounts);
  const projects = detail.projects ?? [];
  const title = profile.full_name || detail.email || "Unnamed account";
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
            Back to users
          </Link>
          <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                  {professional ? "Professional" : profile.user_type || "Client"}
                </span>
                {detail.admin_role ? (
                  <span className="rounded-full bg-foreground px-3 py-1 text-xs font-semibold capitalize text-white">
                    {detail.admin_role}
                  </span>
                ) : null}
              </div>
              <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
              <p className="mt-3 text-muted">{detail.email || "No account email"}</p>
            </div>
            {professional ? (
              <Link
                href={`/designers/${detail.user_id}`}
                className="rounded-xl border border-line bg-background px-5 py-3 text-center text-sm font-semibold hover:border-primary hover:text-primary"
              >
                Open public profile
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {sp.updated ? (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
            Internal review state updated and recorded in the audit log.
          </div>
        ) : sp.visibilityUpdated ? (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
            Public visibility updated and recorded in the audit log.
          </div>
        ) : sp.error ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {sp.error}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {[
            ["Projects", counts.projects],
            ["Briefs", counts.briefs],
            ["Sent requests", counts.sent_inquiries],
            ["Received", counts.received_inquiries],
            ["Favorites", counts.favorites],
            ["Profile views", counts.profile_views],
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
              <div className="text-sm font-semibold text-primary">Account record</div>
              <h2 className="mt-1 text-3xl font-bold">Profile details</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {[
                  ["Account email", detail.email],
                  ["Profile email", profile.email],
                  ["Location", profile.location],
                  ["Profession", profile.profession_type],
                  ["Phone", profile.phone],
                  ["Website", profile.website],
                  ["Hourly rate", profile.hourly_rate ? `${profile.hourly_rate} PLN` : null],
                  ["Experience", profile.years_experience ? `${profile.years_experience} years` : null],
                  ["Joined", formatDate(detail.created_at)],
                  ["Last sign-in", formatDate(detail.last_sign_in_at)],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-lg bg-background p-4">
                    <div className="text-xs font-semibold uppercase text-muted">{label}</div>
                    <div className="mt-1 break-words font-semibold">{displayValue(value)}</div>
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

            <section className="rounded-lg border border-line bg-card p-6 shadow-sm">
              <div className="text-sm font-semibold text-primary">Public content</div>
              <h2 className="mt-1 text-3xl font-bold">Portfolio projects</h2>
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
                            <div className="font-semibold">{project.title || "Untitled project"}</div>
                            <div className="mt-1 text-sm text-muted">
                              {project.category || "Uncategorized"} | {formatDate(project.created_at)}
                            </div>
                          </div>
                          <span className={[
                            "rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                            project.visibility === "hidden"
                              ? "bg-red-50 text-red-700"
                              : "bg-emerald-50 text-emerald-800",
                          ].join(" ")}>
                            {project.visibility}
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
                          value={project.visibility === "hidden" ? "" : "Hidden during admin moderation"}
                        />
                        <button className={[
                          "rounded-xl px-4 py-2.5 text-sm font-semibold",
                          project.visibility === "hidden"
                            ? "bg-primary text-white"
                            : "border border-red-200 bg-red-50 text-red-700",
                        ].join(" ")}>
                          {project.visibility === "hidden" ? "Restore project" : "Hide project"}
                        </button>
                        <span className="text-xs text-muted">Affects the public project page.</span>
                      </form>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted">No public portfolio projects.</p>
              )}
            </section>
          </div>

          <aside className="grid h-fit gap-5 lg:sticky lg:top-40">
            <section className="rounded-lg border border-line bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-primary">Public visibility</div>
                <span className={[
                  "rounded-full px-3 py-1 text-xs font-semibold capitalize",
                  detail.profile_visibility === "hidden"
                    ? "bg-red-50 text-red-700"
                    : "bg-emerald-50 text-emerald-800",
                ].join(" ")}>
                  {detail.profile_visibility}
                </span>
              </div>
              <h2 className="mt-2 text-2xl font-bold">Profile moderation</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Hidden profiles disappear from designer search and direct public pages.
                The owner keeps account access and existing conversations continue.
              </p>
              <form action={updateContentVisibility} className="mt-5 grid gap-4">
                <input type="hidden" name="user_id" value={detail.user_id} />
                <input type="hidden" name="entity_id" value={detail.user_id} />
                <input type="hidden" name="entity_type" value="profile" />
                <label className="text-sm font-semibold">
                  Visibility
                  <select name="visibility" defaultValue={detail.profile_visibility || "visible"} className={fieldClass}>
                    <option value="visible">Visible</option>
                    <option value="hidden" disabled={Boolean(detail.admin_role)}>Hidden</option>
                  </select>
                </label>
                <label className="text-sm font-semibold">
                  Moderation reason
                  <textarea
                    name="moderation_reason"
                    defaultValue={detail.profile_visibility_reason || ""}
                    rows={3}
                    maxLength={1000}
                    placeholder="Why this profile is hidden"
                    className={fieldClass}
                  />
                </label>
                <button className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">
                  Update visibility
                </button>
              </form>
              {detail.admin_role ? (
                <div className="mt-3 text-xs leading-5 text-muted">
                  Active administrator profiles are protected from being hidden.
                </div>
              ) : null}
            </section>

            <section className="rounded-lg border border-line bg-card p-6 shadow-sm">
              <div className="text-sm font-semibold text-primary">Internal review</div>
              <h2 className="mt-1 text-2xl font-bold">Operations note</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                This state is for staff follow-up only. It does not block the account or
                expose the note to the user.
              </p>
              <form action={updateUserReview} className="mt-5 grid gap-4">
                <input type="hidden" name="user_id" value={detail.user_id} />
                <label className="text-sm font-semibold">
                  Review state
                  <select name="review_status" defaultValue={detail.review?.status || "clear"} className={fieldClass}>
                    <option value="clear">Clear</option>
                    <option value="needs_review">Needs review</option>
                    <option value="priority">Priority follow-up</option>
                  </select>
                </label>
                <label className="text-sm font-semibold">
                  Internal note
                  <textarea
                    name="internal_note"
                    defaultValue={detail.review?.internal_note || ""}
                    rows={6}
                    maxLength={4000}
                    placeholder="Context for the owner or support team"
                    className={fieldClass}
                  />
                </label>
                <button className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">
                  Save review
                </button>
              </form>
              {reviewUpdated ? (
                <div className="mt-4 text-xs text-muted">Last updated {formatDate(reviewUpdated)}</div>
              ) : null}
              <div className="mt-5 border-t border-line pt-4 text-xs leading-5 text-muted">
                Private messages and reference photos are intentionally unavailable here.
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
