import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import ReferencePhotoGrid from "@/components/ReferencePhotoGrid";
import { briefLabel, briefListLabel, briefStyleLabel } from "@/lib/brief-labels";
import { polishCountLabel } from "@/lib/count-label";
import { sendInquiryNotificationEmail } from "@/lib/email/inquiry-notification";
import {
  referencePhotoPreviews,
  type ReferencePhotoPreview,
} from "@/lib/reference-photos";
import { getAccountRole } from "@/lib/studios";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { polishVisualCues } from "@/lib/visual-cues";

export const revalidate = 0;

type ProjectBrief = {
  id: string;
  user_id: string;
  title: string | null;
  project_type: string | null;
  goal: string | null;
  style_direction: string | null;
  support_scope: string | null;
  budget_signal: string | null;
  timeline: string | null;
  area_m2: number | null;
  room_count: number | null;
  room_types: string[] | null;
  property_status: string | null;
  visualization_need: string | null;
  supervision_need: string | null;
  location: string | null;
  notes: string | null;
  visual_cues: string[] | null;
  reference_photo_names: string[] | null;
  reference_photo_paths: string[] | null;
  brief_text: string;
  designer_search_href: string | null;
  created_at: string;
};

type Designer = {
  email: string | null;
  id: string;
  full_name: string | null;
  profession_type: string | null;
  user_type: string | null;
  location: string | null;
};

type DesignerInquiry = {
  id: string;
  brief_id: string | null;
  designer_id: string;
  studio_id: string | null;
  created_at: string;
};

type StudioRecipient = {
  id: string;
  owner_id: string;
  name: string;
  email: string | null;
  location: string | null;
};

const fieldClass =
  "mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal text-foreground outline-none transition focus:border-primary";
