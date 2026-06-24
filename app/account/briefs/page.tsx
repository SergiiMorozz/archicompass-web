import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendInquiryNotificationEmail } from "@/lib/email/inquiry-notification";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
  location: string | null;
  notes: string | null;
  visual_cues: string[] | null;
  reference_photo_names: string[] | null;
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
  created_at: string;
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
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function designerLabel(designer: Designer) {
  const name = designer.full_name || "Unnamed professional";
  const detail = [designer.profession_type || designer.user_type, designer.location]
    .filter(Boolean)
    .join(" · ");
  return detail ? `${name} — ${detail}` : name;
}

function errorRedirect(message: string) {
  redirect(`/account/briefs?error=${encodeURIComponent(message)}`);
}

async function sendBriefInquiry(formData: FormData) {
  "use server";

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) redirect("/login");

  const briefId = textValue(formData, "brief_id");
  const designerId = textValue(formData, "designer_id");
  const message = textValue(formData, "message");

  if (!briefId) errorRedirect("Choose a saved brief first.");
  if (!designerId) errorRedirect("Choose a designer before sending the brief.");
  if (designerId === user.id) errorRedirect("Choose another designer, not your own profile.");

  const { data: briefData, error: briefError } = await supabase
    .from("project_briefs")
    .select(
      "id, user_id, title, project_type, goal, style_direction, support_scope, budget_signal, location, notes, visual_cues, reference_photo_names, brief_text, designer_search_href, created_at"
    )
    .eq("id", briefId)
    .eq("user_id", user.id)
    .single();

  if (briefError || !briefData) {
    errorRedirect("This saved brief could not be found.");
  }

  const brief = briefData as ProjectBrief;

  const { data: designerData, error: designerError } = await supabase
    .from("profiles")
    .select("id, email, full_name, profession_type, user_type, location")
    .eq("id", designerId)
    .maybeSingle();

  if (designerError || !designerData) {
    errorRedirect("This designer profile could not be found.");
  }

  const designer = designerData as Designer;
  const subject = `Project request: ${brief.title || brief.project_type || "Project brief"}`;
  const notification = await sendInquiryNotificationEmail({
    brief,
    clientEmail: user.email ?? null,
    designer,
    message,
  });

  const { error } = await supabase.from("designer_inquiries").insert({
    id: crypto.randomUUID(),
    client_id: user.id,
    designer_id: designerId,
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
      location: brief.location,
      notes: brief.notes,
      visual_cues: brief.visual_cues ?? [],
      reference_photo_count: brief.reference_photo_names?.length ?? 0,
    },
    brief_text: brief.brief_text,
    notification_email_error: notification.error,
    notification_email_sent_at: notification.sentAt,
    notification_email_status: notification.status,
  });

  if (error) errorRedirect(error.message);

  revalidatePath("/account");
  revalidatePath("/account/briefs");
  revalidatePath("/account/inquiries");
  redirect("/account/briefs?sent=1");
}

