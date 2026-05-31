"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface PublicChromeProps {
  header: ReactNode;
  footer: ReactNode;
  decoration: ReactNode;
  children: ReactNode;
}

export function PublicChrome({ header, footer, decoration, children }: PublicChromeProps) {
  const pathname = usePathname() ?? "";
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      {decoration}
      <div className="flex min-h-screen flex-col">
        {header}
        {/* min-h-screen reserves a full viewport for the content area so the
            persistent footer can never ride up into view while a route is
            loading (empty <main>) — it stays below the fold and the page no
            longer "loads the footer first, then jumps". Pure layout, no JS;
            on tall pages it is a no-op (flex-1 still grows past it). */}
        <main className="min-h-screen flex-1 pt-20 md:pt-24">{children}</main>
        {footer}
      </div>
    </>
  );
}
