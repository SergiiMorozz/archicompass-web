import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import ReferencePhotoGrid from "@/components/ReferencePhotoGrid";
import {
  referencePhotoPreviews,
  type ReferencePhotoPreview,
} from "@/lib/reference-photos";
import { briefInquirySubject, briefSnapshotLabel } from "@/lib/brief-labels";
import { getAccountFlowCopy } from "@/content/account-flow-copy";
import { profileLocationLabel, profileTypeLabel } from "@/lib/profile-system-labels";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getExplicitAccountRole } from "@/lib/studios";

export const revalidate = 0;

type Inquiry = {
  id: string;
  client_id: string;
  designer_id: string;
  brief_id: string | null;
  subject: string;
  message: string | null;
  status: string;
  brief_snapshot: Record<string, unknown> | null;
  brief_text: string;
  reference_photo_names: string[] | null;
  reference_photo_paths: string[] | null;
  created_at: string;
};

type Profile = {
  id: string;
  full_name: string | null;
  profession_type: string | null;
  user_type: string | null;
  location: string | null;
  email: string | null;
};

const designerStatuses = ["reviewing", "accepted", "declined"] as const;

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function statusLabel(status: string) {
  return getAccountFlowCopy().inquiries.statuses[status] || status;
}

function statusClass(status: string) {
  if (status === "accepted") return "bg-emerald-50 text-emerald-800";
  if (status === "declined") return "bg-red-50 text-red-700";
  if (status === "reviewing") return "bg-[#fff3df] text-[#9a5a00]";
  return "bg-primary-soft text-primary";
}

