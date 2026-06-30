import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ArchiCompass | AI Project Brief & Designer Matching",
  description: "Turn interior references into a clear brief and find designers who fit the project.",
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
      <body className={`${outfit.variable} antialiased`}>
        <div className="min-h-screen bg-background text-foreground">
          <Header />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
