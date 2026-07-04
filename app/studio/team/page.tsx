import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { publicTextError } from "@/lib/content-moderation";
import { fetchGooglePlaceSummary } from "@/lib/google-places";
import { getAccountRole, getStudioMemberships } from "@/lib/studios";
import {
  serviceCapabilities,
  serviceCapabilityValues,
} from "@/lib/service-capabilities";
import {
  availabilityStatuses,
  pricingModels,
  workModes,
  workModeValues,
} from "@/lib/profile-pricing";

export const revalidate = 0;

type Studio = {
  id: string;
  owner_id: string;
  name: string;
  profile_headline: string | null;
  profile_logo_path: string | null;
  profile_banner_path: string | null;
  bio: string | null;
  location: string | null;
  specialties: string[] | null;
  service_capabilities: string[] | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  hourly_rate: number | null;
  pricing_model: string | null;
  price_from: number | null;
  price_to: number | null;
  minimum_project_budget: number | null;
  work_modes: string[] | null;
  availability_status: string | null;
  cooperation_terms: string | null;
  years_experience: number | null;
  google_business_url: string | null;
  google_place_id: string | null;
  google_rating: number | null;
  google_review_count: number | null;
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
const fileClass =
  "mt-2 w-full rounded-xl border border-dashed border-line bg-background px-4 py-4 text-sm font-normal text-muted file:mr-4 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white";

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

function fileValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

async function uploadStudioMedia(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  kind: "logo" | "banner",
  file: File | null
) {
  if (!file) return null;
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
    actionRedirect(`${kind === "logo" ? "Logo" : "Banner"} must be a JPEG, PNG, or WebP image smaller than 5 MB.`);
  }
  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${userId}/studio-${kind}-${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("profile-media").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) actionRedirect(error.message);
  return path;
}

