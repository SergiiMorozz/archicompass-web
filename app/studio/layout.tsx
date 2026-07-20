import type { Metadata } from "next";
import { redirect } from "next/navigation";
import StudioNav from "@/components/StudioNav";
import { getWorkspaceCopy } from "@/content/workspace-copy";
import { getActiveAdminRole } from "@/lib/admin";
import { currentRequestPath } from "@/lib/request-path";
import {
  getExplicitAccountRole,
  getStudioMemberships,
  inquiryRecipientFilter,
} from "@/lib/studios";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 0;
const workspaceCopy = getWorkspaceCopy();
export const metadata: Metadata = {
  title: `${workspaceCopy.studioNav.studio} | ArchiCompass`,
  robots: { index: false, follow: false, nocache: true },
};

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const copy = getWorkspaceCopy().studioNav;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  const requestedPath = await currentRequestPath("/studio");

  if (!user) redirect(`/login?next=${encodeURIComponent(requestedPath)}`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, user_type, profession_type")
    .eq("id", user.id)
    .maybeSingle();

  const [accountRole, adminRole] = await Promise.all([
    getExplicitAccountRole(supabase, user.id),
    getActiveAdminRole(supabase, user.id),
  ]);

  if (!accountRole && !adminRole) redirect(`/onboarding?next=${encodeURIComponent(requestedPath)}`);

  if (accountRole !== "designer" && !adminRole) redirect("/client");

  const { data: memberships } = await getStudioMemberships(supabase, user.id, "active");
  const studioIds = memberships.map((membership) => membership.studio_id);

  const { data: incoming } = await supabase
    .from("designer_inquiries")
    .select("id, client_id, status")
    .or(inquiryRecipientFilter(user.id, studioIds));
  const inquiryIds = (incoming ?? []).map((item) => item.id);
  const clientIds = Array.from(new Set((incoming ?? []).map((item) => item.client_id)));
  const newRequestCount = (incoming ?? []).filter((item) => item.status === "sent").length;
  const { count: unreadCount } = inquiryIds.length
    ? await supabase
        .from("inquiry_messages")
        .select("id", { count: "exact", head: true })
        .in("inquiry_id", inquiryIds)
        .in("sender_id", clientIds)
        .is("read_at", null)
    : { count: 0 };

  return (
    <div className="min-h-screen bg-background">
      <StudioNav
        profileId={profile ? user.id : null}
        profileName={profile?.full_name || user.email || copy.defaultProfileName}
        unreadCount={(unreadCount ?? 0) + newRequestCount}
      />
      {children}
    </div>
  );
}
