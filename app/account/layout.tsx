import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getActiveAdminRole } from "@/lib/admin";
import { currentRequestPath } from "@/lib/request-path";
import { getExplicitAccountRole } from "@/lib/studios";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getWorkspaceCopy } from "@/content/workspace-copy";

export const revalidate = 0;
const workspaceCopy = getWorkspaceCopy();
export const metadata: Metadata = {
  title: `${workspaceCopy.account.account} | ArchiCompass`,
  robots: { index: false, follow: false, nocache: true },
};

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  const requestedPath = await currentRequestPath("/account");

  if (!user) redirect(`/login?next=${encodeURIComponent(requestedPath)}`);
  const [accountRole, adminRole] = await Promise.all([
    getExplicitAccountRole(supabase, user.id),
    getActiveAdminRole(supabase, user.id),
  ]);

  if (!accountRole && !adminRole) {
    redirect(`/onboarding?next=${encodeURIComponent(requestedPath)}`);
  }

  return children;
}
