import { PageHeader, PageMetaItem } from "@/components/admin/ui/page-header";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const METRICS = [
  {
    index: "01",
    label: "Chiffre d'affaires",
    detail: "Revenus consolidés sur la période en cours",
  },
  {
    index: "02",
    label: "Taux d'occupation",
    detail: "Utilisation moyenne de la flotte, jour par jour",
  },
  {
    index: "03",
    label: "Réservations à venir",
    detail: "Pipeline confirmé sur les 30 prochains jours",
  },
  {
    index: "04",
    label: "Panier moyen",
    detail: "Valeur moyenne d'un séjour premium",
  },
];

const INITIATIVES = [
  {
    chapter: "Chapitre I",
    title: "Pilotage de la flotte",
    body: "Ajoutez, éditez et réordonnez vos véhicules. Chaque fiche est une pièce de votre collection.",
    href: "/admin/cars",
    action: "Ouvrir le catalogue",
  },
  {
    chapter: "Chapitre II",
    title: "Registre des réservations",
    body: "Suivi, édition, remboursements. Prochainement disponible dans votre espace.",
    href: "#",
    action: "Bientôt",
    disabled: true,
  },
  {
    chapter: "Chapitre III",
    title: "Clientèle & fidélisation",
    body: "Vos clients, leur historique, leur préférence. Un carnet d'adresses sur-mesure.",
    href: "#",
    action: "Bientôt",
    disabled: true,
  },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const firstName = session?.user?.name?.split(" ")[0] ?? "Direction";
  const now = new Date();
  const formattedDate = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <PageHeader
        eyebrow="Tableau de bord"
        title={
          <>
            Bonsoir,
            <br />
            <span className="italic text-[color:var(--admin-text-muted)]">{firstName}.</span>
          </>
        }
        lede="L'élégance d'une maison de luxe tient au soin des détails. Voici votre vue d'ensemble."
        meta={
          <>
            <PageMetaItem label="Aujourd'hui" value={formattedDate} />
          </>
        }
      />

      <section className="admin-fade-up admin-fade-up-d1 mb-16">
        <h2 className="admin-mono mb-6 text-[0.6rem] uppercase tracking-[0.36em] text-[color:var(--admin-text-muted)]">
          Indicateurs clés
        </h2>
        <div className="grid gap-0 border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)]/40 md:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((metric, i) => (
            <div
              key={metric.index}
              className={`relative px-7 py-10 ${
                i < METRICS.length - 1 ? "border-b border-[color:var(--admin-line)] md:border-b-0 md:border-r lg:border-b-0" : ""
              } ${i === 1 ? "md:border-r-0 lg:border-r" : ""}`}
            >
              <span className="admin-mono admin-tabular text-[0.62rem] uppercase tracking-[0.32em] text-[color:var(--admin-accent)]">
                {metric.index}
              </span>
              <p className="admin-serif mt-5 text-[1.4rem] font-normal leading-tight tracking-tight text-[color:var(--admin-text)]">
                {metric.label}
              </p>
              <p className="admin-serif mt-3 text-[0.82rem] italic leading-relaxed text-[color:var(--admin-text-muted)]">
                {metric.detail}
              </p>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="admin-serif text-[2.5rem] font-normal leading-none text-[color:var(--admin-text-muted)]/30">
                  —
                </span>
                <span className="admin-mono text-[0.58rem] uppercase tracking-[0.3em] text-[color:var(--admin-text-muted)]/50">
                  à venir
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-fade-up admin-fade-up-d2">
        <h2 className="admin-mono mb-6 text-[0.6rem] uppercase tracking-[0.36em] text-[color:var(--admin-text-muted)]">
          Votre registre
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {INITIATIVES.map((item) => (
            <a
              key={item.chapter}
              href={item.disabled ? undefined : item.href}
              aria-disabled={item.disabled}
              className={`group relative flex flex-col border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)]/40 p-8 transition-all duration-500 ease-out ${
                item.disabled
                  ? "cursor-not-allowed opacity-55"
                  : "hover:-translate-y-0.5 hover:border-[color:var(--admin-accent)]/60 hover:bg-[color:var(--admin-bg-elev)]/70"
              }`}
            >
              <span
                aria-hidden
                className={`absolute left-0 top-0 h-full w-[2px] origin-top scale-y-0 bg-[color:var(--admin-accent)] transition-transform duration-500 ease-out ${
                  !item.disabled ? "group-hover:scale-y-100" : ""
                }`}
              />
              <p className="admin-mono text-[0.58rem] uppercase tracking-[0.36em] text-[color:var(--admin-accent)]">
                {item.chapter}
              </p>
              <h3 className="admin-serif mt-5 text-[1.5rem] font-normal leading-tight tracking-tight text-[color:var(--admin-text)]">
                {item.title}
              </h3>
              <p className="admin-serif mt-4 flex-1 text-[0.88rem] italic leading-relaxed text-[color:var(--admin-text-muted)]">
                {item.body}
              </p>
              <div className="mt-8 flex items-center justify-between border-t border-[color:var(--admin-line)] pt-4">
                <span
                  className={`admin-mono text-[0.6rem] uppercase tracking-[0.28em] ${
                    item.disabled
                      ? "text-[color:var(--admin-text-muted)]/50"
                      : "text-[color:var(--admin-text)] group-hover:text-[color:var(--admin-accent)]"
                  }`}
                >
                  {item.action}
                </span>
                {!item.disabled && (
                  <span
                    aria-hidden
                    className="admin-mono text-[color:var(--admin-text-muted)] transition-all duration-500 ease-out group-hover:translate-x-1 group-hover:text-[color:var(--admin-accent)]"
                  >
                    →
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      </section>

      <div className="admin-fade-up admin-fade-up-d4 mt-20 border-t border-[color:var(--admin-line)] pt-8">
        <p className="admin-mono text-center text-[0.58rem] uppercase tracking-[0.44em] text-[color:var(--admin-text-muted)]/60">
          Prestige Avenue — Direction privée
        </p>
      </div>
    </>
  );
}
