import ProjectCompass from "@/app/ai-style-finder/ProjectCompass";
import { getExplicitAccountRole } from "@/lib/studios";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProjectCompassView() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const accountRole = data.user
    ? await getExplicitAccountRole(supabase, data.user.id)
    : null;

  return <ProjectCompass isDesigner={accountRole === "designer"} />;
}
