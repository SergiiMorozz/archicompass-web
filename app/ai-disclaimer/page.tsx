import { permanentRedirect } from "next/navigation";
import { localePublicPath, siteLocale } from "@/lib/site-locale";

export default function AiDisclaimerPage() {
  permanentRedirect(localePublicPath(siteLocale, "/ai-transparency"));
}
