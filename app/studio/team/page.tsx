import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAccountRole, getStudioMemberships } from "@/lib/studios";

export const revalidate = 0;

type Studio = {
  id: string;
  owner_id: string;
  name: string;
  bio: string | null;
  location: string | null;
  specialties: string[] | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  hourly_rate: number | null;
  years_experience: number | null;
  published: boolean;
  created_at: string;
};

type Member = {
  studio_id: string;
  user_id: string;
  role: "owner" | "admin" | "designer";
  status: "pending" | "active";
  created_at: string;
};

type MemberProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  profession_type: string | null;
};

const fieldClass =
  "mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal text-foreground outline-none transition focus:border-primary";

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numberValue(formData: FormData, key: string) {
  const value = textValue(formData, key);
  if (!value) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function listValue(formData: FormData, key: string) {
  return (textValue(formData, key) ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function actionRedirect(message: string): never {
  redirect(`/studio/team?error=${encodeURIComponent(message)}`);
}

function studioPayload(formData: FormData) {
  const name = textValue(formData, "name");
  if (!name || name.length < 2) actionRedirect("Studio name must contain at least two characters.");

  return {
    name,
    bio: textValue(formData, "bio"),
    location: textValue(formData, "location"),
    specialties: listValue(formData, "specialties"),
    website: textValue(formData, "website"),
    phone: textValue(formData, "phone"),
    email: textValue(formData, "email"),
    hourly_rate: numberValue(formData, "hourly_rate"),
    years_experience: numberValue(formData, "years_experience"),
    published: formData.get("published") === "on",
    updated_at: new Date().toISOString(),
  };
}

async function createStudio(formData: FormData) {
  "use server";

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");
  if ((await getAccountRole(supabase, user.id)) !== "designer") {
    actionRedirect("Only a designer account can create a studio.");
  }

  const { data, error } = await supabase
    .from("studios")
    .insert({ ...studioPayload(formData), owner_id: user.id })
    .select("id")
    .single();
  if (error || !data) actionRedirect(error?.message ?? "Studio could not be created.");

  revalidatePath("/studio");
  revalidatePath("/studio/team");
  revalidatePath("/designers");
  redirect(`/studio/team?created=1&studio=${data.id}`);
}

async function updateStudio(formData: FormData) {
  "use server";

  const studioId = textValue(formData, "studio_id");
  if (!studioId) actionRedirect("Studio was not found.");

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { data, error } = await supabase
    .from("studios")
    .update(studioPayload(formData))
    .eq("id", studioId)
    .select("id")
    .maybeSingle();
  if (error || !data) actionRedirect(error?.message ?? "Only a studio manager can update this profile.");

  revalidatePath("/studio/team");
  revalidatePath(`/studios/${studioId}`);
  revalidatePath("/designers");
  redirect(`/studio/team?updated=1&studio=${studioId}`);
}

async function inviteMember(formData: FormData) {
  "use server";

  const studioId = textValue(formData, "studio_id");
  const email = textValue(formData, "email");
  const role = textValue(formData, "role") ?? "designer";
  if (!studioId || !email) actionRedirect("Enter the designer's ArchiCompass email.");

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { error } = await supabase.rpc("invite_studio_member", {
    target_studio_id: studioId,
    member_email: email,
    member_role: role,
  });
  if (error) actionRedirect(error.message);

  revalidatePath("/studio/team");
  redirect(`/studio/team?invited=1&studio=${studioId}`);
}

async function respondInvitation(formData: FormData) {
  "use server";

  const studioId = textValue(formData, "studio_id");
  const response = textValue(formData, "response");
  if (!studioId || !response) actionRedirect("Studio invitation was not found.");

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { error } = await supabase.rpc("respond_studio_invitation", {
    target_studio_id: studioId,
    accept_invitation: response === "accept",
  });
  if (error) actionRedirect(error.message);

  revalidatePath("/studio");
  revalidatePath("/studio/team");
  revalidatePath("/studio/inbox");
  redirect(`/studio/team?invitation=${response === "accept" ? "accepted" : "declined"}`);
}

async function removeMember(formData: FormData) {
  "use server";

  const studioId = textValue(formData, "studio_id");
  const userId = textValue(formData, "user_id");
  if (!studioId || !userId) actionRedirect("Studio member was not found.");

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { error } = await supabase.rpc("remove_studio_member", {
    target_studio_id: studioId,
    target_user_id: userId,
  });
  if (error) actionRedirect(error.message);

  revalidatePath("/studio");
  revalidatePath("/studio/team");
  revalidatePath("/studio/inbox");
  revalidatePath(`/studios/${studioId}`);
  redirect(`/studio/team?removed=1&studio=${studioId}`);
}

function memberName(member: Member, profiles: Map<string, MemberProfile>) {
  const profile = profiles.get(member.user_id);
  return profile?.full_name || profile?.email || "Designer account";
}

export default async function StudioTeamPage({
  searchParams,
}: {
  searchParams?: Promise<{
    created?: string;
    error?: string;
    invitation?: string;
    invited?: string;
    removed?: string;
    studio?: string;
    updated?: string;
  }>;
}) {
  const sp = (await searchParams) ?? {};
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { data: myMemberships } = await getStudioMemberships(supabase, user.id);
  const studioIds = Array.from(new Set(myMemberships.map((membership) => membership.studio_id)));
  const { data: studioData } = studioIds.length
    ? await supabase
        .from("studios")
        .select("id, owner_id, name, bio, location, specialties, website, phone, email, hourly_rate, years_experience, published, created_at")
        .in("id", studioIds)
        .order("created_at", { ascending: true })
    : { data: [] };
  const studios = (studioData ?? []) as Studio[];
  const studiosById = new Map(studios.map((studio) => [studio.id, studio]));

  const { data: allMemberData } = studioIds.length
    ? await supabase
        .from("studio_members")
        .select("studio_id, user_id, role, status, created_at")
        .in("studio_id", studioIds)
        .order("created_at", { ascending: true })
    : { data: [] };
  const members = (allMemberData ?? []) as Member[];
  const memberIds = Array.from(new Set(members.map((member) => member.user_id)));
  const { data: profileData } = memberIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, email, profession_type")
        .in("id", memberIds)
    : { data: [] };
  const profiles = new Map(
    ((profileData ?? []) as MemberProfile[]).map((profile) => [profile.id, profile])
  );

  const pending = myMemberships.filter((membership) => membership.status === "pending");
  const active = myMemberships.filter((membership) => membership.status === "active");
  const activeStudios = active
    .map((membership) => studiosById.get(membership.studio_id))
    .filter((studio): studio is Studio => Boolean(studio));

  return (
    <main>
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-sm font-semibold text-primary">Collaborative profile</div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">Studio and team</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
            A studio has its own public profile and shared inbox. Active designers keep
            their personal profiles, while their portfolio projects are also collected on
            the studio page automatically.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-7 px-4 py-10 sm:px-6">
        {sp.error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {sp.error}
          </div>
        ) : null}
        {sp.created || sp.updated || sp.invited || sp.removed || sp.invitation ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
            {sp.created
              ? "Studio created. You can now invite designers."
              : sp.updated
                ? "Studio profile updated."
                : sp.invited
                  ? "Invitation sent inside ArchiCompass."
                  : sp.removed
                    ? "Team member removed."
                    : `Invitation ${sp.invitation}.`}
          </div>
        ) : null}

        {pending.length ? (
          <section className="rounded-lg border border-[#e5d2ff] bg-primary-soft p-6">
            <div className="text-sm font-semibold text-primary">Pending invitations</div>
            <h2 className="mt-1 text-2xl font-bold">A studio invited you</h2>
            <div className="mt-5 grid gap-3">
              {pending.map((membership) => {
                const studio = studiosById.get(membership.studio_id);
                return (
                  <div key={membership.studio_id} className="flex flex-col gap-4 rounded-lg border border-line bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-bold">{studio?.name || "Design studio"}</div>
                      <div className="mt-1 text-sm text-muted">Role: {membership.role}</div>
                    </div>
                    <form action={respondInvitation} className="flex gap-2">
                      <input type="hidden" name="studio_id" value={membership.studio_id} />
                      <button name="response" value="decline" className="rounded-xl border border-line bg-background px-4 py-2.5 text-sm font-semibold">
                        Decline
                      </button>
                      <button name="response" value="accept" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white">
                        Accept
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {activeStudios.map((studio) => {
          const myMembership = active.find((membership) => membership.studio_id === studio.id);
          const canManage = myMembership?.role === "owner" || myMembership?.role === "admin";
          const studioMembers = members.filter((member) => member.studio_id === studio.id);

          return (
            <section key={studio.id} className="rounded-lg border border-line bg-card p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-sm font-semibold text-primary">{myMembership?.role} access</div>
                  <h2 className="mt-1 text-3xl font-bold">{studio.name}</h2>
                  <p className="mt-2 text-sm text-muted">
                    {studio.published ? "Public studio profile" : "Private draft"} · {studioMembers.filter((member) => member.status === "active").length} active members
                  </p>
                </div>
                <Link href={`/studios/${studio.id}`} className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white">
                  Open public studio
                </Link>
              </div>

              <div className="mt-7 grid gap-7 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div>
                  <div className="text-sm font-semibold text-primary">Team</div>
                  <div className="mt-3 grid gap-3">
                    {studioMembers.map((member) => (
                      <div key={member.user_id} className="flex flex-col gap-3 rounded-lg border border-line bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="font-bold">{memberName(member, profiles)}</div>
                          <div className="mt-1 text-sm text-muted">
                            {profiles.get(member.user_id)?.profession_type || "Designer"} · {member.role} · {member.status}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {profiles.has(member.user_id) ? (
                            <Link href={`/designers/${member.user_id}`} className="rounded-xl border border-line bg-card px-3 py-2 text-sm font-semibold">
                              Profile
                            </Link>
                          ) : null}
                          {canManage && member.role !== "owner" ? (
                            <form action={removeMember}>
                              <input type="hidden" name="studio_id" value={studio.id} />
                              <input type="hidden" name="user_id" value={member.user_id} />
                              <button className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                                Remove
                              </button>
                            </form>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>

                  {canManage ? (
                    <form action={inviteMember} className="mt-6 rounded-lg border border-line bg-background p-5">
                      <div className="font-bold">Invite an existing designer</div>
                      <p className="mt-1 text-sm leading-6 text-muted">
                        The person must already have an ArchiCompass designer account.
                        They choose whether to accept the invitation.
                      </p>
                      <input type="hidden" name="studio_id" value={studio.id} />
                      <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px_auto] sm:items-end">
                        <label className="text-sm font-semibold">
                          Account email
                          <input name="email" type="email" required className={fieldClass} />
                        </label>
                        <label className="text-sm font-semibold">
                          Team role
                          <select name="role" defaultValue="designer" className={fieldClass}>
                            <option value="designer">Designer</option>
                            <option value="admin">Studio admin</option>
                          </select>
                        </label>
                        <button className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">
                          Invite
                        </button>
                      </div>
                    </form>
                  ) : null}
                </div>

                {canManage ? (
                  <details open={sp.studio === studio.id} className="h-fit rounded-lg border border-line bg-background p-5">
                    <summary className="cursor-pointer font-bold">Edit studio profile</summary>
                    <form action={updateStudio} className="mt-5 grid gap-4">
                      <input type="hidden" name="studio_id" value={studio.id} />
                      <label className="text-sm font-semibold">Studio name<input name="name" required defaultValue={studio.name} className={fieldClass} /></label>
                      <label className="text-sm font-semibold">Location<input name="location" defaultValue={studio.location ?? ""} className={fieldClass} /></label>
                      <label className="text-sm font-semibold">Specialties<input name="specialties" defaultValue={studio.specialties?.join(", ") ?? ""} className={fieldClass} /></label>
                      <label className="text-sm font-semibold">Bio<textarea name="bio" rows={5} defaultValue={studio.bio ?? ""} className={fieldClass} /></label>
                      <label className="text-sm font-semibold">Website<input name="website" defaultValue={studio.website ?? ""} className={fieldClass} /></label>
                      <label className="text-sm font-semibold">Public email<input name="email" type="email" defaultValue={studio.email ?? ""} className={fieldClass} /></label>
                      <label className="text-sm font-semibold">Phone<input name="phone" defaultValue={studio.phone ?? ""} className={fieldClass} /></label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="text-sm font-semibold">Rate, PLN<input name="hourly_rate" inputMode="numeric" defaultValue={studio.hourly_rate ?? ""} className={fieldClass} /></label>
                        <label className="text-sm font-semibold">Experience<input name="years_experience" inputMode="numeric" defaultValue={studio.years_experience ?? ""} className={fieldClass} /></label>
                      </div>
                      <label className="flex items-center gap-3 text-sm font-semibold">
                        <input name="published" type="checkbox" defaultChecked={studio.published} className="h-5 w-5 accent-primary" />
                        Publish studio profile
                      </label>
                      <button className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">Save studio</button>
                    </form>
                  </details>
                ) : (
                  <aside className="h-fit rounded-lg border border-line bg-background p-5 text-sm leading-6 text-muted">
                    Studio managers edit the shared profile and invite people. Every
                    active member can open studio inquiries and reply from the team inbox.
                  </aside>
                )}
              </div>
            </section>
          );
        })}

        <details className="rounded-lg border border-line bg-card p-6 shadow-sm" open={!activeStudios.length}>
          <summary className="cursor-pointer text-2xl font-bold">Create a design studio</summary>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Start with the studio identity. After creation, invite designers by their
            ArchiCompass account email.
          </p>
          <form action={createStudio} className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">Studio name<input name="name" required className={fieldClass} /></label>
            <label className="text-sm font-semibold">Location<input name="location" className={fieldClass} /></label>
            <label className="text-sm font-semibold md:col-span-2">Specialties<input name="specialties" placeholder="residential, hospitality, renovations" className={fieldClass} /></label>
            <label className="text-sm font-semibold md:col-span-2">Bio<textarea name="bio" rows={5} className={fieldClass} /></label>
            <label className="text-sm font-semibold">Website<input name="website" placeholder="https://" className={fieldClass} /></label>
            <label className="text-sm font-semibold">Public email<input name="email" type="email" defaultValue={user.email ?? ""} className={fieldClass} /></label>
            <label className="text-sm font-semibold">Phone<input name="phone" className={fieldClass} /></label>
            <label className="text-sm font-semibold">Hourly rate, PLN<input name="hourly_rate" inputMode="numeric" className={fieldClass} /></label>
            <label className="text-sm font-semibold">Years of experience<input name="years_experience" inputMode="numeric" className={fieldClass} /></label>
            <label className="flex items-center gap-3 text-sm font-semibold md:col-span-2">
              <input name="published" type="checkbox" defaultChecked className="h-5 w-5 accent-primary" />
              Publish immediately
            </label>
            <button className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white md:w-fit">Create studio</button>
          </form>
        </details>
      </section>
    </main>
  );
}
