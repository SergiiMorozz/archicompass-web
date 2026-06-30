import Link from "next/link";
import { redirect } from "next/navigation";
import StudioNav from "@/components/StudioNav";
import {
  getAccountRole,
  getStudioMemberships,
  inquiryRecipientFilter,
} from "@/lib/studios";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, user_type, profession_type")
    .eq("id", user.id)
    .maybeSingle();

  const accountRole = await getAccountRole(supabase, user.id);

  if (accountRole !== "designer") {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="rounded-lg border border-line bg-card p-8 shadow-sm">
          <div className="text-sm font-semibold text-primary">Professional access</div>
          <h1 className="mt-2 text-4xl font-bold">This is a client account</h1>
          <p className="mt-4 max-w-2xl leading-7 text-muted">
            Client accounts create and send briefs. To receive requests independently or
            join a design studio, deliberately switch the account role to Designer first.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/account/profile" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">
              Review account role
            </Link>
            <Link href="/account" className="rounded-xl border border-line bg-background px-5 py-3 text-sm font-semibold">
              Back to account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { data: memberships } = await getStudioMemberships(supabase, user.id, "active");
  const studioIds = memberships.map((membership) => membership.studio_id);

  const { data: incoming } = await supabase
    .from("designer_inquiries")
    .select("id")
    .or(inquiryRecipientFilter(user.id, studioIds));
  const inquiryIds = (incoming ?? []).map((item) => item.id);
  const { count: unreadCount } = inquiryIds.length
    ? await supabase
        .from("inquiry_messages")
        .select("id", { count: "exact", head: true })
        .in("inquiry_id", inquiryIds)
        .neq("sender_id", user.id)
        .is("read_at", null)
    : { count: 0 };

  return (
    <div className="min-h-screen bg-background">
      <StudioNav
        profileId={profile ? user.id : null}
        profileName={profile?.full_name || user.email || "Professional profile"}
        unreadCount={unreadCount ?? 0}
      />
      {children}
    </div>
  );
}
