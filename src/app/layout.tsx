import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { profile } from "@/lib/profile";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://portfolio-next-os.vercel.app";
const siteTitle = `${profile.name} — ${profile.title}`;
const description = `${profile.name} is a ${profile.title} in ${profile.location}. ${profile.summary}`;

export const metadata: Metadata = {
  title: {
    default: siteTitle,
    template: "%s | Nakshatra Kundlas",
  },
  description,
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Nakshatra Kundlas",
    title: siteTitle,
    description,
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description,
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
