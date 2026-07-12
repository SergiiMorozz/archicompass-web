import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ClientNav from "@/components/ClientNav";
import { getActiveAdminRole } from "@/lib/admin";
import { currentRequestPath } from "@/lib/request-path";
import { getExplicitAccountRole } from "@/lib/studios";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 0;
export const metadata: Metadata = {
  title: "Strefa klienta | ArchiCompass",
  robots: { index: false, follow: false, nocache: true },
};

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  const requestedPath = await currentRequestPath("/client");
  if (!user) redirect(`/login?next=${encodeURIComponent(requestedPath)}`);
  const [accountRole, adminRole] = await Promise.all([
    getExplicitAccountRole(supabase, user.id),
    getActiveAdminRole(supabase, user.id),
  ]);
  if (!accountRole && !adminRole) redirect(`/onboarding?next=${encodeURIComponent(requestedPath)}`);
  if (accountRole !== "client" && !adminRole) redirect("/studio");

  const [{ data: profile }, { data: inquiries }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase.from("designer_inquiries").select("id").eq("client_id", user.id),
  ]);
  const inquiryIds = (inquiries ?? []).map((inquiry) => inquiry.id);
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
      <ClientNav
        accountName={profile?.full_name || user.email || "Twoja strefa projektu"}
        unreadCount={unreadCount ?? 0}
      />
      {children}
    </div>
  );
}
