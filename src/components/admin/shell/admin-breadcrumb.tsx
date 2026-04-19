"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LABELS: Record<string, string> = {
  admin: "Direction",
  dashboard: "Tableau de bord",
  cars: "Flotte",
  new: "Nouveau véhicule",
  edit: "Édition",
  bookings: "Réservations",
  clients: "Clientèle",
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
    <nav aria-label="Fil d'Ariane" className="flex items-center gap-3">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-3">
          {i > 0 && (
            <span
              aria-hidden
              className="admin-mono text-[0.65rem] text-[color:var(--admin-text-muted)]/60"
            >
              /
            </span>
          )}
          {crumb.isLast ? (
            <span className="admin-serif text-[0.95rem] font-normal text-[color:var(--admin-text)]">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="text-[0.8rem] uppercase tracking-[0.2em] text-[color:var(--admin-text-muted)] transition-colors hover:text-[color:var(--admin-accent)]"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
