import type { Metadata } from "next";
import { Cormorant_Garamond, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ClientWidgets } from "@/components/layout/ClientWidgets";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  preload: true,
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tarekokasha.com"),
  title: {
    default: "Tarek Okasha — AI Systems & Custom Software",
    template: "%s — Tarek Okasha",
  },
  description:
    "Independent engineer in Cairo. AI systems, intelligent automations, and custom software for founders and operators. Currently booking projects.",
  keywords: ["AI systems", "custom software", "automations", "n8n", "LLM", "Cairo", "MENA", "freelance engineer"],
  authors: [{ name: "Tarek Okasha", url: "https://tarekokasha.com" }],
  creator: "Tarek Okasha",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tarekokasha.com",
    siteName: "Tarek Okasha",
    title: "Tarek Okasha — AI Systems & Custom Software",
    description:
      "Independent engineer in Cairo. AI systems, intelligent automations, and custom software for founders and operators.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tarek Okasha — AI Systems & Custom Software",
    description: "Independent engineer in Cairo. AI systems, automations, and custom software.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-accent focus:text-ink focus:text-sm"
        >
          Skip to content
        </a>
        <ClientWidgets />
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
