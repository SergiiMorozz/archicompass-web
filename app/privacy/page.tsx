import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How ArchiCompass processes account, profile, project, message, photo, and AI analysis data.",
  path: "/privacy",
});

const sections = [
  {
    title: "Who this notice covers",
    body: [
      "ArchiCompass is an early-stage product operated from Poland and currently used for closed beta testing. This notice explains how the beta handles personal data for clients, designers, and invited testers.",
      "A dedicated public privacy contact and full business registration details will be added before a wider public launch. During the closed beta, privacy requests should be sent through the email or communication channel used for your invitation.",
    ],
  },
  {
    title: "Data we process",
    body: [
      "We may process your email address and authentication data, profile and portfolio details, project briefs, favorites, messages and inquiry status, uploaded project images, reference photos, and technical security logs such as timestamps, browser information, and IP address.",
      "Please do not upload identity documents, financial information, private addresses, photos of people, or other sensitive or confidential material.",
    ],
  },
  {
    title: "Why we use it",
    body: [
      "We use data to provide sign-in, profiles, portfolios, saved briefs, designer matching, project inquiries, support, security, and beta product improvement.",
      "Depending on the activity, processing is necessary to provide the requested beta service, based on your choice to use an optional feature, or based on the legitimate interest in keeping the service secure and understanding whether it works.",
    ],
  },
  {
    title: "Reference photos and AI analysis",
    body: [
      "Photo previews remain in your browser until you choose an action. When you select Analyze photos, up to six reference images and the related project context are sent to the configured AI provider to produce style guidance. The current closed beta provider is Google Gemini.",
      "When you select Save brief, reference photos are uploaded to private Supabase Storage. They are not placed in the public portfolio. They may be shown through time-limited signed links to you and to professionals who receive the related brief.",
      "AI output can be incomplete or incorrect. It is guidance for preparing a brief, not a professional design, construction, legal, or financial decision.",
    ],
  },
  {
    title: "Public and private content",
    body: [
      "Designer profile details and portfolio projects are intended to be public. Saved project briefs and their reference photos are private account content unless you choose to send a brief to a designer.",
      "A designer who receives a brief can see the brief information, your message, and available signed reference-photo links. Do not send a brief to someone who should not receive that information.",
      "Messages inside a request are visible only to the client and designer participating in that request. They are stored with the inquiry so both participants can keep the project context together.",
    ],
  },
  {
    title: "Designer profile analytics",
    body: [
      "ArchiCompass records a privacy-light profile view when a visitor opens a designer page. The analytics record contains the designer profile ID, page path, date, and a random browser-tab identifier used to avoid counting repeated refreshes on the same day. The analytics table does not store the visitor's name or email.",
      "Only the owner of the designer profile can read their view records through Designer Studio. A profile owner viewing their own page is not counted.",
    ],
  },
  {
    title: "Service providers",
    body: [
      "The beta uses Supabase for authentication, database, and file storage; Vercel for hosting; Google Gemini for optional photo analysis; and Resend when email notifications are enabled. These providers process data under their own terms and privacy documentation and may process data outside Poland or the European Economic Area using their applicable safeguards.",
    ],
  },
  {
    title: "Retention and deletion",
    body: [
      "Account, profile, project, brief, and inquiry data is kept while it is needed for the closed beta or while you keep it in the product. Available account tools let you delete portfolio projects, individual project images, unsent briefs, and related private reference photos. Sent requests can be cancelled while the original brief remains under your control.",
      "Some security logs and backups may remain for a limited operational period before they are overwritten or deleted. You can request access, correction, export, restriction, or deletion through your beta contact channel.",
    ],
  },
  {
    title: "Your rights",
    body: [
      "Subject to applicable law, you may have rights to be informed, access your data, correct it, request deletion or restriction, receive portable data, object to certain processing, withdraw consent where consent applies, and complain to a data protection authority. ArchiCompass does not currently make decisions that produce legal or similarly significant effects solely through automated processing.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold uppercase text-primary">Closed beta</p>
      <h1 className="mt-3 text-4xl font-bold">Privacy Policy</h1>
      <p className="mt-3 text-sm text-muted">Last updated: June 29, 2026</p>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">
        This is the working privacy notice for the invited ArchiCompass beta. It is
        written to explain the product as it operates today, including photo storage
        and AI analysis.
      </p>

      <div className="mt-10 grid gap-9">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-2xl font-bold">{section.title}</h2>
            <div className="mt-3 grid gap-3 text-base leading-8 text-muted">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-lg border border-line bg-card p-6">
        <h2 className="text-xl font-bold">Before wider launch</h2>
        <p className="mt-2 leading-7 text-muted">
          This notice will be reviewed with complete operator and contact details before
          ArchiCompass accepts users outside the invited beta.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-primary">
          <Link href="/terms" className="hover:underline">Terms of Service</Link>
          <a
            href="https://commission.europa.eu/law/law-topic/data-protection/information-individuals_en"
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            EU data protection rights
          </a>
        </div>
      </div>
    </main>
  );
}
