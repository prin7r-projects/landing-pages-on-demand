import type { Metadata } from "next";
import { Archivo_Black, Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Swiss Industrial Print: heavy sans-serif macro-typography (Archivo Black),
// neutral body sans (Geist), and JetBrains Mono for tabular metadata.
// Inter is BANNED for this brand. Fraunces (serif) does not fit this archetype
// and has been retired.
const archivo = Archivo_Black({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
  weight: ["400"],
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
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
    default: "DropHouse — A landing page on your domain in 30 minutes",
    template: "%s · DropHouse",
  },
  description:
    "Send the brief. DropHouse writes the copy, picks the palette, and pushes the page live to your domain — with a real Next.js repo, real analytics, and a real Let’s Encrypt certificate.",
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
    title: "DropHouse — A landing page on your domain in 30 minutes",
    description:
      "Send the brief. We write the copy, pick the palette, and push the page live. This site itself was made by DropHouse in 27 minutes.",
    url: SITE_URL,
    siteName: "DropHouse",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "DropHouse — A landing page on your domain in 30 minutes",
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
      className={`${archivo.variable} ${geist.variable} ${jetbrains.variable}`}
    >
      <body className="font-sans bg-paper text-ink">
        {children}
      </body>
    </html>
  );
}