function createdLabel(value: string) {
  return new Intl.DateTimeFormat(getAccountFlowCopy().dateLocale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function profileName(profile?: Profile) {
  return profile?.full_name || getAccountFlowCopy().common.defaultProfessional;
}

function profileMeta(profile?: Profile) {
  if (!profile) return "";
  return [profileTypeLabel(profile?.profession_type || profile?.user_type), profileLocationLabel(profile?.location)]
    .filter(Boolean)
    .join(" · ");
}

function snapshotText(snapshot: Record<string, unknown> | null, key: string) {
  return briefSnapshotLabel(snapshot, key);
}

function errorRedirect(message: string) {
  redirect(`/account/inquiries?error=${encodeURIComponent(message)}`);
}

async function updateInquiryStatus(formData: FormData) {
  "use server";

  const copy = getAccountFlowCopy();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) redirect("/login");

  const inquiryId = textValue(formData, "inquiry_id");
  const status = textValue(formData, "status");

  if (!inquiryId) errorRedirect(copy.inquiries.errors.missing);
  if (!status || !designerStatuses.includes(status as (typeof designerStatuses)[number])) {
    errorRedirect(copy.inquiries.errors.invalidStatus);
  }

  const { data: updated, error } = await supabase
    .from("designer_inquiries")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", inquiryId)
    .eq("designer_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) errorRedirect(error.message);
  if (!updated) errorRedirect(copy.inquiries.errors.receiverOnly);

  revalidatePath("/account");
  revalidatePath("/account/inquiries");
  redirect("/account/inquiries?updated=1");
}

async function cancelSentInquiry(formData: FormData) {
  "use server";

  const copy = getAccountFlowCopy();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) redirect("/login");

  const inquiryId = textValue(formData, "inquiry_id");
  if (!inquiryId) errorRedirect(copy.inquiries.errors.missing);

  const { data: deleted, error } = await supabase
    .from("designer_inquiries")
    .delete()
    .eq("id", inquiryId)
    .eq("client_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) errorRedirect(error.message);
  if (!deleted) errorRedirect(copy.inquiries.errors.senderOnly);

  revalidatePath("/account");
  revalidatePath("/account/briefs");
  revalidatePath("/account/inquiries");
  redirect("/account/inquiries?cancelled=1");
}

function InquiryCard({
  inquiry,
  mode,
  photos,
  profile,
}: {
  inquiry: Inquiry;
  mode: "sent" | "incoming";
  photos: ReferencePhotoPreview[];
  profile?: Profile;
}) {
  const copy = getAccountFlowCopy();
  const snapshot = inquiry.brief_snapshot;

  return (
    <article className="rounded-2xl border border-line bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-primary">
            {mode === "sent" ? copy.inquiries.sentTo : copy.inquiries.inquiryFrom}
          </div>
          <h2 className="mt-1 text-2xl font-bold">{profileName(profile)}</h2>
          {profileMeta(profile) ? (
            <div className="mt-1 text-sm text-muted">{profileMeta(profile)}</div>
          ) : null}
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusClass(inquiry.status)}`}>
          {statusLabel(inquiry.status)}
        </span>
      </div>

      <div className="mt-5 text-sm text-muted">{copy.inquiries.sentOn(createdLabel(inquiry.created_at))}</div>
      <h3 className="mt-2 text-xl font-bold">{briefInquirySubject(inquiry.brief_snapshot)}</h3>

      {inquiry.message ? (
        <div className="mt-4 rounded-2xl border border-line bg-background p-4 text-sm leading-6">
          {inquiry.message}
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        {[
          [copy.inquiries.fields.project, snapshotText(snapshot, "project_type")],
          [copy.inquiries.fields.styles, snapshotText(snapshot, "style_direction")],
          [copy.inquiries.fields.scope, snapshotText(snapshot, "support_scope")],
          [copy.inquiries.fields.budget, snapshotText(snapshot, "budget_signal")],
          [copy.inquiries.fields.timeline, snapshotText(snapshot, "timeline")],
          [copy.inquiries.fields.area, snapshotText(snapshot, "area_m2") === copy.common.notProvided ? copy.common.notProvided : `${snapshotText(snapshot, "area_m2")} m²`],
          [copy.inquiries.fields.rooms, snapshotText(snapshot, "room_types")],
          [copy.inquiries.fields.property, snapshotText(snapshot, "property_status")],
          [copy.inquiries.fields.visualisation, snapshotText(snapshot, "visualization_need")],
          [copy.inquiries.fields.supervision, snapshotText(snapshot, "supervision_need")],
          [copy.inquiries.fields.location, snapshotText(snapshot, "location")],
          [copy.inquiries.fields.goal, snapshotText(snapshot, "goal")],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-line bg-background p-3">
            <div className="text-muted">{label}</div>
            <div className="mt-1 font-semibold">{value}</div>
          </div>
        ))}
      </div>

      <pre className="mt-5 max-h-56 overflow-auto whitespace-pre-wrap rounded-2xl bg-[#1f172a] p-4 text-xs leading-6 text-white/78">
        {inquiry.brief_text}
      </pre>

      <ReferencePhotoGrid photos={photos} title={copy.inquiries.referencePhotos} />

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={
            mode === "incoming"
              ? `/studio/inbox/${inquiry.id}`
              : `/account/inquiries/${inquiry.id}`
          }
          className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
        >
          {copy.inquiries.openConversation}
        </Link>
        {mode === "sent" ? (
          <Link
            href={`/designers/${inquiry.designer_id}`}
            className="rounded-xl border border-line bg-background px-4 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
          >
            {copy.inquiries.openDesignerProfile}
          </Link>
        ) : profile?.email ? (
          <a
            href={`mailto:${profile.email}?subject=${encodeURIComponent(`Re: ${briefInquirySubject(inquiry.brief_snapshot)}`)}`}
            className="rounded-xl border border-line bg-background px-4 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
          >
            {copy.inquiries.replyByEmail}
          </a>
        ) : null}
      </div>

      {mode === "incoming" ? (
        <form
          action={updateInquiryStatus}
          className="mt-5 grid gap-3 rounded-2xl border border-line bg-background p-4 sm:grid-cols-[1fr_auto]"
        >
          <input type="hidden" name="inquiry_id" value={inquiry.id} />
          <label className="block text-sm font-semibold">
            {copy.inquiries.statusLabel}
            <select
              name="status"
              defaultValue={
                designerStatuses.includes(inquiry.status as (typeof designerStatuses)[number])
                  ? inquiry.status
                  : "reviewing"
              }
              className="mt-2 w-full rounded-xl border border-line bg-card px-4 py-3 font-normal text-foreground outline-none transition focus:border-primary"
            >
              <option value="reviewing">{copy.inquiries.statuses.reviewing}</option>
              <option value="accepted">{copy.inquiries.statuses.accepted}</option>
              <option value="declined">{copy.inquiries.statuses.declined}</option>
            </select>
          </label>
          <button
            type="submit"
            className="self-end rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
          >
            {copy.inquiries.updateStatus}
          </button>
        </form>
      ) : null}

      {mode === "sent" ? (
        <details className="mt-5 overflow-hidden rounded-xl border border-red-200 bg-red-50">
          <summary className="block cursor-pointer px-3.5 py-2.5 text-sm font-semibold text-red-700">
            {copy.inquiries.cancelSummary}
          </summary>
          <div className="border-t border-red-200 p-4">
            <p className="text-sm leading-6 text-red-700">
              {copy.inquiries.cancelBody}
            </p>
            <form action={cancelSentInquiry} className="mt-4">
              <input type="hidden" name="inquiry_id" value={inquiry.id} />
              <button
                type="submit"
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
              >
                {copy.inquiries.cancel}
              </button>
            </form>
          </div>
        </details>
      ) : null}
    </article>
  );
}

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams?: Promise<{ cancelled?: string; error?: string; updated?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) redirect("/login");
  const accountRole = await getExplicitAccountRole(supabase, user.id);
  if (!accountRole) redirect("/onboarding?next=%2Faccount%2Finquiries");
  const isDesigner = accountRole === "designer";

  const { data: sentData, error: sentError } = !isDesigner ? await supabase
    .from("designer_inquiries")
    .select(
      "id, client_id, designer_id, brief_id, subject, message, status, brief_snapshot, brief_text, reference_photo_names, reference_photo_paths, created_at"
    )
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })
    .limit(24) : { data: [], error: null };

  const { data: incomingData, error: incomingError } = isDesigner ? await supabase
    .from("designer_inquiries")
    .select(
      "id, client_id, designer_id, brief_id, subject, message, status, brief_snapshot, brief_text, reference_photo_names, reference_photo_paths, created_at"
    )
    .eq("designer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(24) : { data: [], error: null };

  const sent = (sentData ?? []) as Inquiry[];
  const incoming = (incomingData ?? []) as Inquiry[];
  const inquiryPhotoEntries = await Promise.all(
    [...sent, ...incoming].map(
      async (inquiry): Promise<[string, ReferencePhotoPreview[]]> => [
        inquiry.id,
        await referencePhotoPreviews(
          supabase,
          inquiry.reference_photo_names,
          inquiry.reference_photo_paths
        ),
      ]
    )
  );
  const inquiryPhotos = new Map<string, ReferencePhotoPreview[]>(
    inquiryPhotoEntries
  );
  const profileIds = Array.from(
    new Set([
      ...sent.map((inquiry) => inquiry.designer_id),
      ...incoming.map((inquiry) => inquiry.client_id),
    ])
  );

  const { data: profilesData } = profileIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, profession_type, user_type, location, email")
        .in("id", profileIds)
    : { data: [] };

  const profiles = (profilesData ?? []) as Profile[];
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
  const copy = getAccountFlowCopy();

  return (
    <main className="bg-background">
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/account"
            className="inline-flex rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold text-muted hover:border-primary hover:text-primary"
          >
            {copy.inquiries.back}
          </Link>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <div className="text-sm font-semibold text-primary">{copy.inquiries.eyebrow}</div>
              <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">
                {copy.inquiries.title}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
                {copy.inquiries.intro(isDesigner)}
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-background p-5 shadow-sm">
              <div className="grid gap-3">
                <div className="rounded-xl border border-line bg-card p-4">
                  <div className="text-sm text-muted">{copy.inquiries.countLabel(isDesigner)}</div>
                  <div className="mt-1 text-2xl font-bold">{isDesigner ? incoming.length : sent.length}</div>
                </div>
              </div>
              {!isDesigner ? <Link
                href="/account/briefs"
                className="mt-4 flex rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white"
              >
                <span className="w-full">{copy.inquiries.sendSavedBrief}</span>
              </Link> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-7 px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-line bg-card p-5 text-sm leading-6 text-muted lg:col-span-2">
          <div className="font-semibold text-foreground">{copy.inquiries.statusGuide}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              ["sent", copy.inquiries.statusGuideBody.sent],
              ["reviewing", copy.inquiries.statusGuideBody.reviewing],
              ["accepted", copy.inquiries.statusGuideBody.accepted],
              ["declined", copy.inquiries.statusGuideBody.declined],
            ].map(([status, description]) => (
              <span
                key={status}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(status)}`}
                title={description}
              >
                {copy.inquiries.statuses[status]}
              </span>
            ))}
          </div>
        </div>

        {sp.updated ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900 lg:col-span-2">
            <div className="font-semibold">{copy.inquiries.updatedTitle}</div>
            <p className="mt-1">{copy.inquiries.updatedBody}</p>
          </div>
        ) : null}

        {sp.cancelled ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900 lg:col-span-2">
            <div className="font-semibold">{copy.inquiries.cancelledTitle}</div>
            <p className="mt-1">{copy.inquiries.cancelledBody}</p>
          </div>
        ) : null}

        {sp.error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-700 lg:col-span-2">
            <div className="font-semibold">{copy.inquiries.actionError}</div>
            <p className="mt-1">{sp.error}</p>
          </div>
        ) : null}

        {!isDesigner ? <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">{copy.inquiries.sentTitle}</h2>
            <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary">
              {sent.length}
            </span>
          </div>

          {sentError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              {sentError.message}
            </div>
          ) : sent.length ? (
            <div className="grid gap-5">
              {sent.map((inquiry) => (
                <InquiryCard
                  key={inquiry.id}
                  inquiry={inquiry}
                  mode="sent"
                  photos={inquiryPhotos.get(inquiry.id) ?? []}
                  profile={profilesById.get(inquiry.designer_id)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-line bg-card p-6 text-sm leading-6 text-muted">
              <div className="text-lg font-bold text-foreground">{copy.inquiries.sentEmptyTitle}</div>
              <p className="mt-2">
                {copy.inquiries.sentEmptyBody}
              </p>
              <Link
                href="/account/briefs"
                className="mt-5 inline-flex rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
              >
                {copy.inquiries.sendSavedBrief}
              </Link>
            </div>
          )}
        </div> : null}

        {isDesigner ? <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">{copy.inquiries.incomingTitle}</h2>
            <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary">
              {incoming.length}
            </span>
          </div>

          {incomingError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              {incomingError.message}
            </div>
          ) : incoming.length ? (
            <div className="grid gap-5">
              {incoming.map((inquiry) => (
                <InquiryCard
                  key={inquiry.id}
                  inquiry={inquiry}
                  mode="incoming"
                  photos={inquiryPhotos.get(inquiry.id) ?? []}
                  profile={profilesById.get(inquiry.client_id)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-line bg-card p-6 text-sm leading-6 text-muted">
              <div className="text-lg font-bold text-foreground">{copy.inquiries.incomingEmptyTitle}</div>
              <p className="mt-2">
                {copy.inquiries.incomingEmptyBody}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/designers/${user.id}`}
                  className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
                >
                  {copy.inquiries.viewPublicProfile}
                </Link>
                <Link
                  href="/account/profile"
                  className="rounded-xl border border-line bg-background px-4 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
                >
                  {copy.inquiries.editProfile}
                </Link>
              </div>
            </div>
          )}
        </div> : null}
      </section>
    </main>
  );
}
