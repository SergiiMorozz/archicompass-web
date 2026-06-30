import { redirect } from "next/navigation";
import ClientNav from "@/components/ClientNav";
import { getAccountRole } from "@/lib/studios";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");
  if ((await getAccountRole(supabase, user.id)) !== "client") redirect("/studio");

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
        accountName={profile?.full_name || user.email || "Your project workspace"}
        unreadCount={unreadCount ?? 0}
      />
      {children}
    </div>
  );
}
