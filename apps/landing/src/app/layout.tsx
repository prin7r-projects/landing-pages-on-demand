import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://landing-pages-on-demand.prin7r.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Render — A landing page on your domain in 30 minutes",
    template: "%s · Render",
  },
  description:
    "Send the brief. Render writes the copy, picks the palette, and pushes the page live to your domain — with a real Next.js repo, real analytics, and a real Let’s Encrypt certificate.",
  keywords: [
    "landing page service",
    "landing page generator",
    "AI landing page",
    "Webflow alternative",
    "Framer alternative",
    "fast landing page",
    "marketing landing",
  ],
  authors: [{ name: "prin7r-projects" }],
  openGraph: {
    type: "website",
    title: "Render — A landing page on your domain in 30 minutes",
    description:
      "Send the brief. We write the copy, pick the palette, and push the page live. This site itself was made by Render in 27 minutes.",
    url: SITE_URL,
    siteName: "Render",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Render — A landing page on your domain in 30 minutes",
    description:
      "This site you’re reading was generated, alongside 19 sibling landings, by the very pipeline this product packages.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <body className="font-sans bg-paper text-ink">
        {children}
      </body>
    </html>
  );
}
