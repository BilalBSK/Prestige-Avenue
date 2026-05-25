import { PageHeader } from "@/components/admin/ui/page-header";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

interface Metric {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  hint: string;
}

const METRICS: Metric[] = [
  {
    label: "Chiffre d'affaires",
    value: "—",
    hint: "30 derniers jours",
    trend: "neutral",
  },
  {
    label: "Taux d'occupation",
    value: "—",
    hint: "Moyenne sur la flotte",
    trend: "neutral",
  },
  {
    label: "Réservations à venir",
    value: "—",
    hint: "Confirmées · 30 j",
    trend: "neutral",
  },
  {
    label: "Panier moyen",
    value: "—",
    hint: "Valeur par séjour",
    trend: "neutral",
  },
];

interface Shortcut {
  title: string;
  description: string;
  href: string;
  disabled?: boolean;
}

const SHORTCUTS: Shortcut[] = [
  {
    title: "Flotte",
    description: "Ajouter, éditer et réordonner les véhicules du catalogue.",
    href: "/admin/cars",
  },
  {
    title: "Réservations",
    description: "Suivre, confirmer ou rembourser les locations en cours.",
    href: "/admin/bookings",
  },
  {
    title: "Clients",
    description: "Consulter l'historique et les informations de vos clients.",
    href: "/admin/clients",
  },
  {
    title: "Indisponibilités",
    description: "Bloquer des périodes pour maintenance ou usage interne.",
    href: "/admin/blocked-dates",
  },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const firstName = session?.user?.name?.split(" ")[0] ?? "Admin";
  const now = new Date();
  const formattedDate = now.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <PageHeader
        eyebrow={formattedDate}
        title={`Bonjour, ${firstName}`}
        lede="Vue d'ensemble de l'activité de votre flotte."
      />

      <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)] p-4"
          >
            <p className="text-[0.8125rem] text-[color:var(--admin-text-muted)]">
              {metric.label}
            </p>
            <p className="admin-tabular mt-2 text-[1.5rem] font-semibold tracking-tight text-[color:var(--admin-text)]">
              {metric.value}
            </p>
            <p className="mt-1 text-[0.75rem] text-[color:var(--admin-text-muted)]">
              {metric.hint}
            </p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[0.9375rem] font-semibold text-[color:var(--admin-text)]">
            Accès rapides
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SHORTCUTS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-lg border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)] p-4 transition-colors hover:border-[color:var(--admin-line-strong)] hover:bg-[color:var(--admin-surface)]"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-[0.875rem] font-semibold text-[color:var(--admin-text)]">
                  {item.title}
                </h3>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden
                  className="text-[color:var(--admin-text-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[color:var(--admin-accent)]"
                >
                  <path d="M4 3L8 7L4 11M10 3V11" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-[color:var(--admin-text-soft)]">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
