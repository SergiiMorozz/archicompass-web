import { safeInternalPath, stripLocalePrefix } from "@/lib/safe-next-path";

export const portfolioAssistantPath = "/studio/portfolio-assistant";

export function portfolioAssistantReturnPath(value: string | null | undefined) {
  const path = stripLocalePrefix(safeInternalPath(value, ""));
  return path === portfolioAssistantPath ? path : "";
}

export function onboardingPortfolioAssistantReturnPath(value: string | null | undefined) {
  const path = stripLocalePrefix(safeInternalPath(value, ""));
  if (!path.startsWith("/onboarding")) return "";

  const next = new URL(path, "https://archicompass.local").searchParams.get("next");
  return portfolioAssistantReturnPath(next);
}

export function profileSetupPath(returnPath = "", studioSetup = false) {
  const params = new URLSearchParams({ onboarding: "1" });
  const portfolioReturn = portfolioAssistantReturnPath(returnPath);

  if (portfolioReturn) {
    params.set("next", portfolioReturn);
  } else if (studioSetup) {
    params.set("studio", "1");
  }

  return `/account/profile?${params.toString()}`;
}
