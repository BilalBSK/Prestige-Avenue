"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin/dashboard", label: "Tableau de bord", index: "01" },
  { href: "/admin/cars", label: "Flotte", index: "02" },
  { href: "/admin/bookings", label: "Réservations", index: "03" },
  { href: "/admin/clients", label: "Clientèle", index: "04" },
  { href: "/admin/blocked-dates", label: "Indisponibilités", index: "05" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="relative z-10 hidden w-72 shrink-0 border-r border-[color:var(--admin-line)] bg-[color:var(--admin-bg-elev)]/80 lg:flex lg:flex-col">
      <div className="flex h-20 items-center border-b border-[color:var(--admin-line-soft)] px-7">
        <Link
          href="/admin/dashboard"
          className="group flex flex-col leading-none"
        >
          <span className="admin-serif text-[1.45rem] font-normal tracking-tight text-[color:var(--admin-text)]">
            Prestige Avenue
          </span>
          <span className="mt-1 text-[0.6rem] uppercase tracking-[0.28em] text-[color:var(--admin-text-muted)] transition-colors group-hover:text-[color:var(--admin-accent)]">
            Direction
          </span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-5">
        <p className="mb-4 px-3 text-[0.6rem] uppercase tracking-[0.3em] text-[color:var(--admin-text-muted)]">
          Menu
        </p>
        {LINKS.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`group relative flex items-center justify-between rounded-none border-l-2 px-5 py-3 transition-all duration-300 ease-out ${
                active
                  ? "border-[color:var(--admin-accent)] bg-[color:var(--admin-accent-dim)] text-[color:var(--admin-text)]"
                  : "border-transparent text-[color:var(--admin-text-soft)] hover:border-[color:var(--admin-accent)]/40 hover:bg-[color:var(--admin-surface)]/40 hover:text-[color:var(--admin-text)]"
              }`}
            >
              <span className="flex items-center gap-4">
                <span
                  className={`admin-mono text-[0.65rem] transition-colors ${
                    active ? "text-[color:var(--admin-accent)]" : "text-[color:var(--admin-text-muted)] group-hover:text-[color:var(--admin-accent)]/70"
                  }`}
                >
                  {link.index}
                </span>
                <span className="text-[0.9rem] tracking-wide">{link.label}</span>
              </span>
              {active && (
                <span className="h-1 w-1 rounded-full bg-[color:var(--admin-accent)]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[color:var(--admin-line-soft)] px-7 py-5">
        <p className="text-[0.6rem] uppercase tracking-[0.28em] text-[color:var(--admin-text-muted)]">
          Session sécurisée
        </p>
        <p className="admin-mono mt-2 text-[0.7rem] text-[color:var(--admin-text-soft)]">
          · Chiffrement actif
        </p>
      </div>
    </aside>
  );
}
