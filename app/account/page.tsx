import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";
import {
  getAccountRole,
  getStudioMemberships,
  inquiryRecipientFilter,
} from "@/lib/studios";

export const revalidate = 0;

type Profile = {
  full_name: string | null;
  location: string | null;
  profession_type: string | null;
  user_type: string | null;
  specialties: string[] | null;
  bio: string | null;
};

type Project = {
  id: string;
};

type ProjectBrief = {
  id: string;
};

type DesignerInquiry = {
  id: string;
};

function profileName(profile: Partial<Profile>, email?: string) {
  return profile.full_name || email || "Your ArchiCompass account";
}

function profileScore(profile: Partial<Profile>) {
  const fields = [
    profile.full_name,
    profile.location,
    profile.profession_type,
    profile.bio,
    profile.specialties?.length ? "specialties" : null,
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams?: Promise<{ profileDeleted?: string; profileUpdated?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) redirect("/login");

  const myProfileId = user.id;

  const { data: profileData } = await supabase
    .from("profiles")
    .select("full_name, location, profession_type, user_type, specialties, bio")
    .eq("id", user.id)
    .maybeSingle();

  const { data: projectsData } = await supabase
    .from("projects")
    .select("id")
    .eq("profile_id", user.id);

  const { data: briefsData } = await supabase
    .from("project_briefs")
    .select("id")
    .eq("user_id", user.id);

  const { data: sentInquiriesData } = await supabase
    .from("designer_inquiries")
    .select("id")
    .eq("client_id", user.id);

  const accountRole = await getAccountRole(supabase, user.id);
  const { data: activeMemberships } = await getStudioMemberships(
    supabase,
    user.id,
    "active"
  );
  const studioIds = activeMemberships.map((membership) => membership.studio_id);

  const { data: incomingInquiriesData } = await supabase
    .from("designer_inquiries")
    .select("id")
    .or(inquiryRecipientFilter(user.id, studioIds));

  const profile = (profileData ?? {}) as Partial<Profile>;
  const projects = (projectsData ?? []) as Project[];
  const briefs = (briefsData ?? []) as ProjectBrief[];
  const sentInquiries = (sentInquiriesData ?? []) as DesignerInquiry[];
  const incomingInquiries = (incomingInquiriesData ?? []) as DesignerInquiry[];
  const score = profileScore(profile);
  const isProfessional = accountRole === "designer";
  const hasPublicProfile = isProfessional && Boolean(profileData);

  return (
    <main className="bg-background">
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div>
              <div className="text-sm font-semibold text-primary">Account Workspace</div>
              <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">
                {profileName(profile, user.email ?? undefined)}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
                {isProfessional
                  ? "Manage the profile, portfolio, studios, and requests that belong to your designer account."
                  : "Build project briefs, contact designers and studios, and keep client conversations in one place."}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary">
                  {profile.user_type || "Account"}
                </span>
                {profile.location ? (
                  <span className="rounded-full border border-line bg-background px-3 py-1 text-sm font-semibold text-muted">
                    {profile.location}
                  </span>
                ) : null}
                {profile.profession_type ? (
                  <span className="rounded-full border border-line bg-background px-3 py-1 text-sm font-semibold text-muted">
                    {profile.profession_type}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 lg:justify-end">
              {isProfessional ? (
                <Link
                  href="/studio"
                  className="rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-white"
                >
                  Designer Studio
                </Link>
              ) : null}
              {hasPublicProfile ? (
                <Link
                  href={`/designers/${myProfileId}`}
                  className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
                >
                  View public profile
                </Link>
              ) : null}
              <SignOutButton className="rounded-xl border border-line bg-background px-4 py-3 text-sm font-semibold hover:border-primary hover:text-primary disabled:opacity-60" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-7 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-7">
          {sp.profileDeleted ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900">
              <div className="font-semibold">Professional profile deleted</div>
              <p className="mt-1">
                The public profile and portfolio were removed. Your designer account,
                conversations, and studio memberships remain active.
              </p>
            </div>
          ) : null}
          {sp.profileUpdated ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
              Account profile updated.
            </div>
          ) : null}
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Link
              href="/account/profile"
              className="rounded-2xl border border-line bg-card p-6 shadow-sm transition hover:border-primary"
            >
              <div className="text-sm font-semibold text-primary">Profile Builder</div>
              <h2 className="mt-2 text-2xl font-bold">
                {isProfessional ? "Edit public profile" : "Edit account profile"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                {isProfessional
                  ? "Update your identity, specialties, pricing, contact details, and design approach."
                  : "Keep your client identity and contact details current for briefs and conversations."}
              </p>
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-primary-soft">
                <div className="h-full rounded-full bg-primary" style={{ width: `${score}%` }} />
              </div>
              <div className="mt-3 text-sm font-semibold text-muted">
                {score}% profile readiness
              </div>
            </Link>

            {isProfessional ? (
              <Link
                href="/account/projects"
                className="rounded-2xl border border-line bg-card p-6 shadow-sm transition hover:border-primary"
              >
                <div className="text-sm font-semibold text-primary">Portfolio Manager</div>
                <h2 className="mt-2 text-2xl font-bold">Manage projects</h2>
                <p className="mt-3 text-sm leading-6 text-muted">
                  Add project cards that turn your personal profile into a visual
                  portfolio and also appear in connected studios.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-line bg-background p-3">
                    <div className="text-sm text-muted">Projects</div>
                    <div className="mt-1 text-xl font-bold">{projects.length}</div>
                  </div>
                  <div className="rounded-xl border border-line bg-background p-3">
                    <div className="text-sm text-muted">Specialties</div>
                    <div className="mt-1 text-xl font-bold">
                      {profile.specialties?.length ?? 0}
                    </div>
                  </div>
                </div>
              </Link>
            ) : null}

            {isProfessional ? (
              <Link
                href="/studio/team"
                className="rounded-2xl border border-line bg-card p-6 shadow-sm transition hover:border-primary"
              >
                <div className="text-sm font-semibold text-primary">Studio Profile</div>
                <h2 className="mt-2 text-2xl font-bold">Studio and team</h2>
                <p className="mt-3 text-sm leading-6 text-muted">
                  Create a studio, invite designers, and share one team inbox and
                  aggregated portfolio.
                </p>
                <div className="mt-6 rounded-xl border border-line bg-background p-3">
                  <div className="text-sm text-muted">Active studios</div>
                  <div className="mt-1 text-xl font-bold">{studioIds.length}</div>
                </div>
              </Link>
            ) : null}

            <Link
              href="/account/briefs"
              className="rounded-2xl border border-line bg-card p-6 shadow-sm transition hover:border-primary"
            >
              <div className="text-sm font-semibold text-primary">Project Compass</div>
              <h2 className="mt-2 text-2xl font-bold">
                {isProfessional ? "Brief history" : "Saved briefs"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                {isProfessional
                  ? "Keep earlier client-side briefs as history. Designer accounts cannot send new requests."
                  : "Review briefs with references, budget, and scope before contacting a designer or studio."}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-line bg-background p-3">
                  <div className="text-sm text-muted">Briefs</div>
                  <div className="mt-1 text-xl font-bold">{briefs.length}</div>
                </div>
                <div className="rounded-xl border border-line bg-background p-3">
                  <div className="text-sm text-muted">Tool</div>
                  <div className="mt-1 text-xl font-bold">Live</div>
                </div>
              </div>
            </Link>

            <Link
              href={isProfessional ? "/studio/inbox" : "/account/inquiries"}
              className="rounded-2xl border border-line bg-card p-6 shadow-sm transition hover:border-primary"
            >
              <div className="text-sm font-semibold text-primary">Project Requests</div>
              <h2 className="mt-2 text-2xl font-bold">Brief requests</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                {isProfessional
                  ? "Review requests arriving to your personal profile and every studio you belong to."
                  : "Track briefs sent to designers and studios and continue each conversation."}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-line bg-background p-3">
                  <div className="text-sm text-muted">
                    {isProfessional ? "Incoming" : "Sent"}
                  </div>
                  <div className="mt-1 text-xl font-bold">
                    {isProfessional ? incomingInquiries.length : sentInquiries.length}
                  </div>
                </div>
                <div className="rounded-xl border border-line bg-background p-3">
                  <div className="text-sm text-muted">
                    {isProfessional ? "Studios" : "Role"}
                  </div>
                  <div className="mt-1 text-xl font-bold">
                    {isProfessional ? studioIds.length : "Client"}
                  </div>
                </div>
              </div>
            </Link>
          </section>

          <section className="rounded-2xl border border-line bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-primary">Next best actions</div>
                <h2 className="mt-1 text-3xl font-bold">
                  {isProfessional ? "Make the profile client-ready" : "Move the project forward"}
                </h2>
              </div>
              <Link
                href="/designers"
                className="rounded-xl border border-line bg-background px-4 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
              >
                Browse marketplace
              </Link>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-line bg-background p-5">
                <div className="font-bold">
                  {isProfessional ? "1. Complete basics" : "1. Build a clear brief"}
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {isProfessional
                    ? "Add location, profession, rate, and contact details so clients can understand fit quickly."
                    : "Capture project type, budget, timeline, style direction, and reference photos."}
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-background p-5">
                <div className="font-bold">
                  {isProfessional ? "2. Add one project" : "2. Compare professionals"}
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {isProfessional
                    ? "A single strong portfolio card already makes the public page much more credible."
                    : "Review both individual designers and studios before choosing where to send the brief."}
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-background p-5">
                <div className="font-bold">
                  {isProfessional ? "3. Review public view" : "3. Continue in messages"}
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {isProfessional
                    ? "Open the profile as a client and check whether the story feels clear."
                    : "Keep replies, decisions, and project context together in the client workspace."}
                </p>
              </div>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-line bg-card p-6 shadow-sm lg:sticky lg:top-24">
          <div className="text-sm font-semibold text-primary">Signed in</div>
          <h2 className="mt-2 text-2xl font-bold">Account details</h2>
          <div className="mt-5 grid gap-4 text-sm">
            <div>
              <div className="text-muted">Email</div>
              <div className="mt-1 break-words font-semibold">{user.email}</div>
            </div>
            <div>
              <div className="text-muted">User ID</div>
              <code className="mt-1 block break-all rounded-xl bg-background p-3 text-xs">
                {user.id}
              </code>
            </div>
          </div>

          {hasPublicProfile ? (
            <div className="mt-6 border-t border-line pt-6">
              <div className="font-bold">Public profile link</div>
              <Link
                href={`/designers/${myProfileId}`}
                className="mt-3 flex rounded-xl bg-primary-soft px-4 py-3 text-center text-sm font-semibold text-primary hover:bg-primary hover:text-white"
              >
                <span className="w-full">Open profile</span>
              </Link>
            </div>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
