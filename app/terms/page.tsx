import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description: "Terms governing ArchiCompass accounts, project briefs, professional profiles, portfolios, messages, and AI features.",
  path: "/terms",
});

const sections = [
  {
    title: "1. Closed beta",
    body: "ArchiCompass is an invitation-only beta used to test project briefs, designer profiles, matching, and project inquiries. Features may change, pause, or be removed, and test data may be reset after reasonable notice.",
  },
  {
    title: "2. Eligibility and accounts",
    body: "You must be at least 18 years old and able to agree to these terms. Use an email address you control, keep your password and account recovery links private, and provide accurate information. You are responsible for activity performed through your account.",
  },
  {
    title: "3. Client and professional roles",
    body: "Clients remain responsible for choosing and contracting a professional. Designers and architects remain independent from ArchiCompass and are responsible for their qualifications, statements, prices, availability, work, contracts, and legal obligations. A beta profile or badge is not a guarantee or professional certification.",
  },
  {
    title: "4. Your content",
    body: "You keep ownership of content you upload. You give ArchiCompass a limited permission to host, process, resize, display, and transmit that content only as needed to operate the beta features you choose. You confirm that you have the right to upload and share the content and that it does not violate another person's privacy or intellectual property rights.",
  },
  {
    title: "5. Photos and AI output",
    body: "When you choose AI photo analysis, selected reference images and project context are sent to the configured AI provider. AI output may be inaccurate, incomplete, or unsuitable for your project. Always use professional judgment for design, construction, safety, cost, legal, or financial decisions.",
  },
  {
    title: "6. Acceptable use",
    body: "Do not misuse the service, attempt unauthorized access, upload malware or unlawful material, impersonate another person, scrape profiles, send spam, harass users, or use the beta to infringe rights or break applicable law.",
  },
  {
    title: "7. Fees and commissions",
    body: "The current closed beta does not charge users or take a commission. If paid plans, commissions, or other fees are introduced later, the applicable price and additional terms will be shown before they apply to you.",
  },
  {
    title: "8. Availability and warranty",
    body: "The beta is provided as available for testing. ArchiCompass does not promise uninterrupted operation, permanent storage, a specific match, a successful project, or a response from any professional. Keep your own copies of important briefs, images, contracts, and project records.",
  },
  {
    title: "9. Suspension and deletion",
    body: "Access may be limited or removed to protect the service, comply with law, investigate misuse, or end the beta. You can delete supported projects, images, briefs, and inquiries through the account tools or request additional deletion through your invitation channel.",
  },
  {
    title: "10. Law and changes",
    body: "These beta terms are governed by Polish law, without removing mandatory rights that apply to you under consumer or data protection law. Material changes will be communicated through the product or the beta contact channel before continued use is requested.",
  },
];

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold uppercase text-primary">Closed beta</p>
      <h1 className="mt-3 text-4xl font-bold">Terms of Service</h1>
      <p className="mt-3 text-sm text-muted">Last updated: June 29, 2026</p>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">
        These terms apply to invited ArchiCompass testers. By using the beta, you agree
        to use it responsibly and understand that the product is still being tested.
      </p>

      <div className="mt-10 grid gap-9">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-2xl font-bold">{section.title}</h2>
            <p className="mt-3 text-base leading-8 text-muted">{section.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-lg border border-line bg-card p-6">
        <h2 className="text-xl font-bold">Questions about the beta</h2>
        <p className="mt-2 leading-7 text-muted">
          Use the email or communication channel through which you received your beta
          invitation. A permanent public support address will be added before launch.
        </p>
        <Link href="/privacy" className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline">
          Read the Privacy Policy
        </Link>
      </div>
    </main>
  );
}
