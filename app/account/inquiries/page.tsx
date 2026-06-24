import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

function createdLabel(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function profileName(profile?: Profile) {
  return profile?.full_name || "Unnamed professional";
}

function profileMeta(profile?: Profile) {
  return [profile?.profession_type || profile?.user_type, profile?.location]
    .filter(Boolean)
    .join(" · ");
}

function snapshotText(snapshot: Record<string, unknown> | null, key: string) {
  const value = snapshot?.[key];
  return typeof value === "string" && value.trim() ? value : "Not specified";
}

function InquiryCard({
  inquiry,
  mode,
  profile,
}: {
  inquiry: Inquiry;
  mode: "sent" | "incoming";
  profile?: Profile;
}) {
  const snapshot = inquiry.brief_snapshot;

  return (
    <article className="rounded-2xl border border-line bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-primary">
            {mode === "sent" ? "Sent to" : "Request from"}
          </div>
          <h2 className="mt-1 text-2xl font-bold">{profileName(profile)}</h2>
          {profileMeta(profile) ? (
            <div className="mt-1 text-sm text-muted">{profileMeta(profile)}</div>
          ) : null}
        </div>
        <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary">
          {inquiry.status}
        </span>
      </div>

      <div className="mt-5 text-sm text-muted">Sent {createdLabel(inquiry.created_at)}</div>
      <h3 className="mt-2 text-xl font-bold">{inquiry.subject}</h3>

      {inquiry.message ? (
        <div className="mt-4 rounded-2xl border border-line bg-background p-4 text-sm leading-6">
          {inquiry.message}
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        {[
          ["Project", snapshotText(snapshot, "project_type")],
          ["Style", snapshotText(snapshot, "style_direction")],
          ["Support", snapshotText(snapshot, "support_scope")],
          ["Budget", snapshotText(snapshot, "budget_signal")],
          ["Location", snapshotText(snapshot, "location")],
          ["Goal", snapshotText(snapshot, "goal")],
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

      <div className="mt-5 flex flex-wrap gap-3">
        {mode === "sent" ? (
          <Link
            href={`/designers/${inquiry.designer_id}`}
            className="rounded-xl border border-line bg-background px-4 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
          >
            Open designer profile
          </Link>
        ) : profile?.email ? (
          <a
            href={`mailto:${profile.email}?subject=${encodeURIComponent(`Re: ${inquiry.subject}`)}`}
            className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
          >
            Reply by email
          </a>
        ) : null}
      </div>
    </article>
  );
}

export default async function InquiriesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) redirect("/login");

  const { data: sentData, error: sentError } = await supabase
    .from("designer_inquiries")
    .select(
      "id, client_id, designer_id, brief_id, subject, message, status, brief_snapshot, brief_text, created_at"
    )
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })
    .limit(24);

  const { data: incomingData, error: incomingError } = await supabase
    .from("designer_inquiries")
    .select(
      "id, client_id, designer_id, brief_id, subject, message, status, brief_snapshot, brief_text, created_at"
    )
    .eq("designer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(24);

  const sent = (sentData ?? []) as Inquiry[];
  const incoming = (incomingData ?? []) as Inquiry[];
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
              <div className="text-sm font-semibold text-primary">Project Requests</div>
              <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">
                Brief requests
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
                Track saved briefs you sent to designers and incoming requests sent to
                your own profile.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-background p-5 shadow-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-line bg-card p-4">
                  <div className="text-sm text-muted">Sent</div>
                  <div className="mt-1 text-2xl font-bold">{sent.length}</div>
                </div>
                <div className="rounded-xl border border-line bg-card p-4">
                  <div className="text-sm text-muted">Incoming</div>
                  <div className="mt-1 text-2xl font-bold">{incoming.length}</div>
                </div>
              </div>
              <Link
                href="/account/briefs"
                className="mt-4 flex rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white"
              >
                <span className="w-full">Send a saved brief</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-7 px-4 py-10 sm:px-6 lg:grid-cols-2">
        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">Sent requests</h2>
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
                  profile={profilesById.get(inquiry.designer_id)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-line bg-card p-6 text-sm leading-6 text-muted">
              No sent requests yet. Send a saved Project Compass brief when you are ready
              to contact a designer.
            </div>
          )}
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">Incoming requests</h2>
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
                  profile={profilesById.get(inquiry.client_id)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-line bg-card p-6 text-sm leading-6 text-muted">
              No incoming requests yet. When someone sends a saved brief to your profile,
              it will appear here.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