async function studioPayload(
  formData: FormData,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  current?: Pick<Studio, "profile_logo_path" | "profile_banner_path"> | null
) {
  const name = textValue(formData, "name");
  if (!name || name.length < 2) actionRedirect("Studio name must contain at least two characters.");

  const headline = textValue(formData, "profile_headline");
  const bio = textValue(formData, "bio");
  const cooperationTerms = textValue(formData, "cooperation_terms");
  const specialties = listValue(formData, "specialties");
  const moderationError = publicTextError([name, headline, bio, cooperationTerms, ...specialties]);
  if (moderationError) actionRedirect(moderationError);
  const placeId = textValue(formData, "google_place_id");
  const google = placeId ? await fetchGooglePlaceSummary(placeId) : { data: null };
  const logoPath = await uploadStudioMedia(supabase, userId, "logo", fileValue(formData, "profile_logo"));
  const bannerPath = await uploadStudioMedia(supabase, userId, "banner", fileValue(formData, "profile_banner"));

  return {
    name,
    profile_headline: headline,
    profile_logo_path: logoPath ?? current?.profile_logo_path ?? null,
    profile_banner_path: bannerPath ?? current?.profile_banner_path ?? null,
    bio,
    location: textValue(formData, "location"),
    specialties,
    service_capabilities: serviceCapabilityValues(formData),
    website: textValue(formData, "website"),
    phone: textValue(formData, "phone"),
    email: textValue(formData, "email"),
    hourly_rate: null,
    pricing_model: textValue(formData, "pricing_model"),
    price_from: numberValue(formData, "price_from"),
    price_to: numberValue(formData, "price_to"),
    minimum_project_budget: numberValue(formData, "minimum_project_budget"),
    work_modes: workModeValues(formData),
    availability_status: textValue(formData, "availability_status"),
    cooperation_terms: cooperationTerms,
    years_experience: numberValue(formData, "years_experience"),
    google_place_id: placeId,
    google_business_url: google.data?.businessUrl ?? null,
    google_rating: google.data?.rating ?? null,
    google_review_count: google.data?.reviewCount ?? null,
    google_rating_updated_at: google.data ? new Date().toISOString() : null,
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
    .insert({ ...(await studioPayload(formData, supabase, user.id)), owner_id: user.id })
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

  const { data: currentStudio } = await supabase
    .from("studios")
    .select("profile_logo_path, profile_banner_path")
    .eq("id", studioId)
    .maybeSingle();

  const { data, error } = await supabase
    .from("studios")
    .update(await studioPayload(formData, supabase, userData.user.id, currentStudio as Pick<Studio, "profile_logo_path" | "profile_banner_path"> | null))
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
        .select("id, owner_id, name, profile_headline, profile_logo_path, profile_banner_path, bio, location, specialties, service_capabilities, website, phone, email, hourly_rate, pricing_model, price_from, price_to, minimum_project_budget, work_modes, availability_status, cooperation_terms, years_experience, google_business_url, google_place_id, google_rating, google_review_count, published, created_at")
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
                      <label className="text-sm font-semibold">Profile headline<input name="profile_headline" maxLength={140} defaultValue={studio.profile_headline ?? ""} className={fieldClass} /></label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="text-sm font-semibold">Studio logo<input name="profile_logo" type="file" accept="image/jpeg,image/png,image/webp" className={fileClass} /></label>
                        <label className="text-sm font-semibold">Studio banner<input name="profile_banner" type="file" accept="image/jpeg,image/png,image/webp" className={fileClass} /></label>
                      </div>
                      <label className="text-sm font-semibold">Location<input name="location" defaultValue={studio.location ?? ""} className={fieldClass} /></label>
                      <label className="text-sm font-semibold">Specialties<input name="specialties" defaultValue={studio.specialties?.join(", ") ?? ""} className={fieldClass} /></label>
                      <fieldset>
                        <legend className="text-sm font-semibold">Services available</legend>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {serviceCapabilities.map((capability) => (
                            <label key={capability} className="flex items-center gap-3 rounded-xl border border-line bg-card px-3 py-2 text-sm font-semibold">
                              <input type="checkbox" name="service_capabilities" value={capability} defaultChecked={studio.service_capabilities?.includes(capability)} className="h-4 w-4 accent-primary" />
                              {capability}
                            </label>
                          ))}
                        </div>
                      </fieldset>
                      <label className="text-sm font-semibold">Bio<textarea name="bio" rows={5} defaultValue={studio.bio ?? ""} className={fieldClass} /></label>
                      <label className="text-sm font-semibold">Website<input name="website" defaultValue={studio.website ?? ""} className={fieldClass} /></label>
                      <label className="text-sm font-semibold">Public email<input name="email" type="email" defaultValue={studio.email ?? ""} className={fieldClass} /></label>
                      <label className="text-sm font-semibold">Phone<input name="phone" defaultValue={studio.phone ?? ""} className={fieldClass} /></label>
                      <label className="text-sm font-semibold">Experience<input name="years_experience" inputMode="numeric" defaultValue={studio.years_experience ?? ""} className={fieldClass} /></label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="text-sm font-semibold">Pricing model<select name="pricing_model" defaultValue={studio.pricing_model ?? "Custom quote"} className={fieldClass}>{pricingModels.map((model) => <option key={model} value={model}>{model}</option>)}</select></label>
                        <label className="text-sm font-semibold">Availability<select name="availability_status" defaultValue={studio.availability_status ?? "Waitlist / ask"} className={fieldClass}>{availabilityStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
                        <label className="text-sm font-semibold">Price from, PLN per selected model<input name="price_from" inputMode="numeric" defaultValue={studio.price_from ?? ""} className={fieldClass} /></label>
                        <label className="text-sm font-semibold">Price to, PLN per selected model<input name="price_to" inputMode="numeric" defaultValue={studio.price_to ?? ""} className={fieldClass} /></label>
                        <label className="text-sm font-semibold sm:col-span-2">Minimum project budget, PLN<input name="minimum_project_budget" inputMode="numeric" defaultValue={studio.minimum_project_budget ?? ""} className={fieldClass} /></label>
                      </div>
                      <fieldset>
                        <legend className="text-sm font-semibold">Work formats</legend>
                        <div className="mt-3 flex flex-wrap gap-2">{workModes.map((mode) => <label key={mode} className="flex items-center gap-2 rounded-xl border border-line bg-card px-3 py-2 text-sm font-semibold"><input type="checkbox" name="work_modes" value={mode} defaultChecked={studio.work_modes?.includes(mode)} className="h-4 w-4 accent-primary" />{mode}</label>)}</div>
                      </fieldset>
                      <label className="text-sm font-semibold">Cooperation terms<textarea name="cooperation_terms" rows={4} defaultValue={studio.cooperation_terms ?? ""} className={fieldClass} /></label>
                      <div className="rounded-lg border border-[#eadbb5] bg-[#fff8e5] p-4">
                        <div className="font-bold">Google Business rating</div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <label className="text-sm font-semibold sm:col-span-2">Google Place ID<input name="google_place_id" defaultValue={studio.google_place_id ?? ""} placeholder="ChIJ..." className={fieldClass} /></label>
                          <p className="text-sm text-muted sm:col-span-2">Rating and review count are verified automatically and cannot be typed manually.</p>
                        </div>
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
            <label className="text-sm font-semibold">Profile headline<input name="profile_headline" maxLength={140} className={fieldClass} /></label>
            <label className="text-sm font-semibold">Studio logo<input name="profile_logo" type="file" accept="image/jpeg,image/png,image/webp" className={fileClass} /></label>
            <label className="text-sm font-semibold">Studio banner<input name="profile_banner" type="file" accept="image/jpeg,image/png,image/webp" className={fileClass} /></label>
            <label className="text-sm font-semibold">Location<input name="location" className={fieldClass} /></label>
            <label className="text-sm font-semibold md:col-span-2">Specialties<input name="specialties" placeholder="residential, hospitality, renovations" className={fieldClass} /></label>
            <fieldset className="md:col-span-2">
              <legend className="text-sm font-semibold">Services available</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {serviceCapabilities.map((capability) => (
                  <label key={capability} className="flex items-center gap-3 rounded-xl border border-line bg-background px-3 py-2 text-sm font-semibold">
                    <input type="checkbox" name="service_capabilities" value={capability} className="h-4 w-4 accent-primary" />
                    {capability}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="text-sm font-semibold md:col-span-2">Bio<textarea name="bio" rows={5} className={fieldClass} /></label>
            <label className="text-sm font-semibold">Website<input name="website" placeholder="https://" className={fieldClass} /></label>
            <label className="text-sm font-semibold">Public email<input name="email" type="email" defaultValue={user.email ?? ""} className={fieldClass} /></label>
            <label className="text-sm font-semibold">Phone<input name="phone" className={fieldClass} /></label>
            <label className="text-sm font-semibold">Years of experience<input name="years_experience" inputMode="numeric" className={fieldClass} /></label>
            <label className="text-sm font-semibold">Pricing model<select name="pricing_model" defaultValue="Custom quote" className={fieldClass}>{pricingModels.map((model) => <option key={model} value={model}>{model}</option>)}</select></label>
            <label className="text-sm font-semibold">Availability<select name="availability_status" defaultValue="Waitlist / ask" className={fieldClass}>{availabilityStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
            <label className="text-sm font-semibold">Price from, PLN per selected model<input name="price_from" inputMode="numeric" className={fieldClass} /></label>
            <label className="text-sm font-semibold">Price to, PLN per selected model<input name="price_to" inputMode="numeric" className={fieldClass} /></label>
            <label className="text-sm font-semibold md:col-span-2">Minimum project budget, PLN<input name="minimum_project_budget" inputMode="numeric" className={fieldClass} /></label>
            <fieldset className="md:col-span-2"><legend className="text-sm font-semibold">Work formats</legend><div className="mt-3 flex flex-wrap gap-2">{workModes.map((mode) => <label key={mode} className="flex items-center gap-2 rounded-xl border border-line bg-background px-3 py-2 text-sm font-semibold"><input type="checkbox" name="work_modes" value={mode} className="h-4 w-4 accent-primary" />{mode}</label>)}</div></fieldset>
            <label className="text-sm font-semibold md:col-span-2">Cooperation terms<textarea name="cooperation_terms" rows={4} className={fieldClass} /></label>
            <div className="rounded-lg border border-[#eadbb5] bg-[#fff8e5] p-4 md:col-span-2">
              <div className="font-bold">Google Business rating</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold sm:col-span-2">Google Place ID<input name="google_place_id" placeholder="ChIJ..." className={fieldClass} /></label>
                <p className="text-sm text-muted sm:col-span-2">Rating and review count are verified automatically.</p>
              </div>
            </div>
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
