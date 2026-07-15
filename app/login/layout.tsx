import type { Metadata } from "next";
import { getSiteCopy } from "@/content/site-copy";
import { pageMetadata } from "@/lib/seo";

const authCopy = getSiteCopy().auth;

export const metadata: Metadata = pageMetadata({
  title: `${authCopy.form.signInTab} / ${authCopy.form.signUpTab}`,
  description: `${authCopy.signIn.description} ${authCopy.signUp.description}`,
  path: "/login",
  noIndex: true,
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