const areaClass =
  "mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal text-foreground outline-none transition focus:border-primary";

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function createdLabel(value: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function designerLabel(designer: Designer) {
  const name = designer.full_name || "Specjalista ArchiCompass";
  const detail = [designer.profession_type || designer.user_type, designer.location]
    .filter(Boolean)
    .join(" · ");
  return detail ? `${name} — ${detail}` : name;
}

function matchingDesignersHref(brief: ProjectBrief) {
  const source = brief.designer_search_href?.startsWith("/designers")
    ? brief.designer_search_href
    : "/designers";
  const url = new URL(source, "https://archicompass.local");
  url.searchParams.set("match", "brief");
  url.searchParams.set("brief", brief.id);
  if (!url.searchParams.has("sort")) url.searchParams.set("sort", "recommended");
  if (!url.searchParams.has("view")) url.searchParams.set("view", "list");
  return `${url.pathname}?${url.searchParams.toString()}`;
}

function errorRedirect(message: string): never {
  redirect(`/account/briefs?error=${encodeURIComponent(message)}`);
}

async function sendBriefInquiry(formData: FormData) {
  "use server";

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) redirect("/login");

  if ((await getAccountRole(supabase, user.id)) !== "client") {
    errorRedirect("Konto projektanta może otrzymywać briefy, ale nie może wysyłać zapytań jako klient.");
  }

  const briefId = textValue(formData, "brief_id");
  const recipientKey = textValue(formData, "recipient_key");
  const message = textValue(formData, "message");

  if (!briefId) errorRedirect("Najpierw wybierz zapisany brief.");
  if (!recipientKey) errorRedirect("Przed wysłaniem briefu wybierz projektanta lub pracownię.");
  const [recipientType, recipientId] = recipientKey.split(":");
  if (!recipientId || !["designer", "studio"].includes(recipientType)) {
    errorRedirect("Wybierz prawidłowy profil projektanta lub pracowni.");
  }

  let designerId = recipientId;
  let studioId: string | null = null;
  let designer: Designer;

  if (designerId === user.id) errorRedirect("Wybierz innego projektanta, a nie własny profil.");

  const { data: briefData, error: briefError } = await supabase
    .from("project_briefs")
    .select(
      "id, user_id, title, project_type, goal, style_direction, support_scope, budget_signal, timeline, area_m2, room_count, room_types, property_status, visualization_need, supervision_need, location, notes, visual_cues, reference_photo_names, reference_photo_paths, brief_text, designer_search_href, created_at"
    )
    .eq("id", briefId)
    .eq("user_id", user.id)
    .single();

  if (briefError || !briefData) {
    errorRedirect("Nie znaleziono wybranego zapisanego briefu.");
  }

  const brief = briefData as ProjectBrief;

  if (recipientType === "studio") {
    const { data: studioData, error: studioError } = await supabase
      .from("studios")
      .select("id, owner_id, name, email, location")
      .eq("id", recipientId)
      .eq("published", true)
      .maybeSingle();
    if (studioError || !studioData) errorRedirect("Nie znaleziono profilu tej pracowni.");

    const studio = studioData as StudioRecipient;
    studioId = studio.id;
    designerId = studio.owner_id;
    designer = {
      id: studio.id,
      email: studio.email,
      full_name: studio.name,
      profession_type: "Pracownia projektowa",
      user_type: "professional",
      location: studio.location,
    };
  } else {
    const { data: designerData, error: designerError } = await supabase
      .from("profiles")
      .select("id, email, full_name, profession_type, user_type, location")
      .eq("id", designerId)
      .eq("user_type", "professional")
      .maybeSingle();

    if (designerError || !designerData) {
      errorRedirect("Nie znaleziono profilu tego projektanta.");
    }
    designer = designerData as Designer;
  }
  const subject = `Zapytanie projektowe: ${brief.title || briefLabel(brief.project_type) || "brief projektowy"}`;
  let duplicateQuery = supabase
    .from("designer_inquiries")
    .select("id")
    .eq("client_id", user.id)
    .eq("brief_id", brief.id);
  duplicateQuery = studioId
    ? duplicateQuery.eq("studio_id", studioId)
    : duplicateQuery.eq("designer_id", designerId).is("studio_id", null);
  const { data: existingInquiry, error: duplicateError } = await duplicateQuery.limit(1).maybeSingle();
  if (duplicateError) errorRedirect(duplicateError.message);
  if (existingInquiry) {
    errorRedirect("Ten brief został już wysłany do wybranego specjalisty.");
  }

  const inquiryId = crypto.randomUUID();
  const { error } = await supabase.from("designer_inquiries").insert({
    id: inquiryId,
    client_id: user.id,
    designer_id: designerId,
    studio_id: studioId,
    brief_id: brief.id,
    subject,
    message,
    status: "sent",
    brief_snapshot: {
      title: brief.title,
      project_type: brief.project_type,
      goal: brief.goal,
      style_direction: brief.style_direction,
      support_scope: brief.support_scope,
      budget_signal: brief.budget_signal,
      timeline: brief.timeline,
      area_m2: brief.area_m2,
      room_count: brief.room_count,
      room_types: brief.room_types ?? [],
      property_status: brief.property_status,
      visualization_need: brief.visualization_need,
      supervision_need: brief.supervision_need,
      location: brief.location,
      notes: brief.notes,
      visual_cues: brief.visual_cues ?? [],
      reference_photo_count: brief.reference_photo_names?.length ?? 0,
    },
    brief_text: brief.brief_text,
    reference_photo_names: brief.reference_photo_names ?? [],
    reference_photo_paths: brief.reference_photo_paths ?? [],
  });

  if (error) errorRedirect(error.message);

  const notification = await sendInquiryNotificationEmail({
    brief,
    clientEmail: user.email ?? null,
    designer,
    inquiryId,
    message,
  });
  const { error: notificationRecordError } = await supabase.rpc(
    "record_my_inquiry_email_delivery",
    {
      delivered_at: notification.sentAt,
      delivery_error: notification.error,
      delivery_status: notification.status,
      target_inquiry_id: inquiryId,
    }
  );
  if (notificationRecordError) {
    console.error("Inquiry email delivery result was not recorded", notificationRecordError);
  }

  revalidatePath("/account");
  revalidatePath("/account/briefs");
  revalidatePath("/account/inquiries");
  redirect("/account/briefs?sent=1");
}

async function deleteSavedBrief(formData: FormData) {
  "use server";

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) redirect("/login");

  const briefId = textValue(formData, "brief_id");
  if (!briefId) errorRedirect("Nie znaleziono zapisanego briefu.");

  const { data: existingInquiry, error: inquiryError } = await supabase
    .from("designer_inquiries")
    .select("id")
    .eq("client_id", user.id)
    .eq("brief_id", briefId)
    .limit(1)
    .maybeSingle();

  if (inquiryError) errorRedirect(inquiryError.message);
  if (existingInquiry) {
    errorRedirect("Ten brief został już wysłany. Anuluj zapytanie przed usunięciem briefu.");
  }

  const { data: briefData, error: briefError } = await supabase
    .from("project_briefs")
    .select("id, reference_photo_paths")
    .eq("id", briefId)
    .eq("user_id", user.id)
    .single();

  if (briefError || !briefData) {
    errorRedirect("Nie znaleziono zapisanego briefu.");
  }

  const brief = briefData as Pick<ProjectBrief, "id" | "reference_photo_paths">;
  const { error } = await supabase
    .from("project_briefs")
    .delete()
    .eq("id", briefId)
    .eq("user_id", user.id);

  if (error) errorRedirect(error.message);

  const pathsToRemove = brief.reference_photo_paths?.filter(Boolean) ?? [];
  if (pathsToRemove.length) {
    await supabase.storage.from("brief-reference-photos").remove(pathsToRemove);
  }

  revalidatePath("/account");
  revalidatePath("/account/briefs");
  redirect("/account/briefs?deleted=1");
}

