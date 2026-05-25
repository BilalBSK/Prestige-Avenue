import { PageHeader, PageMetaItem } from "@/components/admin/ui/page-header";
import { prisma } from "@/lib/prisma";

function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

export default async function AdminClientsPage() {
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    include: {
      bookings: {
        orderBy: { createdAt: "desc" },
        take: 3,
        include: {
          car: { select: { brand: true, model: true } },
        },
      },
      _count: {
        select: { bookings: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalBookings = users.reduce((sum, u) => sum + u._count.bookings, 0);

  return (
    <>
      <PageHeader
        eyebrow="CRM"
        title="Clients"
        lede="Consultez l'historique et les informations de vos clients."
        meta={
          <>
            <PageMetaItem label="Clients" value={users.length} />
            <PageMetaItem label="Réservations" value={totalBookings} />
          </>
        }
      />

      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)] py-12 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--admin-surface)]">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden className="text-[color:var(--admin-text-muted)]">
              <circle cx="9" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.25" />
              <path d="M3 15C3 12.5 5.5 11 9 11C12.5 11 15 12.5 15 15" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-[0.875rem] font-medium text-[color:var(--admin-text)]">
            Aucun client
          </p>
          <p className="text-[0.8125rem] text-[color:var(--admin-text-muted)]">
            Les clients apparaîtront ici après leur première réservation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {users.map((user) => (
            <article
              key={user.id}
              className="rounded-lg border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--admin-accent)]/15 text-[0.75rem] font-semibold text-[color:var(--admin-accent)]">
                    {getInitials(user.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[0.875rem] font-medium text-[color:var(--admin-text)]">
                      {user.name}
                    </p>
                    <p className="truncate text-[0.75rem] text-[color:var(--admin-text-muted)]">
                      {user.email}
                    </p>
                    {user.phone && (
                      <p className="admin-tabular truncate text-[0.75rem] text-[color:var(--admin-text-muted)]">
                        {user.phone}
                      </p>
                    )}
                  </div>
                </div>
                <span className="admin-pill bg-[color:var(--admin-surface)] text-[color:var(--admin-text-soft)]">
                  {user._count.bookings} · rés.
                </span>
              </div>

              {user.bookings.length > 0 && (
                <ul className="mt-3 space-y-1 border-t border-[color:var(--admin-line)] pt-3">
                  {user.bookings.map((booking) => (
                    <li
                      key={booking.id}
                      className="flex items-center justify-between gap-2 text-[0.75rem]"
                    >
                      <span className="truncate text-[color:var(--admin-text-soft)]">
                        {booking.car.brand} {booking.car.model}
                      </span>
                      <span className="admin-tabular shrink-0 text-[color:var(--admin-text-muted)]">
                        {formatDate(booking.startDate)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
