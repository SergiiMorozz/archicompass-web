import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description: "Terms governing ArchiCompass accounts, briefs, profiles, portfolios, messages, matching, and AI features.",
  path: "/terms",
});

const sections = [
  {
    title: "1. Service and acceptance",
    body: "ArchiCompass is an online platform for preparing interior-project briefs, discovering designers and studios, publishing professional portfolios, and managing project inquiries. By creating an account or using the platform, you agree to these Terms and the Privacy Policy.",
  },
  {
    title: "2. Eligibility and accounts",
    body: "You must be at least 18 years old and legally able to accept these Terms. Use an email address you control, provide accurate information, protect your password, and promptly update material account details. One account must use one primary role: client or professional. You are responsible for activity performed through your account.",
  },
  {
    title: "3. Clients, professionals, and studios",
    body: "Clients decide which professionals to contact and hire. Designers, architects, and studios are independent service providers, not employees or agents of ArchiCompass. They are responsible for their qualifications, licences, statements, pricing, availability, services, contracts, taxes, insurance, and compliance with professional and consumer law. Studio owners are responsible for member access to shared inquiries and content.",
  },
  {
    title: "4. Marketplace relationship",
    body: "ArchiCompass helps users discover and communicate with each other but is not a party to design, architecture, construction, payment, or other contracts concluded between users. A profile, match score, rating, badge, or search position is not an endorsement, certification, or guarantee of quality, availability, price, or outcome. Verify a professional's identity, qualifications, insurance, scope, and contract before engaging them.",
  },
  {
    title: "5. Your content",
    body: "You retain ownership of content you upload. You grant ArchiCompass a non-exclusive, worldwide, royalty-free licence to host, store, process, resize, reproduce, display, and transmit that content only as needed to operate, secure, promote, and improve the platform and the features you choose. Public professional profiles and portfolio content may be displayed in search results and promotional platform surfaces. You confirm that you have all rights and permissions required for the content you submit.",
  },
  {
    title: "6. AI and matching features",
    body: "AI photo analysis and matching results are informational tools based on the information available to the platform. Results may be inaccurate, incomplete, or unsuitable for a specific project. They do not replace professional design, architecture, engineering, construction, safety, legal, tax, or financial advice. Users remain responsible for decisions made using these features.",
  },
  {
    title: "7. Ratings and external information",
    body: "Public ratings, review counts, business details, and external project links may come from users or third-party services such as Google. Availability and accuracy can change. Do not manipulate ratings, publish fabricated claims, or misrepresent another person or business.",
  },
  {
    title: "8. Acceptable use",
    body: "Do not attempt unauthorised access, upload malware or unlawful material, infringe intellectual-property or privacy rights, impersonate others, scrape or resell platform data, circumvent security, send spam, harass users, publish discriminatory or deceptive content, or use ArchiCompass in violation of applicable law. Contact details obtained through the platform may be used only for legitimate project communication.",
  },
  {
    title: "9. Fees",
    body: "ArchiCompass currently provides the available account and matching features without a platform fee or commission. Paid subscriptions, promoted placement, commissions, or other services may be introduced in the future. Any applicable price, billing period, and additional terms will be shown before a user purchases or activates a paid service.",
  },
  {
    title: "10. Availability and changes",
    body: "We work to keep ArchiCompass available and secure, but uninterrupted access, error-free operation, permanent storage, a particular match, a professional response, or a successful project cannot be guaranteed. Features may be updated, replaced, or discontinued for operational, security, legal, or product reasons. Keep independent copies of important briefs, plans, images, contracts, and messages.",
  },
  {
    title: "11. Suspension and deletion",
    body: "We may restrict or suspend access to protect users or the platform, investigate misuse, comply with law, or enforce these Terms. You may delete supported content and accounts using available controls. Some records may be retained where required for security, disputes, legal obligations, or backup recovery, as described in the Privacy Policy.",
  },
  {
    title: "12. Intellectual property",
    body: "The ArchiCompass name, branding, interface, software, original platform content, and related intellectual property belong to ArchiCompass or its licensors. These Terms do not grant permission to copy, reverse engineer, reproduce, or commercially exploit them except as allowed by law or written permission.",
  },
  {
    title: "13. Liability",
    body: "To the maximum extent permitted by law, ArchiCompass is not liable for user content, professional services, third-party conduct, external websites, or indirect losses arising from user-to-user projects. Nothing in these Terms excludes liability or consumer rights that cannot legally be excluded or limited.",
  },
  {
    title: "14. Law and disputes",
    body: "These Terms are governed by Polish law, without depriving consumers of mandatory protections available under the law of their habitual residence. Please contact us first so we can try to resolve a concern. Users may also use any competent consumer-protection body, supervisory authority, or court available under applicable law.",
  },
  {
    title: "15. Changes and contact",
    body: "We may update these Terms to reflect service, legal, or security changes. Material changes will be communicated through the platform or by email where appropriate. Questions about these Terms can be sent to contact@archicompass.pl; security and abuse reports can be sent to admin@archicompass.pl.",
  },
];

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold uppercase text-primary">Legal</p>
      <h1 className="mt-3 text-4xl font-bold">Terms of Service</h1>
      <p className="mt-3 text-sm text-muted">Effective: July 6, 2026</p>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">
        These Terms define the rules for using ArchiCompass as a client, independent
        professional, studio member, or visitor.
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
        <h2 className="text-xl font-bold">Questions or reports</h2>
        <p className="mt-2 leading-7 text-muted">
          Email <a href="mailto:contact@archicompass.pl" className="font-semibold text-primary hover:underline">contact@archicompass.pl</a> for general questions or <a href="mailto:admin@archicompass.pl" className="font-semibold text-primary hover:underline">admin@archicompass.pl</a> for security and abuse reports.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-primary">
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          <Link href="/cookies" className="hover:underline">Cookie Policy</Link>
        </div>
      </div>
    </main>
  );
}
