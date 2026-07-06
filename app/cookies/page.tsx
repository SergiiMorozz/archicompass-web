import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Cookie Policy",
  description: "How ArchiCompass uses essential cookies and browser storage.",
  path: "/cookies",
});

const sections = [
  {
    title: "Essential authentication and security",
    body: "ArchiCompass and Supabase use cookies and similar storage to keep users signed in, protect sessions, complete authentication, prevent misuse, and apply account permissions. These technologies are necessary for requested account features to work.",
  },
  {
    title: "Preferences and workflow storage",
    body: "The browser may store language, interface, Project Compass, upload-preview, and workflow state so that forms and navigation behave consistently. Some temporary information is removed when the browser tab or session ends.",
  },
  {
    title: "Limited analytics",
    body: "A random browser-tab identifier may be used to reduce duplicate professional-profile view counts. It is not designed to identify a visitor by name or email. ArchiCompass does not currently use third-party advertising cookies or sell browsing data.",
  },
  {
    title: "Managing storage",
    body: "You can remove or block cookies and site data in your browser settings. Blocking essential storage may sign you out or prevent account, upload, messaging, favorites, and security features from working correctly.",
  },
  {
    title: "Updates and contact",
    body: "We will update this policy if analytics, advertising, or other non-essential cookie uses are introduced. Questions can be sent to contact@archicompass.pl.",
  },
];

export default function CookiePolicyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold uppercase text-primary">Legal</p>
      <h1 className="mt-3 text-4xl font-bold">Cookie Policy</h1>
      <p className="mt-3 text-sm text-muted">Effective: July 6, 2026</p>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">
        This policy explains the cookies and browser-storage technologies used by ArchiCompass.
      </p>
      <div className="mt-10 grid gap-9">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-2xl font-bold">{section.title}</h2>
            <p className="mt-3 text-base leading-8 text-muted">{section.body}</p>
          </section>
        ))}
      </div>
      <div className="mt-12 flex flex-wrap gap-4 text-sm font-semibold text-primary">
        <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
        <Link href="/terms" className="hover:underline">Terms of Service</Link>
        <a href="mailto:contact@archicompass.pl" className="hover:underline">Contact ArchiCompass</a>
      </div>
      <p className="mt-6 text-sm leading-6 text-muted">
        ArchiCompass is operated by SM Advisory, Sergii Moroz · NIP 5252995634 · REGON 528006413 · ul. Grzybowska 2, lok. 31, 00-131 Warszawa, Poland.
      </p>
    </main>
  );
}
