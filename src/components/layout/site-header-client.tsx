"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export interface SiteHeaderClientProps {
  isAdmin: boolean;
}

export function SiteHeaderClient({ isAdmin }: SiteHeaderClientProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b backdrop-blur-md transition-[height,background-color,border-color] duration-[350ms] ease-out ${
        scrolled
          ? "h-16 border-[var(--ink-line)] bg-[rgba(5,5,5,0.85)]"
          : "h-20 border-transparent bg-[rgba(5,5,5,0.4)]"
      }`}
    >
      <div className="lux-container flex h-full items-center justify-between">
        <Link
          href="/"
          className="font-[family:var(--font-fraunces)] text-[22px] font-light leading-none tracking-[-0.01em] text-[var(--ink-ivory)] transition-opacity duration-200 hover:opacity-80 md:text-[26px]"
        >
          Prestige <em className="font-normal italic">Avenue</em>
        </Link>
        <nav className="flex items-center gap-7 font-[family:var(--font-dm-sans)] text-[13px] text-[var(--ink-text-soft)]">
          <Link
            href="/cars"
            className="transition-colors duration-200 hover:text-[var(--ink-ivory)]"
          >
            Catalogue
          </Link>
          {isAdmin ? (
            <Link
              href="/admin/dashboard"
              className="transition-colors duration-200 hover:text-[var(--ink-ivory)]"
            >
              Admin
            </Link>
          ) : (
            <Link
              href="/admin/login"
              className="transition-colors duration-200 hover:text-[var(--ink-ivory)]"
            >
              Accès admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
