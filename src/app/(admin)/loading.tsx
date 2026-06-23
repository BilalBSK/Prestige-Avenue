// Skeleton affiché pendant le chargement serveur d'une page admin (Suspense).
// Calqué sur la structure réelle (en-tête + bandeau de stats + grille) pour que
// la transition se lise comme « le contenu arrive » plutôt que comme un gel.
// Pur CSS, aucun JS — la classe `.admin-skeleton` porte le shimmer du thème.
export default function AdminLoading() {
  return (
    <div className="admin-fade-in" aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement…</span>

      {/* En-tête : eyebrow, titre, sous-titre */}
      <div className="mb-6">
        <div className="admin-skeleton h-3 w-24" />
        <div className="admin-skeleton mt-3 h-7 w-64 max-w-[70%]" />
        <div className="admin-skeleton mt-3 h-3.5 w-96 max-w-[85%]" />
      </div>

      {/* Bandeau de cartes (stats / accès rapides) */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)] p-4"
          >
            <div className="admin-skeleton h-3 w-20" />
            <div className="admin-skeleton mt-3 h-6 w-16" />
            <div className="admin-skeleton mt-2 h-2.5 w-24" />
          </div>
        ))}
      </div>

      {/* Bloc de contenu principal (liste / tableau) */}
      <div className="overflow-hidden rounded-lg border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)]">
        <div className="border-b border-[color:var(--admin-line)] px-4 py-3">
          <div className="admin-skeleton h-3.5 w-40" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-[color:var(--admin-line)] px-4 py-3.5 last:border-0"
          >
            <div className="admin-skeleton h-9 w-9 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <div className="admin-skeleton h-3.5 w-1/3" />
              <div className="admin-skeleton mt-2 h-2.5 w-1/4" />
            </div>
            <div className="admin-skeleton hidden h-3.5 w-24 sm:block" />
            <div className="admin-skeleton h-7 w-20 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
