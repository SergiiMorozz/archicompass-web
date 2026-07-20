import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getSiteCopy } from "@/content/site-copy";
import { localeMetadata, localePublicUrl, siteLocale } from "@/lib/site-locale";
import { absoluteUrl, siteUrl } from "@/lib/seo";

const copy = getSiteCopy();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${copy.seo.defaultTitle} | ArchiCompass`,
    template: "%s | ArchiCompass",
  },
  description: copy.seo.defaultDescription,
  applicationName: "ArchiCompass",
  authors: [{ name: "ArchiCompass", url: siteUrl() }],
  creator: "ArchiCompass",
  publisher: "ArchiCompass",
  category: copy.seo.category,
  keywords: [
    ...(siteLocale === "pl"
      ? ["projektant wnętrz", "znajdź projektanta wnętrz", "projektant wnętrz Polska", "architekt wnętrz Warszawa", "projektowanie wnętrz", "pracownia projektowania wnętrz", "portfolio projektanta wnętrz", "AI rozpoznawanie stylu wnętrza"]
      : ["interior designer", "find an interior designer", "interior designers Poland", "interior architect Warsaw", "interior design", "interior design studio", "designer portfolio", "AI interior style analysis"]),
  ],
  alternates: {
    canonical: siteUrl(),
    languages: {
      pl: localePublicUrl("pl"),
      en: localePublicUrl("en"),
      "x-default": localePublicUrl("pl"),
    },
  },
  openGraph: {
    type: "website",
    locale: localeMetadata[siteLocale].openGraph,
    siteName: "ArchiCompass",
    url: siteUrl(),
    title: `${copy.seo.defaultTitle} | ArchiCompass`,
    description: copy.seo.defaultDescription,
    images: [
      {
        url: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85",
        width: 1600,
        height: 900,
        alt: "Współczesne wnętrze prezentowane przez ArchiCompass",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${copy.seo.defaultTitle} | ArchiCompass`,
    description: copy.seo.defaultDescription,
    images: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85",
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  icons: {
    icon: "/brand/archicompass-mark.png",
    apple: "/brand/archicompass-mark.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={localeMetadata[siteLocale].html}>
      <body className="antialiased">
        <JsonLd
          data={[
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": absoluteUrl("/#organization"),
              name: "ArchiCompass",
              url: siteUrl(),
              logo: absoluteUrl("/brand/archicompass-logo-purple.png"),
              description: copy.seo.organizationDescription,
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": absoluteUrl("/#website"),
              name: "ArchiCompass",
              url: siteUrl(),
              publisher: { "@id": absoluteUrl("/#organization") },
              potentialAction: {
                "@type": "SearchAction",
                target: `${absoluteUrl("/designers")}?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            },
          ]}
        />
        <div className="min-h-screen bg-background text-foreground">
          <Header />
          {children}
          <Footer />
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
