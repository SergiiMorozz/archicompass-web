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
  title: "ArchiCompass | Find Your Interior Designer & Architect",
  description: "Find your perfect interior designer & architect",
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
