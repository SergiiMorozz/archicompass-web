import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import ReferencePhotoGrid from "@/components/ReferencePhotoGrid";
import { briefLabel, briefListLabel, briefStyleLabel } from "@/lib/brief-labels";
import { sendInquiryNotificationEmail } from "@/lib/email/inquiry-notification";
import {
  referencePhotoPreviews,
  type ReferencePhotoPreview,
} from "@/lib/reference-photos";
import { getAccountRole } from "@/lib/studios";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { visualCues } from "@/lib/visual-cues";
import { getAccountFlowCopy } from "@/content/account-flow-copy";
import { profileLocationLabel, profileTypeLabel } from "@/lib/profile-system-labels";

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
  const copy = getAccountFlowCopy();
  return new Intl.DateTimeFormat(copy.dateLocale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function designerLabel(designer: Designer) {
  const copy = getAccountFlowCopy();
  const name = designer.full_name || copy.common.defaultProfessional;
  const detail = [profileTypeLabel(designer.profession_type || designer.user_type), profileLocationLabel(designer.location)]
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

  const copy = getAccountFlowCopy();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) redirect("/login");

  if ((await getAccountRole(supabase, user.id)) !== "client") {
    errorRedirect(copy.brief.errors.designerRole);
  }

  const briefId = textValue(formData, "brief_id");
  const recipientKey = textValue(formData, "recipient_key");
  const message = textValue(formData, "message");

  if (!briefId) errorRedirect(copy.brief.errors.selectBrief);
  if (!recipientKey) errorRedirect(copy.brief.errors.selectRecipient);
  const [recipientType, recipientId] = recipientKey.split(":");
  if (!recipientId || !["designer", "studio"].includes(recipientType)) {
    errorRedirect(copy.brief.errors.invalidRecipient);
  }

  let designerId = recipientId;
  let studioId: string | null = null;
  let designer: Designer;

  if (designerId === user.id) errorRedirect(copy.brief.errors.ownProfile);

  const { data: briefData, error: briefError } = await supabase
    .from("project_briefs")
    .select(
      "id, user_id, title, project_type, goal, style_direction, support_scope, budget_signal, timeline, area_m2, room_count, room_types, property_status, visualization_need, supervision_need, location, notes, visual_cues, reference_photo_names, reference_photo_paths, brief_text, designer_search_href, created_at"
    )
    .eq("id", briefId)
    .eq("user_id", user.id)
    .single();

  if (briefError || !briefData) {
    errorRedirect(copy.brief.errors.briefMissing);
  }

  const brief = briefData as ProjectBrief;

  if (recipientType === "studio") {
    const { data: studioData, error: studioError } = await supabase
      .from("studios")
      .select("id, owner_id, name, email, location")
      .eq("id", recipientId)
      .eq("published", true)
      .maybeSingle();
    if (studioError || !studioData) errorRedirect(copy.brief.errors.studioMissing);

    const studio = studioData as StudioRecipient;
    studioId = studio.id;
    designerId = studio.owner_id;
    designer = {
      id: studio.id,
      email: studio.email,
      full_name: studio.name,
      profession_type: copy.brief.studioProfession,
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
      errorRedirect(copy.brief.errors.designerMissing);
    }
    designer = designerData as Designer;
  }
  const subject = copy.brief.subject(brief.title || briefLabel(brief.project_type) || copy.common.projectBrief);
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
    errorRedirect(copy.brief.errors.duplicate);
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

  const copy = getAccountFlowCopy();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) redirect("/login");

  const briefId = textValue(formData, "brief_id");
  if (!briefId) errorRedirect(copy.brief.errors.briefMissing);

  const { data: existingInquiry, error: inquiryError } = await supabase
    .from("designer_inquiries")
    .select("id")
    .eq("client_id", user.id)
    .eq("brief_id", briefId)
    .limit(1)
    .maybeSingle();

  if (inquiryError) errorRedirect(inquiryError.message);
  if (existingInquiry) {
    errorRedirect(copy.brief.errors.alreadySentCannotDelete);
  }

  const { data: briefData, error: briefError } = await supabase
    .from("project_briefs")
    .select("id, reference_photo_paths")
    .eq("id", briefId)
    .eq("user_id", user.id)
    .single();

  if (briefError || !briefData) {
    errorRedirect(copy.brief.errors.briefMissing);
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
    .eq("user_type", "professional")
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
  const copy = getAccountFlowCopy();
  const workspaceHref = canSendBriefs ? "/account/inquiries" : "/studio/inbox";
  const workspaceLabel = copy.brief.workspaceLabel(canSendBriefs);

  return (
    <main className="bg-background">
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/account"
            className="inline-flex rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold text-muted hover:border-primary hover:text-primary"
          >
            {copy.brief.back}
          </Link>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <div className="text-sm font-semibold text-primary">{copy.brief.eyebrow}</div>
              <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">
                {copy.brief.title(canSendBriefs)}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
                {copy.brief.intro(canSendBriefs)}
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-background p-5 shadow-sm">
              <div className="text-sm font-semibold text-muted">
                {copy.brief.countLabel(canSendBriefs)}
              </div>
              <div className="mt-2 text-3xl font-bold text-primary">{briefs.length}</div>
              {canSendBriefs ? (
                <Link
                  href="/project-compass"
                  className="mt-4 flex rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  <span className="w-full">{copy.brief.create}</span>
                </Link>
              ) : (
                <Link
                  href="/project-compass"
                  className="mt-4 flex rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  <span className="w-full">{copy.brief.analyse}</span>
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
            <div className="font-semibold text-foreground">{copy.brief.designerModeTitle}</div>
            <p className="mt-1">
              {copy.brief.designerModeBody}
            </p>
            <Link
              href="/project-compass"
              className="mt-4 inline-flex rounded-xl border border-line bg-background px-4 py-2.5 font-semibold text-primary hover:border-primary"
            >
              {copy.brief.eyebrow}
            </Link>
          </div>
        ) : null}
        {sp.sent ? (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900">
            <div className="font-semibold">{copy.brief.sentTitle}</div>
            <p className="mt-1">
              {copy.brief.sentBody}
            </p>
          </div>
        ) : null}

        {sp.deleted ? (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900">
            <div className="font-semibold">{copy.brief.deletedTitle}</div>
            <p className="mt-1">{copy.brief.deletedBody}</p>
          </div>
        ) : null}

        {sp.error ? (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-700">
            <div className="font-semibold">{copy.brief.actionError}</div>
            <p className="mt-1">{sp.error}</p>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error.message}
          </div>
        ) : !briefs.length ? (
          <div className="rounded-2xl border border-dashed border-line bg-card p-8 text-center shadow-sm">
            <h2 className="text-2xl font-bold">{copy.brief.emptyTitle}</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">
              {copy.brief.emptyBody}
            </p>
            {canSendBriefs ? (
              <Link
                href="/project-compass"
                className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white"
              >
                {copy.brief.create}
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
                        {briefLabel(brief.project_type) || copy.common.projectBrief}
                      </div>
                      <h2 className="mt-1 text-2xl font-bold">
                        {brief.title || copy.common.projectBrief}
                      </h2>
                      <div className="mt-2 text-sm text-muted">
                        {copy.brief.created(createdLabel(brief.created_at))}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sp.brief === brief.id ? (
                        <span className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-white">
                          {copy.brief.selected}
                        </span>
                      ) : null}
                      <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary">
                        {copy.brief.photoCount(brief.reference_photo_names?.length ?? 0)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                    {[
                      [copy.brief.fields.goal, briefLabel(brief.goal)],
                      [copy.brief.fields.style, briefStyleLabel(brief.style_direction)],
                      [copy.brief.fields.scope, briefLabel(brief.support_scope)],
                      [copy.brief.fields.budget, briefLabel(brief.budget_signal)],
                      [copy.brief.fields.timeline, briefLabel(brief.timeline)],
                      [copy.brief.fields.area, brief.area_m2 ? `${brief.area_m2} m²` : null],
                      [copy.brief.fields.roomCount, brief.room_count ? String(brief.room_count) : null],
                      [copy.brief.fields.rooms, briefListLabel(brief.room_types) || null],
                      [copy.brief.fields.propertyStatus, briefLabel(brief.property_status)],
                      [copy.brief.fields.visualization, briefLabel(brief.visualization_need)],
                      [copy.brief.fields.supervision, briefLabel(brief.supervision_need)],
                      [copy.brief.fields.location, brief.location],
                      [copy.brief.fields.visualCues, visualCues(brief.visual_cues).join(", ") || copy.common.noTags],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-line bg-background p-3">
                        <div className="text-muted">{label}</div>
                        <div className="mt-1 font-semibold">{value || copy.common.notProvided}</div>
                      </div>
                    ))}
                  </div>

                  <pre className="mt-5 max-h-64 overflow-auto whitespace-pre-wrap rounded-2xl bg-[#1f172a] p-4 text-xs leading-6 text-white/78">
                    {brief.brief_text}
                  </pre>

                  <ReferencePhotoGrid
                    photos={briefPhotos.get(brief.id) ?? []}
                    title={copy.brief.referencePhotos}
                  />

                  <div className="mt-5 rounded-2xl border border-line bg-background p-4">
                    <div className="text-sm font-semibold">
                      {copy.brief.sendPanelTitle(canSendBriefs)}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-muted">
                      {copy.brief.sendPanelBody(canSendBriefs)}
                    </p>

                    {canSendBriefs && (designers.length || studios.length) ? (
                      <form action={sendBriefInquiry} className="mt-4 grid gap-4">
                        <input type="hidden" name="brief_id" value={brief.id} />
                        <label className="block text-sm font-semibold">
                          {copy.brief.recipient}
                          <select
                            name="recipient_key"
                            defaultValue={preselectedRecipient}
                            className={fieldClass}
                            required
                          >
                            <option value="">{copy.brief.recipientPlaceholder}</option>
                            {designers.length ? (
                              <optgroup label={copy.brief.independentDesigners}>
                                {designers.map((designer) => (
                                  <option key={designer.id} value={`designer:${designer.id}`}>
                                    {designerLabel(designer)}
                                  </option>
                                ))}
                              </optgroup>
                            ) : null}
                            {studios.length ? (
                              <optgroup label={copy.brief.studios}>
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
                          {copy.brief.message}
                          <textarea
                            name="message"
                            rows={4}
                            className={areaClass}
                            placeholder={copy.brief.messagePlaceholder}
                          />
                        </label>

                        <button
                          type="submit"
                          className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
                        >
                          {copy.brief.send}
                        </button>
                      </form>
                    ) : !canSendBriefs ? (
                      <div className="mt-4 rounded-xl border border-line bg-card p-4 text-sm leading-6 text-muted">
                        {copy.brief.designerCannotSend}
                      </div>
                    ) : (
                      <div className="mt-4 rounded-xl border border-dashed border-line p-4 text-sm leading-6 text-muted">
                        {copy.brief.noRecipients}
                      </div>
                    )}

                    {sentInquiries.length ? (
                      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
                        <div className="font-semibold">{copy.brief.alreadySent}</div>
                        <div className="mt-1">
                          {sentInquiries
                            .slice(0, 3)
                            .map((inquiry) => {
                              const studio = inquiry.studio_id
                                ? studiosById.get(inquiry.studio_id)
                                : null;
                              if (studio) return studio.name;
                              const designer = designersById.get(inquiry.designer_id);
                              return designer ? designer.full_name || copy.common.defaultProfessional : copy.common.designer;
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
                      {copy.brief.matchingDesigners}
                    </Link>
                    {canSendBriefs ? (
                      <Link
                        href="/project-compass"
                        className="rounded-xl border border-line bg-background px-4 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
                      >
                        {copy.brief.createAnother}
                      </Link>
                    ) : null}
                  </div>

                  <details className="mt-5 overflow-hidden rounded-xl border border-red-200 bg-red-50">
                    <summary className="block cursor-pointer px-3.5 py-2.5 text-sm font-semibold text-red-700">
                      {copy.brief.deleteSummary}
                    </summary>
                    <div className="border-t border-red-200 p-4">
                      <p className="text-sm leading-6 text-red-700">
                        {copy.brief.deleteBody}
                      </p>
                      <form action={deleteSavedBrief} className="mt-4">
                        <input type="hidden" name="brief_id" value={brief.id} />
                        <button
                          type="submit"
                          className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          {copy.brief.delete}
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
