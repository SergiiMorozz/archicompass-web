import { redirect } from "next/navigation";
import { currentRequestPath } from "@/lib/request-path";
import { getExplicitAccountRole } from "@/lib/studios";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  const requestedPath = await currentRequestPath("/account");

  if (!user) redirect(`/login?next=${encodeURIComponent(requestedPath)}`);
  if (!(await getExplicitAccountRole(supabase, user.id))) {
    redirect(`/onboarding?next=${encodeURIComponent(requestedPath)}`);
  }

  return children;
}
