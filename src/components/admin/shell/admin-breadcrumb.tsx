"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LABELS: Record<string, string> = {
  admin: "Admin",
  dashboard: "Tableau de bord",
  cars: "Flotte",
  new: "Nouveau",
  edit: "Édition",
  bookings: "Réservations",
  clients: "Clients",
  "blocked-dates": "Indisponibilités",
};

function humanize(segment: string): string {
  if (LABELS[segment]) return LABELS[segment];
  if (segment.length > 20) return segment.slice(0, 8) + "…" + segment.slice(-4);
  return segment;
}

export function AdminBreadcrumb() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  const crumbs = parts.map((seg, i) => {
    const href = "/" + parts.slice(0, i + 1).join("/");
    return { label: humanize(seg), href, isLast: i === parts.length - 1 };
  });

  return (
    <nav
      aria-label="Fil d'Ariane"
      className="flex min-w-0 items-center gap-2 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex flex-shrink-0 items-center gap-2">
          {i > 0 && (
            <svg
              aria-hidden
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className="text-[color:var(--admin-text-muted)]/60"
            >
              <path d="M4.5 2.5L8 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {crumb.isLast ? (
            <span className="text-[0.8125rem] font-medium text-[color:var(--admin-text)]">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="text-[0.8125rem] text-[color:var(--admin-text-muted)] transition-colors hover:text-[color:var(--admin-text)]"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
