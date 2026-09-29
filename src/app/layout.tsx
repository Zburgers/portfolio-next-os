import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { profile } from "@/lib/profile";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
