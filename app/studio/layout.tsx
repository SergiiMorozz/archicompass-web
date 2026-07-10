import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import StudioNav from "@/components/StudioNav";
import { currentRequestPath } from "@/lib/request-path";
import {
  getExplicitAccountRole,
  getStudioMemberships,
  inquiryRecipientFilter,
} from "@/lib/studios";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 0;
export const metadata: Metadata = {
  title: "Studio projektanta",
  robots: { index: false, follow: false, nocache: true },
};

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
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

  const accountRole = await getExplicitAccountRole(supabase, user.id);

  if (!accountRole) redirect(`/onboarding?next=${encodeURIComponent(requestedPath)}`);

  if (accountRole !== "designer") {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="rounded-lg border border-line bg-card p-8 shadow-sm">
          <div className="text-sm font-semibold text-primary">Dostęp dla specjalistów</div>
          <h1 className="mt-2 text-4xl font-bold">To jest konto klienta</h1>
          <p className="mt-4 max-w-2xl leading-7 text-muted">
            Konta klientów tworzą i wysyłają briefy. Studio projektanta jest dostępne
            tylko dla kont utworzonych z rolą projektanta.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/account/profile" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">
              Sprawdź rolę konta
            </Link>
            <Link href="/account" className="rounded-xl border border-line bg-background px-5 py-3 text-sm font-semibold">
              Wróć do konta
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
        profileName={profile?.full_name || user.email || "Professional profile"}
        unreadCount={(unreadCount ?? 0) + newRequestCount}
      />
      {children}
    </div>
  );
}
