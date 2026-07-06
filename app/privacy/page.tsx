import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How ArchiCompass processes account, profile, project, message, photo, analytics, and AI data.",
  path: "/privacy",
});

const sections = [
  {
    title: "1. Controller and contact",
    body: [
      "ArchiCompass is an online platform operated by Sergii Moroz in Poland (\"ArchiCompass\", \"we\", \"us\"). ArchiCompass is the controller of personal data processed to operate the platform unless a different controller is identified for a specific service.",
      "Privacy and data-rights requests can be sent to contact@archicompass.pl. Security-related reports can be sent to admin@archicompass.pl.",
    ],
  },
  {
    title: "2. Data we process",
    body: [
      "We process information you provide, including email and authentication data, account role, profile and portfolio details, business contact information, project briefs, favorites, messages, inquiry status, uploaded project images, reference photos, and support requests.",
      "We also process technical information needed to operate and protect the service, such as timestamps, IP address, browser and device information, authentication events, error logs, and limited usage analytics. Public professional information may include Google Business profile links, ratings, and review counts.",
      "Do not upload identity documents, payment-card data, private addresses, confidential plans, images of people without permission, or special-category personal data unless the feature clearly requires it and you have a lawful basis to share it.",
    ],
  },
  {
    title: "3. Purposes and legal bases",
    body: [
      "We process data to create and secure accounts, publish professional profiles and portfolios, save client briefs, provide designer matching, support project inquiries and conversations, deliver notifications, provide customer support, prevent misuse, maintain the service, and comply with legal obligations.",
      "The legal basis depends on the activity: performance of the service you request, steps taken before entering a contract, compliance with law, your consent for optional processing, or our legitimate interests in operating, securing, improving, and measuring the platform. You may withdraw consent at any time where processing relies on consent.",
    ],
  },
  {
    title: "4. Public profiles and private workspaces",
    body: [
      "Professional profile details, studio information, portfolio projects, public ratings, and public project links are intended to be visible on the internet and may be indexed by search engines.",
      "Saved briefs, private reference photos, favorites, account details, and conversations are private unless you choose to send or share them. A professional who receives your brief can access the brief, your message, provided contact details, and signed links to related reference photos.",
      "Messages are available to the client and the professional or studio participating in the inquiry. Authorised studio members may access inquiries addressed to their studio.",
    ],
  },
  {
    title: "5. Photos and AI analysis",
    body: [
      "Reference-photo previews stay in your browser until you save a brief or request analysis. When you choose AI analysis, selected images and related project context are sent to the configured AI provider to identify visual patterns and produce style guidance.",
      "Saved reference photos are stored privately in Supabase Storage and may be shown through time-limited signed links to you and to professionals who receive the related brief. Portfolio images uploaded by professionals are public.",
      "AI output can be incomplete or incorrect. It is informational guidance and is not a substitute for professional design, construction, safety, legal, or financial advice.",
    ],
  },
  {
    title: "6. Analytics and communications",
    body: [
      "ArchiCompass records limited profile-view analytics using a random browser-tab identifier to reduce duplicate counts. The profile-view record does not contain the visitor's name or email. Professional profile owners can view aggregated activity in Designer Studio.",
      "We send service emails about account activity, new briefs, messages, unread-message reminders, security, and material service changes. These operational emails are necessary to provide the platform and are not marketing communications.",
    ],
  },
  {
    title: "7. Service providers and transfers",
    body: [
      "We use Supabase for authentication, database, and file storage; Vercel for hosting and delivery; home.pl for domain email; and configured AI providers such as Google Gemini or OpenAI for optional image analysis. Google services may be used to display or synchronise public business ratings.",
      "These providers process data under their own contractual terms and safeguards. Where data is transferred outside the European Economic Area, we rely on an applicable adequacy decision, standard contractual clauses, or another lawful transfer mechanism.",
    ],
  },
  {
    title: "8. Cookies and local storage",
    body: [
      "The platform uses cookies and browser storage that are necessary for authentication, security, language and interface preferences, and saved workflow state. We do not currently use advertising cookies. Details are available in the Cookie Policy.",
    ],
  },
  {
    title: "9. Retention and deletion",
    body: [
      "Account, profile, project, brief, favorite, and inquiry data is retained while your account is active or while it is needed to provide the requested feature. You can delete supported projects, images, unsent briefs, and accounts using the available controls or by contacting us.",
      "We may keep limited records for security, fraud prevention, dispute handling, legal compliance, and backup recovery. Backups and logs are deleted or overwritten according to operational retention schedules. Public search-engine copies may remain temporarily after content is removed from ArchiCompass.",
    ],
  },
  {
    title: "10. Your rights",
    body: [
      "Subject to applicable law, you may request access, correction, deletion, restriction, portability, or information about your data; object to processing based on legitimate interests; and withdraw consent where consent applies. We may need to verify your identity before completing a request.",
      "You may lodge a complaint with the President of the Personal Data Protection Office (UODO) in Poland or another competent supervisory authority. ArchiCompass does not make decisions producing legal or similarly significant effects solely through automated processing.",
    ],
  },
  {
    title: "11. Children and changes",
    body: [
      "ArchiCompass accounts are intended for people aged 18 or older. We may update this policy when the service, providers, or legal requirements change. The current version and its effective date will remain available on this page.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold uppercase text-primary">Legal</p>
      <h1 className="mt-3 text-4xl font-bold">Privacy Policy</h1>
      <p className="mt-3 text-sm text-muted">Effective: July 6, 2026</p>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">
        This policy explains how ArchiCompass handles personal data across client
        accounts, professional profiles, Project Compass, inquiries, messages, and
        related platform services.
      </p>

      <div className="mt-10 grid gap-9">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-2xl font-bold">{section.title}</h2>
            <div className="mt-3 grid gap-3 text-base leading-8 text-muted">
              {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-lg border border-line bg-card p-6">
        <h2 className="text-xl font-bold">Contact and further information</h2>
        <p className="mt-2 leading-7 text-muted">
          Contact <a href="mailto:contact@archicompass.pl" className="font-semibold text-primary hover:underline">contact@archicompass.pl</a> for privacy requests.
          We normally respond to verified data-rights requests within the period required by applicable law.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-primary">
          <Link href="/terms" className="hover:underline">Terms of Service</Link>
          <Link href="/cookies" className="hover:underline">Cookie Policy</Link>
          <a href="https://uodo.gov.pl/" target="_blank" rel="noreferrer" className="hover:underline">Polish supervisory authority</a>
        </div>
      </div>
    </main>
  );
}
