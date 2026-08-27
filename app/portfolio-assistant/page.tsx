import { redirect } from "next/navigation";
import { portfolioAutopilotPath } from "@/lib/portfolio-autopilot-return";
import { getExplicitAccountRole } from "@/lib/studios";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function PortfolioAssistantEntryPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (user && await getExplicitAccountRole(supabase, user.id) === "designer") {
    redirect(portfolioAutopilotPath);
  }

  redirect(`/get-started?next=${encodeURIComponent(portfolioAutopilotPath)}`);
}
