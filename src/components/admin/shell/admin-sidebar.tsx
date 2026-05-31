"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import { AdminViewSiteFooter } from "./admin-view-site";

type IconProps = SVGProps<SVGSVGElement>;

function IconDashboard(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}
function IconCars(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 17H3v-4l2-5h14l2 5v4h-2" />
      <circle cx="7.5" cy="17.5" r="2" />
      <circle cx="16.5" cy="17.5" r="2" />
    </svg>
  );
}
function IconBookings(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}
function IconClients(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  );
}
function IconBlocked(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m5.5 5.5 13 13" />
    </svg>
  );
}
function IconCollaborations(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m4 16 4-3 3.5 2.5L16 11l4 3.5" />
    </svg>
  );
}

interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<IconProps>;
}

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin/dashboard", label: "Tableau de bord", icon: IconDashboard },
  { href: "/admin/cars", label: "Flotte", icon: IconCars },
  { href: "/admin/collaborations", label: "Collaborations", icon: IconCollaborations },
  { href: "/admin/bookings", label: "Réservations", icon: IconBookings },
  { href: "/admin/clients", label: "Clients", icon: IconClients },
  { href: "/admin/blocked-dates", label: "Indisponibilités", icon: IconBlocked },
];

export function AdminBrand() {
  return (
    <Link
      href="/admin/dashboard"
      className="flex items-center gap-2.5 text-[color:var(--admin-text)]"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[color:var(--admin-accent)] text-[0.78rem] font-semibold text-black">
        PA
      </span>
      <span className="text-[0.9rem] font-semibold tracking-tight">Prestige</span>
    </Link>
  );
}

export function AdminNavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
      {ADMIN_NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`group flex items-center gap-3 rounded-md px-3 py-2 text-[0.8125rem] font-medium transition-colors ${
              active
                ? "bg-[color:var(--admin-surface-2)] text-[color:var(--admin-text)]"
                : "text-[color:var(--admin-text-soft)] hover:bg-[color:var(--admin-surface)] hover:text-[color:var(--admin-text)]"
            }`}
          >
            <Icon
              className={`h-4 w-4 shrink-0 transition-colors ${
                active ? "text-[color:var(--admin-accent)]" : "text-[color:var(--admin-text-muted)] group-hover:text-[color:var(--admin-text-soft)]"
              }`}
              aria-hidden
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-[color:var(--admin-line)] bg-[color:var(--admin-bg-elev)] lg:flex lg:flex-col">
      <div className="flex h-14 items-center border-b border-[color:var(--admin-line)] px-5">
        <AdminBrand />
      </div>
      <AdminNavList />
      <AdminViewSiteFooter />
    </aside>
  );
}
