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
        <main className="flex-1 pt-20 md:pt-24">{children}</main>
        {footer}
      </div>
    </>
  );
}
