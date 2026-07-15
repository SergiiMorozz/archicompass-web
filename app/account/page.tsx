import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";
import {
  getAccountRole,
  getStudioMemberships,
  inquiryRecipientFilter,
} from "@/lib/studios";
import { profileReadinessScore } from "@/lib/profile-readiness";
import { getWorkspaceCopy } from "@/content/workspace-copy";

export const revalidate = 0;

type Profile = {
  full_name: string | null;
  profile_headline: string | null;
  location: string | null;
  profession_type: string | null;
  user_type: string | null;
  specialties: string[] | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  service_capabilities: string[] | null;
  pricing_model: string | null;
  price_from: number | null;
  price_to: number | null;
  work_modes: string[] | null;
  availability_status: string | null;
  years_experience: number | null;
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

function profileName(profile: Partial<Profile>, email: string | undefined, fallback: string) {
  const name = profile.full_name?.trim();
  if (!name || name.toLowerCase() === email?.toLowerCase()) return fallback;
  return name;
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
    .select("full_name, profile_headline, location, profession_type, user_type, specialties, bio, email, phone, service_capabilities, pricing_model, price_from, price_to, work_modes, availability_status, years_experience")
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
  const isProfessional = accountRole === "designer";
  const copy = getWorkspaceCopy().account;
  const score = profileReadinessScore(profile, isProfessional);
  const hasPublicProfile = isProfessional && Boolean(profileData);
  const compassHref = isProfessional ? "/project-compass" : "/client/briefs";
  const compassTitle = isProfessional ? copy.compass.professionalTitle : copy.compass.clientTitle;
  const compassDescription = isProfessional
    ? copy.compass.professionalBody
    : copy.compass.clientBody;
  const nextActionHref = isProfessional ? "/studio" : "/designers";
  const nextActionLabel = isProfessional
    ? copy.professionalNextCta
    : copy.clientNextCta;
  const steps = isProfessional ? copy.stepsProfessional : copy.stepsClient;

  return (
    <main className="bg-background">
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div>
              <div className="text-sm font-semibold text-primary">{copy.settingsEyebrow}</div>
              <h1 className="mt-2 break-words text-4xl font-bold tracking-tight sm:text-6xl">
                {profileName(profile, user.email ?? undefined, copy.defaultName)}
              </h1>
              <div className="mt-3 break-all text-sm font-semibold text-muted">
                {user.email}
              </div>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
                {isProfessional
                  ? copy.professionalIntro
                  : copy.clientIntro}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary">
                  {isProfessional ? copy.designer : copy.client}
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
                  {copy.openStudio}
                </Link>
              ) : null}
              {hasPublicProfile ? (
                <Link
                  href={`/designers/${myProfileId}`}
                  className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
                >
                  {copy.publicProfile}
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
              <div className="font-semibold">{copy.deletedTitle}</div>
              <p className="mt-1">
                {copy.deletedBody}
              </p>
            </div>
          ) : null}
          {sp.profileUpdated ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
              {copy.updated}
            </div>
          ) : null}
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Link
              href="/account/profile"
              className="rounded-2xl border border-line bg-card p-6 shadow-sm transition hover:border-primary"
            >
              <div className="text-sm font-semibold text-primary">{copy.profileEyebrow}</div>
              <h2 className="mt-2 text-2xl font-bold">
                {isProfessional ? copy.professionalProfile : copy.contactDetails}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                {isProfessional
                  ? copy.professionalProfileBody
                  : copy.contactDetailsBody}
              </p>
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-primary-soft">
                <div className="h-full rounded-full bg-primary" style={{ width: `${score}%` }} />
              </div>
              <div className="mt-3 text-sm font-semibold text-muted">
                {copy.profileReadiness(score)}
              </div>
            </Link>

            {isProfessional ? (
              <Link
                href="/account/projects"
                className="rounded-2xl border border-line bg-card p-6 shadow-sm transition hover:border-primary"
              >
                <div className="text-sm font-semibold text-primary">{copy.portfolioEyebrow}</div>
                <h2 className="mt-2 text-2xl font-bold">{copy.manageProjects}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {copy.manageProjectsBody}
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-line bg-background p-3">
                    <div className="text-sm text-muted">{copy.projects}</div>
                    <div className="mt-1 text-xl font-bold">{projects.length}</div>
                  </div>
                  <div className="rounded-xl border border-line bg-background p-3">
                    <div className="text-sm text-muted">{copy.specialties}</div>
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
                <div className="text-sm font-semibold text-primary">{copy.studioEyebrow}</div>
                <h2 className="mt-2 text-2xl font-bold">{copy.studioAndTeam}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {copy.studioAndTeamBody}
                </p>
                <div className="mt-6 rounded-xl border border-line bg-background p-3">
                  <div className="text-sm text-muted">{copy.activeStudios}</div>
                  <div className="mt-1 text-xl font-bold">{studioIds.length}</div>
                </div>
              </Link>
            ) : null}

            <Link
              href={compassHref}
              className="rounded-2xl border border-line bg-card p-6 shadow-sm transition hover:border-primary"
            >
              <div className="text-sm font-semibold text-primary">
                AI Project Compass
              </div>
              <h2 className="mt-2 text-2xl font-bold">{compassTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                {compassDescription}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-line bg-background p-3">
                  <div className="text-sm text-muted">
                    {isProfessional ? copy.aiHistory : copy.savedBriefs}
                  </div>
                  <div className="mt-1 text-xl font-bold">{briefs.length}</div>
                </div>
                <div className="rounded-xl border border-line bg-background p-3">
                  <div className="text-sm text-muted">{copy.tool}</div>
                  <div className="mt-1 text-xl font-bold">
                    {isProfessional ? copy.aiAnalysis : copy.active}
                  </div>
                </div>
              </div>
            </Link>

            <Link
              href={isProfessional ? "/studio/inbox" : "/account/inquiries"}
              className="rounded-2xl border border-line bg-card p-6 shadow-sm transition hover:border-primary"
            >
              <div className="text-sm font-semibold text-primary">{copy.enquiriesEyebrow}</div>
              <h2 className="mt-2 text-2xl font-bold">{copy.enquiries}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                {isProfessional
                  ? copy.professionalEnquiriesBody
                  : copy.clientEnquiriesBody}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-line bg-background p-3">
                  <div className="text-sm text-muted">
                    {isProfessional ? copy.received : copy.sent}
                  </div>
                  <div className="mt-1 text-xl font-bold">
                    {isProfessional ? incomingInquiries.length : sentInquiries.length}
                  </div>
                </div>
                <div className="rounded-xl border border-line bg-background p-3">
                  <div className="text-sm text-muted">
                    {isProfessional ? copy.activeStudios : copy.role}
                  </div>
                  <div className="mt-1 text-xl font-bold">
                    {isProfessional ? studioIds.length : copy.client}
                  </div>
                </div>
              </div>
            </Link>
          </section>

          <section className="rounded-2xl border border-line bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-primary">{copy.nextEyebrow}</div>
                <h2 className="mt-1 text-3xl font-bold">
                  {isProfessional ? copy.professionalNextTitle : copy.clientNextTitle}
                </h2>
              </div>
              <Link
                href={nextActionHref}
                className="rounded-xl border border-line bg-background px-4 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
              >
                {nextActionLabel}
              </Link>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-line bg-background p-5">
                <div className="font-bold">
                  {steps[0]}
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {steps[1]}
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-background p-5">
                <div className="font-bold">
                  {steps[2]}
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {steps[3]}
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-background p-5">
                <div className="font-bold">
                  {steps[4]}
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {steps[5]}
                </p>
              </div>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-line bg-card p-6 shadow-sm lg:sticky lg:top-24">
          <div className="text-sm font-semibold text-primary">{copy.accessEyebrow}</div>
          <h2 className="mt-2 text-2xl font-bold">{copy.accessTitle}</h2>
          <div className="mt-5 grid gap-4 text-sm">
            <div>
              <div className="text-muted">{copy.email}</div>
              <div className="mt-1 break-words font-semibold">{user.email}</div>
            </div>
            <div>
              <div className="text-muted">{copy.accountType}</div>
              <div className="mt-1 font-semibold">{isProfessional ? copy.designer : copy.client}</div>
            </div>
          </div>

          <Link
            href={isProfessional ? "/studio" : "/client"}
            className="mt-6 flex rounded-xl border border-line bg-background px-4 py-3 text-center text-sm font-semibold hover:border-primary hover:text-primary"
          >
            <span className="w-full">{isProfessional ? copy.professionalNextCta : copy.openClientZone}</span>
          </Link>

          {hasPublicProfile ? (
            <div className="mt-6 border-t border-line pt-6">
              <div className="font-bold">{copy.publicProfileLink}</div>
              <Link
                href={`/designers/${myProfileId}`}
                className="mt-3 flex rounded-xl bg-primary-soft px-4 py-3 text-center text-sm font-semibold text-primary hover:bg-primary hover:text-white"
              >
                <span className="w-full">{copy.openProfile}</span>
              </Link>
            </div>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