export default async function SavedBriefsPage({
  searchParams,
}: {
  searchParams?: Promise<{ designer?: string; error?: string; sent?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) redirect("/login");

  const { data: briefsData, error } = await supabase
    .from("project_briefs")
    .select(
      "id, user_id, title, project_type, goal, style_direction, support_scope, budget_signal, location, notes, visual_cues, reference_photo_names, brief_text, designer_search_href, created_at"
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

  const { data: inquiriesData } = await supabase
    .from("designer_inquiries")
    .select("id, brief_id, designer_id, created_at")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const briefs = (briefsData ?? []) as ProjectBrief[];
  const designers = (designersData ?? []) as Designer[];
  const inquiries = (inquiriesData ?? []) as DesignerInquiry[];
  const preselectedDesigner = designers.some((designer) => designer.id === sp.designer)
    ? sp.designer
    : "";
  const designersById = new Map(designers.map((designer) => [designer.id, designer]));

  return (
    <main className="bg-background">
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/account"
            className="inline-flex rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold text-muted hover:border-primary hover:text-primary"
          >
            Back to account
          </Link>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <div className="text-sm font-semibold text-primary">Project Compass</div>
              <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">
                Saved briefs
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
                Review briefs created with Project Compass, then send one to a designer
                as a clear first request.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-background p-5 shadow-sm">
              <div className="text-sm font-semibold text-muted">Saved briefs</div>
              <div className="mt-2 text-3xl font-bold text-primary">{briefs.length}</div>
              <Link
                href="/project-compass"
                className="mt-4 flex rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white"
              >
                <span className="w-full">Create new brief</span>
              </Link>
              <Link
                href="/account/inquiries"
                className="mt-3 flex rounded-xl border border-line bg-card px-4 py-3 text-center text-sm font-semibold hover:border-primary hover:text-primary"
              >
                <span className="w-full">View requests</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {sp.sent ? (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900">
            <div className="font-semibold">Brief sent</div>
            <p className="mt-1">
              The request is saved in ArchiCompass. You can review it in requests.
            </p>
          </div>
        ) : null}

        {sp.error ? (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-700">
            <div className="font-semibold">Brief was not sent</div>
            <p className="mt-1">{sp.error}</p>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error.message}
          </div>
        ) : !briefs.length ? (
          <div className="rounded-2xl border border-dashed border-line bg-card p-8 text-center shadow-sm">
            <h2 className="text-2xl font-bold">No saved briefs yet</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">
              Build a Project Compass brief with your style direction, visual cues, and
              reference photos, then save it here.
            </p>
            <Link
              href="/project-compass"
              className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white"
            >
              Build project brief
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {briefs.map((brief) => {
              const sentInquiries = inquiries.filter((inquiry) => inquiry.brief_id === brief.id);

              return (
                <article
                  key={brief.id}
                  className="rounded-2xl border border-line bg-card p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-primary">
                        {brief.project_type || "Project brief"}
                      </div>
                      <h2 className="mt-1 text-2xl font-bold">
                        {brief.title || "Untitled brief"}
                      </h2>
                      <div className="mt-2 text-sm text-muted">
                        Saved {createdLabel(brief.created_at)}
                      </div>
                    </div>
                    <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary">
                      {brief.reference_photo_names?.length ?? 0} photo
                      {(brief.reference_photo_names?.length ?? 0) === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                    {[
                      ["Goal", brief.goal],
                      ["Style", brief.style_direction],
                      ["Support", brief.support_scope],
                      ["Budget", brief.budget_signal],
                      ["Location", brief.location],
                      ["Visual cues", brief.visual_cues?.join(", ") || "Not tagged"],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-line bg-background p-3">
                        <div className="text-muted">{label}</div>
                        <div className="mt-1 font-semibold">{value || "Not specified"}</div>
                      </div>
                    ))}
                  </div>

                  <pre className="mt-5 max-h-64 overflow-auto whitespace-pre-wrap rounded-2xl bg-[#1f172a] p-4 text-xs leading-6 text-white/78">
                    {brief.brief_text}
                  </pre>

                  <div className="mt-5 rounded-2xl border border-line bg-background p-4">
                    <div className="text-sm font-semibold">Send this brief</div>
                    <p className="mt-1 text-sm leading-6 text-muted">
                      Choose a designer and add a short note. The full brief will be saved
                      with the request.
                    </p>

                    {designers.length ? (
                      <form action={sendBriefInquiry} className="mt-4 grid gap-4">
                        <input type="hidden" name="brief_id" value={brief.id} />
                        <label className="block text-sm font-semibold">
                          Designer
                          <select
                            name="designer_id"
                            defaultValue={preselectedDesigner}
                            className={fieldClass}
                            required
                          >
                            <option value="">Choose designer</option>
                            {designers.map((designer) => (
                              <option key={designer.id} value={designer.id}>
                                {designerLabel(designer)}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="block text-sm font-semibold">
                          Message
                          <textarea
                            name="message"
                            rows={4}
                            className={areaClass}
                            placeholder="Hi, I prepared a Project Compass brief and would like to check if this project is a good fit."
                          />
                        </label>

                        <button
                          type="submit"
                          className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
                        >
                          Send brief to designer
                        </button>
                      </form>
                    ) : (
                      <div className="mt-4 rounded-xl border border-dashed border-line p-4 text-sm leading-6 text-muted">
                        No other designer profiles are available yet.
                      </div>
                    )}

                    {sentInquiries.length ? (
                      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
                        <div className="font-semibold">Already sent</div>
                        <div className="mt-1">
                          {sentInquiries
                            .slice(0, 3)
                            .map((inquiry) => {
                              const designer = designersById.get(inquiry.designer_id);
                              return designer ? designer.full_name || "Unnamed professional" : "Designer";
                            })
                            .join(", ")}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {brief.designer_search_href ? (
                      <Link
                        href={brief.designer_search_href}
                        className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
                      >
                        Find matching designers
                      </Link>
                    ) : null}
                    <Link
                      href="/project-compass"
                      className="rounded-xl border border-line bg-background px-4 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
                    >
                      Create another brief
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
