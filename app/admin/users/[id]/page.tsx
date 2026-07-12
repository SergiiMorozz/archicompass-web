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
  if (!value) return "Nigdy";
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function displayValue(value: string | number | null | undefined) {
  return value === null || value === undefined || value === "" ? "Nie podano" : String(value);
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
    redirect(`/admin/users/${userId}?error=Nieprawid%C5%82owy%20status%20weryfikacji`);
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
    redirect(`/admin/users/${userId}?error=Nieprawid%C5%82owy%20typ%20tre%C5%9Bci`);
  }
  if (!["visible", "hidden"].includes(visibility)) {
    redirect(`/admin/users/${userId}?error=Nieprawid%C5%82owa%20widoczno%C5%9B%C4%87`);
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
  const title = profile.full_name || detail.email || "Konto bez nazwy";
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
            Wróć do użytkowników
          </Link>
          <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                  {professional ? "Specjalista" : profile.user_type === "client" ? "Klient" : "Klient"}
                </span>
                {detail.admin_role ? (
                  <span className="rounded-full bg-foreground px-3 py-1 text-xs font-semibold capitalize text-white">
                    {detail.admin_role}
                  </span>
                ) : null}
              </div>
              <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
              <p className="mt-3 text-muted">{detail.email || "Brak e-maila konta"}</p>
            </div>
            {professional ? (
              <Link
                href={`/designers/${detail.user_id}`}
                className="rounded-xl border border-line bg-background px-5 py-3 text-center text-sm font-semibold hover:border-primary hover:text-primary"
              >
                Otwórz profil publiczny
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {sp.updated ? (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
            Status wewnętrznej weryfikacji został zapisany w dzienniku aktywności.
          </div>
        ) : sp.visibilityUpdated ? (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
            Widoczność publiczna została zaktualizowana i zapisana w dzienniku aktywności.
          </div>
        ) : sp.error ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {sp.error}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {[
            ["Projekty", counts.projects],
            ["Briefy", counts.briefs],
            ["Wysłane", counts.sent_inquiries],
            ["Otrzymane", counts.received_inquiries],
            ["Ulubione", counts.favorites],
            ["Wyświetlenia", counts.profile_views],
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
              <div className="text-sm font-semibold text-primary">Dane konta</div>
              <h2 className="mt-1 text-3xl font-bold">Szczegóły profilu</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {[
                  ["E-mail konta", detail.email],
                  ["E-mail profilu", profile.email],
                  ["Lokalizacja", profile.location],
                  ["Zawód", profile.profession_type],
                  ["Telefon", profile.phone],
                  ["Strona", profile.website],
                  ["Stawka godzinowa", profile.hourly_rate ? `${profile.hourly_rate} PLN` : null],
                  ["Doświadczenie", profile.years_experience ? `${profile.years_experience} lat` : null],
                  ["Dołączył/a", formatDate(detail.created_at)],
                  ["Ostatnie logowanie", formatDate(detail.last_sign_in_at)],
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
              <div className="text-sm font-semibold text-primary">Treści publiczne</div>
              <h2 className="mt-1 text-3xl font-bold">Projekty portfolio</h2>
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
                            <div className="font-semibold">{project.title || "Projekt bez tytułu"}</div>
                            <div className="mt-1 text-sm text-muted">
                              {project.category || "Bez kategorii"} | {formatDate(project.created_at)}
                            </div>
                          </div>
                          <span className={[
                            "rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                            project.visibility === "hidden"
                              ? "bg-red-50 text-red-700"
                              : "bg-emerald-50 text-emerald-800",
                          ].join(" ")}>
                            {project.visibility === "hidden" ? "Ukryty" : "Widoczny"}
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
                          value={project.visibility === "hidden" ? "" : "Ukryte podczas moderacji admina"}
                        />
                        <button className={[
                          "rounded-xl px-4 py-2.5 text-sm font-semibold",
                          project.visibility === "hidden"
                            ? "bg-primary text-white"
                            : "border border-red-200 bg-red-50 text-red-700",
                        ].join(" ")}>
                          {project.visibility === "hidden" ? "Przywróć projekt" : "Ukryj projekt"}
                        </button>
                        <span className="text-xs text-muted">Wpływa na publiczną stronę projektu.</span>
                      </form>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted">Brak publicznych projektów portfolio.</p>
              )}
            </section>
          </div>

          <aside className="grid h-fit gap-5 lg:sticky lg:top-40">
            <section className="rounded-lg border border-line bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-primary">Widoczność publiczna</div>
                <span className={[
                  "rounded-full px-3 py-1 text-xs font-semibold capitalize",
                  detail.profile_visibility === "hidden"
                    ? "bg-red-50 text-red-700"
                    : "bg-emerald-50 text-emerald-800",
                ].join(" ")}>
                  {detail.profile_visibility === "hidden" ? "Ukryty" : "Widoczny"}
                </span>
              </div>
              <h2 className="mt-2 text-2xl font-bold">Moderacja profilu</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Ukryte profile znikają z wyszukiwarki projektantów i publicznych stron.
                Właściciel zachowuje dostęp do konta, a istniejące rozmowy pozostają aktywne.
              </p>
              <form action={updateContentVisibility} className="mt-5 grid gap-4">
                <input type="hidden" name="user_id" value={detail.user_id} />
                <input type="hidden" name="entity_id" value={detail.user_id} />
                <input type="hidden" name="entity_type" value="profile" />
                <label className="text-sm font-semibold">
                  Widoczność
                  <select name="visibility" defaultValue={detail.profile_visibility || "visible"} className={fieldClass}>
                    <option value="visible">Widoczny</option>
                    <option value="hidden">Ukryty</option>
                  </select>
                </label>
                <label className="text-sm font-semibold">
                  Powód moderacji
                  <textarea
                    name="moderation_reason"
                    defaultValue={detail.profile_visibility_reason || ""}
                    rows={3}
                    maxLength={1000}
                    placeholder="Dlaczego profil jest ukryty"
                    className={fieldClass}
                  />
                </label>
                <button className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">
                  Zaktualizuj widoczność
                </button>
              </form>
            </section>

            <section className="rounded-lg border border-line bg-card p-6 shadow-sm">
              <div className="text-sm font-semibold text-primary">Weryfikacja wewnętrzna</div>
              <h2 className="mt-1 text-2xl font-bold">Notatka operacyjna</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Ten status służy wyłącznie pracy zespołu. Nie blokuje konta
                i nie pokazuje notatki użytkownikowi.
              </p>
              <form action={updateUserReview} className="mt-5 grid gap-4">
                <input type="hidden" name="user_id" value={detail.user_id} />
                <label className="text-sm font-semibold">
                  Status weryfikacji
                  <select name="review_status" defaultValue={detail.review?.status || "clear"} className={fieldClass}>
                    <option value="clear">Czyste</option>
                    <option value="needs_review">Do sprawdzenia</option>
                    <option value="priority">Priorytet</option>
                  </select>
                </label>
                <label className="text-sm font-semibold">
                  Notatka wewnętrzna
                  <textarea
                    name="internal_note"
                    defaultValue={detail.review?.internal_note || ""}
                    rows={6}
                    maxLength={4000}
                    placeholder="Kontekst dla właściciela lub zespołu wsparcia"
                    className={fieldClass}
                  />
                </label>
                <button className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">
                  Zapisz weryfikację
                </button>
              </form>
              {reviewUpdated ? (
                <div className="mt-4 text-xs text-muted">Ostatnia aktualizacja {formatDate(reviewUpdated)}</div>
              ) : null}
              <div className="mt-5 border-t border-line pt-4 text-xs leading-5 text-muted">
                Prywatne wiadomości i zdjęcia referencyjne są celowo niedostępne w tym panelu.
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
