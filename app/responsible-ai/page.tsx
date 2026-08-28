import { permanentRedirect } from "next/navigation";
import { localePublicPath, siteLocale } from "@/lib/site-locale";

export default function ResponsibleAiPage() {
  permanentRedirect(localePublicPath(siteLocale, "/ai-transparency"));
}
