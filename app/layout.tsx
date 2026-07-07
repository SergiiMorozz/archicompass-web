import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { absoluteUrl, siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Znajdź projektanta wnętrz z pomocą AI | ArchiCompass",
    template: "%s | ArchiCompass",
  },
  description:
    "Znajdź projektantów wnętrz i pracownie projektowe według lokalizacji, stylu, usług i portfolio. Zamień zdjęcia inspiracji w precyzyjny brief z pomocą AI.",
  applicationName: "ArchiCompass",
  authors: [{ name: "ArchiCompass", url: siteUrl() }],
  creator: "ArchiCompass",
  publisher: "ArchiCompass",
  category: "Platforma projektowania wnętrz",
  keywords: [
    "projektant wnętrz",
    "znajdź projektanta wnętrz",
    "projektant wnętrz Polska",
    "architekt wnętrz Warszawa",
    "projektowanie wnętrz",
    "projektant wnętrz",
    "architekt wnętrz",
    "pracownia projektowania wnętrz",
    "portfolio projektanta wnętrz",
    "AI rozpoznawanie stylu wnętrza",
  ],
  alternates: { canonical: siteUrl() },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: "ArchiCompass",
    url: siteUrl(),
    title: "Znajdź projektanta wnętrz z pomocą AI | ArchiCompass",
    description:
      "Stwórz precyzyjny brief na podstawie zdjęć inspiracji i znajdź specjalistów dopasowanych do Twojego projektu.",
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
    title: "Znajdź projektanta wnętrz z pomocą AI | ArchiCompass",
    description:
      "Stwórz precyzyjny brief i poznaj specjalistów dopasowanych do Twojego projektu.",
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
    <html lang="pl">
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
              description:
                "Platforma wspierana przez AI, która pomaga znaleźć projektantów wnętrz i pracownie projektowe.",
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
      </body>
    </html>
  );
}
