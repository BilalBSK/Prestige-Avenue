import Link from "next/link";
import type { SVGProps } from "react";

/** Open-in-new icon — signals the public site opens in a separate tab. */
function IconExternal(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

/**
 * Compact top-bar action: collapses to an icon-only square on mobile, expands
 * to icon + label from `sm`. Opens the public site in a new tab so the admin
 * keeps their place in the back-office while previewing.
 */
export function AdminViewSiteButton() {
  return (
    <Link
      href="/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Voir le site (nouvel onglet)"
      title="Voir le site"
      className="flex h-9 w-9 items-center justify-center gap-2 rounded-md border border-[color:var(--admin-line-strong)] text-[0.8125rem] font-medium text-[color:var(--admin-text-soft)] transition-colors hover:bg-[color:var(--admin-surface)] hover:text-[color:var(--admin-text)] sm:w-auto sm:px-3"
    >
      <IconExternal className="h-4 w-4 shrink-0" />
      <span className="hidden sm:inline">Voir le site</span>
    </Link>
  );
}

/**
 * Sidebar / mobile-drawer footer link. Styled to match the nav items above it,
 * separated by a hairline and pinned to the bottom by the nav's `flex-1`.
 */
export function AdminViewSiteFooter({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="border-t border-[color:var(--admin-line)] px-3 py-3">
      <Link
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
        className="group flex items-center gap-3 rounded-md px-3 py-2 text-[0.8125rem] font-medium text-[color:var(--admin-text-soft)] transition-colors hover:bg-[color:var(--admin-surface)] hover:text-[color:var(--admin-text)]"
      >
        <IconExternal className="h-4 w-4 shrink-0 text-[color:var(--admin-text-muted)] transition-colors group-hover:text-[color:var(--admin-text-soft)]" />
        <span>Voir le site</span>
      </Link>
    </div>
  );
}
