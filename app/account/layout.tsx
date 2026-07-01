import { redirect } from "next/navigation";
import { getExplicitAccountRole } from "@/lib/studios";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) redirect("/login?next=/account");
  if (!(await getExplicitAccountRole(supabase, user.id))) {
    redirect("/onboarding?next=/account");
  }

  return children;
}
