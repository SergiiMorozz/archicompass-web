import { safeInternalPath, stripLocalePrefix } from "@/lib/safe-next-path";

export const portfolioAutopilotPath = "/studio/portfolio-autopilot";

export function portfolioAutopilotReturnPath(value: string | null | undefined) {
  const path = stripLocalePrefix(safeInternalPath(value, ""));
  return path === portfolioAutopilotPath ? path : "";
}

export function onboardingPortfolioAutopilotReturnPath(value: string | null | undefined) {
  const path = stripLocalePrefix(safeInternalPath(value, ""));
  if (!path.startsWith("/onboarding")) return "";

  const next = new URL(path, "https://archicompass.local").searchParams.get("next");
  return portfolioAutopilotReturnPath(next);
}

export function profileSetupPath(returnPath = "", studioSetup = false) {
  const params = new URLSearchParams({ onboarding: "1" });
  const portfolioReturn = portfolioAutopilotReturnPath(returnPath);

  if (portfolioReturn) {
    params.set("next", portfolioReturn);
  } else if (studioSetup) {
    params.set("studio", "1");
  }

  return `/account/profile?${params.toString()}`;
}
