import type { Metadata } from "next";
import { Geist, Geist_Mono, Bodoni_Moda } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ScrollProgress } from "@/components/layout/scroll-progress";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni-moda",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Prestige Avenue - Reservation de vehicules premium",
  description:
    "Plateforme premium de reservation de vehicules de luxe avec paiement securise.",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bodoniModa.variable} min-h-screen bg-black text-zinc-100 antialiased`}
      >
        <ScrollProgress />
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1 pt-20 md:pt-24">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