export default async function SavedBriefsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    deleted?: string;
    designer?: string;
    studio?: string;
    brief?: string;
    error?: string;
    sent?: string;
  }>;
}) {
  const sp = (await searchParams) ?? {};
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    const nextParams = new URLSearchParams();
    if (sp.designer) nextParams.set("designer", sp.designer);
    if (sp.studio) nextParams.set("studio", sp.studio);
    if (sp.brief) nextParams.set("brief", sp.brief);
    const nextPath = `/account/briefs${nextParams.size ? `?${nextParams.toString()}` : ""}`;
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  const accountRole = await getAccountRole(supabase, user.id);
  const canSendBriefs = accountRole === "client";

  const { data: briefsData, error } = await supabase
    .from("project_briefs")
    .select(
      "id, user_id, title, project_type, goal, style_direction, support_scope, budget_signal, timeline, area_m2, room_count, room_types, property_status, visualization_need, supervision_need, location, notes, visual_cues, reference_photo_names, reference_photo_paths, brief_text, designer_search_href, created_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(24);

  const { data: designersData } = await supabase
    .from("profiles")
    .select("id, email, full_name, profession_type, user_type, location")
    .neq("id", user.id)
    .order("full_name", { ascending: true })
    .limit(100);

  const { data: studiosData } = await supabase
    .from("studios")
    .select("id, owner_id, name, email, location")
    .eq("published", true)
    .order("name", { ascending: true })
    .limit(100);

  const { data: inquiriesData } = await supabase
    .from("designer_inquiries")
    .select("id, brief_id, designer_id, studio_id, created_at")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const briefs = [...((briefsData ?? []) as ProjectBrief[])].sort((left, right) => {
    if (!sp.brief) return 0;
    if (left.id === sp.brief) return -1;
    if (right.id === sp.brief) return 1;
    return 0;
  });
  const designers = (designersData ?? []) as Designer[];
  const studios = (studiosData ?? []) as StudioRecipient[];
  const inquiries = (inquiriesData ?? []) as DesignerInquiry[];
  const briefPhotoEntries = await Promise.all(
    briefs.map(
      async (brief): Promise<[string, ReferencePhotoPreview[]]> => [
        brief.id,
        await referencePhotoPreviews(
          supabase,
          brief.reference_photo_names,
          brief.reference_photo_paths
        ),
      ]
    )
  );
  const briefPhotos = new Map<string, ReferencePhotoPreview[]>(
    briefPhotoEntries
  );
  const preselectedRecipient = studios.some((studio) => studio.id === sp.studio)
    ? `studio:${sp.studio}`
    : designers.some((designer) => designer.id === sp.designer)
      ? `designer:${sp.designer}`
      : "";
  const designersById = new Map(designers.map((designer) => [designer.id, designer]));
  const studiosById = new Map(studios.map((studio) => [studio.id, studio]));
  const workspaceHref = canSendBriefs ? "/account/inquiries" : "/studio/inbox";
  const workspaceLabel = canSendBriefs ? "Zobacz wysłane zapytania" : "Otwórz Studio projektanta";

  return (
    <main className="bg-background">
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/account"
            className="inline-flex rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold text-muted hover:border-primary hover:text-primary"
          >
            Wróć do konta
          </Link>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <div className="text-sm font-semibold text-primary">AI Project Compass</div>
              <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">
                {canSendBriefs ? "Zapisane briefy" : "Historia analiz"}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
                {canSendBriefs
                  ? "Przejrzyj briefy utworzone w AI Project Compass i wyślij jeden do projektanta lub pracowni jako czytelne pierwsze zapytanie."
                  : "Wróć do wcześniejszych analiz inspiracji. Projektanci korzystają z AI Project Compass, ale nie wysyłają briefów jako klienci."}
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-background p-5 shadow-sm">
              <div className="text-sm font-semibold text-muted">
                {canSendBriefs ? "Zapisane briefy" : "Analizy w historii"}
              </div>
              <div className="mt-2 text-3xl font-bold text-primary">{briefs.length}</div>
              {canSendBriefs ? (
                <Link
                  href="/project-compass"
                  className="mt-4 flex rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  <span className="w-full">Utwórz nowy brief</span>
                </Link>
              ) : (
                <Link
                  href="/project-compass"
                  className="mt-4 flex rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  <span className="w-full">Analizuj inspiracje</span>
                </Link>
              )}
              <Link
                href={workspaceHref}
                className="mt-3 flex rounded-xl border border-line bg-card px-4 py-3 text-center text-sm font-semibold hover:border-primary hover:text-primary"
              >
                <span className="w-full">{workspaceLabel}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {!canSendBriefs ? (
          <div className="mb-5 rounded-2xl border border-line bg-card p-5 text-sm leading-6 text-muted">
            <div className="font-semibold text-foreground">Tryb konta projektanta</div>
            <p className="mt-1">
              To konto otrzymuje zapytania projektowe w Studio. Możesz analizować inspiracje w AI Project Compass, ale wysyłanie briefów jest zarezerwowane dla kont klientów.
            </p>
            <Link
              href="/project-compass"
              className="mt-4 inline-flex rounded-xl border border-line bg-background px-4 py-2.5 font-semibold text-primary hover:border-primary"
            >
              Otwórz AI Project Compass
            </Link>
          </div>
        ) : null}
        {sp.sent ? (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900">
            <div className="font-semibold">Brief wysłany</div>
            <p className="mt-1">
              Zapytanie zostało zapisane w ArchiCompass. Możesz je sprawdzić w zakładce zapytań.
            </p>
          </div>
        ) : null}

        {sp.deleted ? (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900">
            <div className="font-semibold">Brief usunięty</div>
            <p className="mt-1">Zapisany brief i prywatne zdjęcia referencyjne zostały usunięte.</p>
          </div>
        ) : null}

        {sp.error ? (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-700">
            <div className="font-semibold">Nie udało się wykonać działania na briefie</div>
            <p className="mt-1">{sp.error}</p>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error.message}
          </div>
        ) : !briefs.length ? (
          <div className="rounded-2xl border border-dashed border-line bg-card p-8 text-center shadow-sm">
            <h2 className="text-2xl font-bold">Nie masz jeszcze zapisanych briefów</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">
              Utwórz brief AI Project Compass z kierunkiem stylistycznym, wskazówkami wizualnymi
              i zdjęciami referencyjnymi, a następnie zapisz go tutaj.
            </p>
            {canSendBriefs ? (
              <Link
                href="/project-compass"
                className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white"
              >
                Utwórz brief projektowy
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {briefs.map((brief) => {
              const sentInquiries = inquiries.filter((inquiry) => inquiry.brief_id === brief.id);

              return (
                <article
                  id={brief.id}
                  key={brief.id}
                  className="rounded-2xl border border-line bg-card p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-primary">
                        {briefLabel(brief.project_type) || "Brief projektowy"}
                      </div>
                      <h2 className="mt-1 text-2xl font-bold">
                        {brief.title || "Brief bez tytułu"}
                      </h2>
                      <div className="mt-2 text-sm text-muted">
                        Zapisano {createdLabel(brief.created_at)}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sp.brief === brief.id ? (
                        <span className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-white">
                          Wybrany brief
                        </span>
                      ) : null}
                      <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary">
                        {polishCountLabel(brief.reference_photo_names?.length ?? 0, "zdjęcie", "zdjęcia", "zdjęć")}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                    {[
                      ["Cel", briefLabel(brief.goal)],
                      ["Style", briefStyleLabel(brief.style_direction)],
                      ["Zakres", briefLabel(brief.support_scope)],
                      ["Budżet", briefLabel(brief.budget_signal)],
                      ["Termin", briefLabel(brief.timeline)],
                      ["Powierzchnia", brief.area_m2 ? `${brief.area_m2} m²` : null],
                      ["Liczba pomieszczeń", brief.room_count ? String(brief.room_count) : null],
                      ["Pomieszczenia", briefListLabel(brief.room_types) || null],
                      ["Status nieruchomości", briefLabel(brief.property_status)],
                      ["Wizualizacja 3D", briefLabel(brief.visualization_need)],
                      ["Nadzór", briefLabel(brief.supervision_need)],
                      ["Lokalizacja", brief.location],
                      ["Wskazówki wizualne", polishVisualCues(brief.visual_cues).join(", ") || "Brak tagów"],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-line bg-background p-3">
                        <div className="text-muted">{label}</div>
                        <div className="mt-1 font-semibold">{value || "Nie podano"}</div>
                      </div>
                    ))}
                  </div>

                  <pre className="mt-5 max-h-64 overflow-auto whitespace-pre-wrap rounded-2xl bg-[#1f172a] p-4 text-xs leading-6 text-white/78">
                    {brief.brief_text}
                  </pre>

                  <ReferencePhotoGrid
                    photos={briefPhotos.get(brief.id) ?? []}
                    title="Zdjęcia referencyjne briefu"
                  />

                  <div className="mt-5 rounded-2xl border border-line bg-background p-4">
                    <div className="text-sm font-semibold">
                      {canSendBriefs ? "Wyślij ten brief" : "Brief do analizy"}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-muted">
                      {canSendBriefs
                        ? "Wybierz projektanta lub pracownię i dodaj krótką wiadomość. Pełny brief zostanie zapisany razem z zapytaniem."
                        : "Ten zapis pozostaje prywatną historią analizy. Zapytania od klientów znajdziesz w Studio projektanta."}
                    </p>

                    {canSendBriefs && (designers.length || studios.length) ? (
                      <form action={sendBriefInquiry} className="mt-4 grid gap-4">
                        <input type="hidden" name="brief_id" value={brief.id} />
                        <label className="block text-sm font-semibold">
                          Odbiorca
                          <select
                            name="recipient_key"
                            defaultValue={preselectedRecipient}
                            className={fieldClass}
                            required
                          >
                            <option value="">Wybierz projektanta lub pracownię</option>
                            {designers.length ? (
                              <optgroup label="Niezależni projektanci">
                                {designers.map((designer) => (
                                  <option key={designer.id} value={`designer:${designer.id}`}>
                                    {designerLabel(designer)}
                                  </option>
                                ))}
                              </optgroup>
                            ) : null}
                            {studios.length ? (
                              <optgroup label="Pracownie projektowe">
                                {studios.map((studio) => (
                                  <option key={studio.id} value={`studio:${studio.id}`}>
                                    {studio.name}{studio.location ? ` — ${studio.location}` : ""}
                                  </option>
                                ))}
                              </optgroup>
                            ) : null}
                          </select>
                        </label>

                        <label className="block text-sm font-semibold">
                          Wiadomość
                          <textarea
                            name="message"
                            rows={4}
                            className={areaClass}
                            placeholder="Dzień dobry, przygotowałem brief AI Project Compass i chciałbym sprawdzić, czy ten projekt pasuje do Państwa zakresu pracy."
                          />
                        </label>

                        <button
                          type="submit"
                          className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
                        >
                          Wyślij brief
                        </button>
                      </form>
                    ) : !canSendBriefs ? (
                      <div className="mt-4 rounded-xl border border-line bg-card p-4 text-sm leading-6 text-muted">
                        Konta projektantów nie mogą wysyłać briefów jako klienci.
                      </div>
                    ) : (
                      <div className="mt-4 rounded-xl border border-dashed border-line p-4 text-sm leading-6 text-muted">
                        Nie ma jeszcze dostępnych profili projektantów ani pracowni.
                      </div>
                    )}

                    {sentInquiries.length ? (
                      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
                        <div className="font-semibold">Już wysłano</div>
                        <div className="mt-1">
                          {sentInquiries
                            .slice(0, 3)
                            .map((inquiry) => {
                              const studio = inquiry.studio_id
                                ? studiosById.get(inquiry.studio_id)
                                : null;
                              if (studio) return studio.name;
                              const designer = designersById.get(inquiry.designer_id);
                              return designer ? designer.full_name || "Specjalista ArchiCompass" : "Projektant";
                            })
                            .join(", ")}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={matchingDesignersHref(brief)}
                      className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
                    >
                      Znajdź dopasowanych projektantów
                    </Link>
                    {canSendBriefs ? (
                      <Link
                        href="/project-compass"
                        className="rounded-xl border border-line bg-background px-4 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
                      >
                        Utwórz kolejny brief
                      </Link>
                    ) : null}
                  </div>

                  <details className="mt-5 overflow-hidden rounded-xl border border-red-200 bg-red-50">
                    <summary className="block cursor-pointer px-3.5 py-2.5 text-sm font-semibold text-red-700">
                      Usuń zapisany brief
                    </summary>
                    <div className="border-t border-red-200 p-4">
                      <p className="text-sm leading-6 text-red-700">
                        To usunie zapisany brief i prywatne zdjęcia referencyjne.
                        Briefy wysłane już do projektantów trzeba najpierw anulować.
                      </p>
                      <form action={deleteSavedBrief} className="mt-4">
                        <input type="hidden" name="brief_id" value={brief.id} />
                        <button
                          type="submit"
                          className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          Usuń ten brief
                        </button>
                      </form>
                    </div>
                  </details>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
