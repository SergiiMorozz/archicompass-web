import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Setup",
  robots: { index: false, follow: false, nocache: true },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
