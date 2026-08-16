import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieNotice from "@/components/CookieNotice";
import JsonLd from "@/components/JsonLd";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getSiteCopy } from "@/content/site-copy";
import { localeAssetPath, localeMetadata, localePublicUrl, siteLocale } from "@/lib/site-locale";
import { absoluteUrl, siteUrl } from "@/lib/seo";
import { robotsMetadata } from "@/lib/seo-indexing";

const copy = getSiteCopy();
const brandMark = localeAssetPath("/brand/archicompass-mark.png");
const outfitFontFaceCss = `
  @font-face {
    font-family: "Outfit";
    font-style: normal;
    font-weight: 100 900;
    font-display: swap;
    src: url("${localeAssetPath("/fonts/outfit-latin-ext.woff2")}") format("woff2");
    unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7,
      U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F,
      U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F,
      U+A720-A7FF;
  }
  @font-face {
    font-family: "Outfit";
    font-style: normal;
    font-weight: 100 900;
    font-display: swap;
    src: url("${localeAssetPath("/fonts/outfit-latin.woff2")}") format("woff2");
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6,
      U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122,
      U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
  }
`;

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
        alt: siteLocale === "pl" ? "Współczesne wnętrze prezentowane przez ArchiCompass" : "Contemporary interior presented by ArchiCompass",
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
  robots: robotsMetadata(),
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  icons: {
    icon: brandMark,
    apple: brandMark,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={localeMetadata[siteLocale].html}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: outfitFontFaceCss }} />
      </head>
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
        <CookieNotice />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
