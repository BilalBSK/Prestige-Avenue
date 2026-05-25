import { BlockDateForm } from "@/components/admin/block-date-form";
import { BlockedDateDeleteButton } from "@/components/admin/blocked-date-delete-button";
import { PageHeader, PageMetaItem } from "@/components/admin/ui/page-header";
import { prisma } from "@/lib/prisma";

function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function nightCount(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export default async function AdminBlockedDatesPage() {
  const [cars, blockedDates] = await Promise.all([
    prisma.car.findMany({
      select: { id: true, brand: true, model: true },
      orderBy: { brand: "asc" },
    }),
    prisma.blockedDate.findMany({
      include: {
        car: { select: { brand: true, model: true } },
      },
      orderBy: { startDate: "asc" },
    }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Calendrier"
        title="Indisponibilités"
        lede="Bloquez des périodes pour maintenance ou usage interne."
        meta={<PageMetaItem label="Périodes actives" value={blockedDates.length} />}
      />

      <BlockDateForm cars={cars} />

      <div className="mt-4 overflow-hidden rounded-lg border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)]">
        {blockedDates.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--admin-surface)]">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden className="text-[color:var(--admin-text-muted)]">
                <rect x="3" y="4" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
                <path d="M6 3V5M12 3V5M3 8H15" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                <path d="M7 11.5L11 11.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-[0.875rem] font-medium text-[color:var(--admin-text)]">
              Aucune période bloquée
            </p>
            <p className="text-[0.8125rem] text-[color:var(--admin-text-muted)]">
              Utilisez le formulaire ci-dessus pour bloquer un créneau.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[color:var(--admin-line-strong)]">
                  <th className="px-4 py-2.5 text-[0.75rem] font-medium text-[color:var(--admin-text-muted)]">
                    Véhicule
                  </th>
                  <th className="px-4 py-2.5 text-[0.75rem] font-medium text-[color:var(--admin-text-muted)]">
                    Début
                  </th>
                  <th className="px-4 py-2.5 text-[0.75rem] font-medium text-[color:var(--admin-text-muted)]">
                    Fin
                  </th>
                  <th className="px-4 py-2.5 text-right text-[0.75rem] font-medium text-[color:var(--admin-text-muted)]">
                    Durée
                  </th>
                  <th className="px-4 py-2.5 text-[0.75rem] font-medium text-[color:var(--admin-text-muted)]">
                    Raison
                  </th>
                  <th className="px-4 py-2.5 text-right text-[0.75rem] font-medium text-[color:var(--admin-text-muted)]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {blockedDates.map((blockedDate) => {
                  const nights = nightCount(blockedDate.startDate, blockedDate.endDate);
                  return (
                    <tr
                      key={blockedDate.id}
                      className="border-b border-[color:var(--admin-line)] last:border-0 hover:bg-[color:var(--admin-surface)]/40"
                    >
                      <td className="px-4 py-3 text-[0.8125rem] font-medium text-[color:var(--admin-text)]">
                        {blockedDate.car.brand} {blockedDate.car.model}
                      </td>
                      <td className="admin-tabular px-4 py-3 text-[0.8125rem] text-[color:var(--admin-text-soft)]">
                        {formatDate(blockedDate.startDate)}
                      </td>
                      <td className="admin-tabular px-4 py-3 text-[0.8125rem] text-[color:var(--admin-text-soft)]">
                        {formatDate(blockedDate.endDate)}
                      </td>
                      <td className="admin-tabular px-4 py-3 text-right text-[0.8125rem] text-[color:var(--admin-text-muted)]">
                        {nights} {nights > 1 ? "nuits" : "nuit"}
                      </td>
                      <td className="px-4 py-3 text-[0.8125rem] text-[color:var(--admin-text-soft)]">
                        {blockedDate.reason}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <BlockedDateDeleteButton blockedDateId={blockedDate.id} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
