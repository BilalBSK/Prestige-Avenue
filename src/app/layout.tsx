import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { PublicChrome } from "@/components/layout/public-chrome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "opsz"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Prestige Avenue — Location de véhicules de prestige à Rouen",
  description:
    "Location de voitures de luxe à Rouen. Soumettez votre demande en ligne, validation sous 24 h, règlement à la remise des clés.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${dmSans.variable} min-h-screen bg-black text-zinc-100 antialiased`}
      >
        <PublicChrome
          decoration={
            <>
              <SmoothScroll />
              <ScrollProgress />
            </>
          }
          header={<SiteHeader />}
          footer={<SiteFooter />}
        >
          {children}
        </PublicChrome>
      </body>
    </html>
  );
}
