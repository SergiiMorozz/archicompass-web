import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { absoluteUrl, siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Find Interior Designers with AI | ArchiCompass",
    template: "%s | ArchiCompass",
  },
  description:
    "Find interior designers and design studios by location, style, services, and portfolio. Use AI to turn inspiration photos into a clear project brief.",
  applicationName: "ArchiCompass",
  authors: [{ name: "ArchiCompass", url: siteUrl() }],
  creator: "ArchiCompass",
  publisher: "ArchiCompass",
  category: "Interior design marketplace",
  keywords: [
    "interior designer",
    "find interior designer",
    "interior designer Poland",
    "projektant wnętrz",
    "architekt wnętrz",
    "design studio",
    "interior design portfolio",
    "AI interior style finder",
  ],
  alternates: { canonical: siteUrl() },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ArchiCompass",
    url: siteUrl(),
    title: "Find Interior Designers with AI | ArchiCompass",
    description:
      "Build a clear interior design brief from inspiration photos and find professionals who fit your project.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85",
        width: 1600,
        height: 900,
        alt: "Contemporary interior design featured by ArchiCompass",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Find Interior Designers with AI | ArchiCompass",
    description:
      "Build a clear interior design brief and discover professionals who fit your project.",
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
    <html lang="en">
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
                "An AI-assisted marketplace for finding interior designers and design studios.",
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
