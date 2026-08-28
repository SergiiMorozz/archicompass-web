import { permanentRedirect } from "next/navigation";
import { localePublicPath, siteLocale } from "@/lib/site-locale";

export default function PrivacyAndAiPage() {
  permanentRedirect(localePublicPath(siteLocale, "/ai-transparency"));
}
