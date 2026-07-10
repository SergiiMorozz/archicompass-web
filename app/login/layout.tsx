import type { Metadata } from "next";
import { authCopy } from "@/content/pl/copy";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Logowanie i rejestracja",
  description: `${authCopy.signIn.description} ${authCopy.signUp.description}`,
  path: "/login",
  noIndex: true,
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
