import { BookingActions } from "@/components/admin/booking-actions";
import { PageHeader, PageMetaItem } from "@/components/admin/ui/page-header";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Select } from "@/components/admin/ui/select";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";

interface AdminBookingsPageProps {
  searchParams: Promise<{
    carId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

const STATUS_STYLE: Record<BookingStatus, string> = {
  PENDING_REVIEW: "bg-[color:var(--admin-warn)]/15 text-[color:var(--admin-warn)]",
  CONFIRMED: "bg-[color:var(--admin-success)]/15 text-[color:var(--admin-success)]",
  IN_PROGRESS: "bg-[color:var(--admin-info)]/15 text-[color:var(--admin-info)]",
  COMPLETED: "bg-[color:var(--admin-info)]/15 text-[color:var(--admin-info)]",
  CANCELLED: "bg-[color:var(--admin-danger)]/15 text-[color:var(--admin-danger)]",
  DECLINED: "bg-[color:var(--admin-danger)]/15 text-[color:var(--admin-danger)]",
};

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING_REVIEW: "À valider",
  CONFIRMED: "Confirmée",
  IN_PROGRESS: "En cours",
  COMPLETED: "Clôturée",
  CANCELLED: "Annulée",
  DECLINED: "Refusée",
};

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Tous les statuts" },
  { value: BookingStatus.PENDING_REVIEW, label: "À valider" },
  { value: BookingStatus.CONFIRMED, label: "Confirmées" },
  { value: BookingStatus.IN_PROGRESS, label: "En cours" },
  { value: BookingStatus.COMPLETED, label: "Clôturées" },
  { value: BookingStatus.CANCELLED, label: "Annulées" },
  { value: BookingStatus.DECLINED, label: "Refusées" },
];

function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date: Date): string {
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatEUR(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function isStatusValue(value: string): value is BookingStatus {
  return (Object.values(BookingStatus) as string[]).includes(value);
}

export default async function AdminBookingsPage({ searchParams }: AdminBookingsPageProps) {
  const params = await searchParams;
  const cars = await prisma.car.findMany({
    select: { id: true, brand: true, model: true },
    orderBy: { brand: "asc" },
  });

  const carOptions = [
    { value: "", label: "Tous les véhicules" },
    ...cars.map((c) => ({ value: c.id, label: `${c.brand} ${c.model}` })),
  ];

  const statusFilter = params.status && isStatusValue(params.status) ? params.status : null;

  const baseWhere = {
    ...(params.carId ? { carId: params.carId } : {}),
    ...(params.startDate || params.endDate
      ? {
          startDate: {
            ...(params.startDate ? { gte: new Date(params.startDate) } : {}),
            ...(params.endDate ? { lte: new Date(params.endDate) } : {}),
          },
        }
      : {}),
  };

  const [pendingReview, otherBookings] = await Promise.all([
    prisma.booking.findMany({
      where: { ...baseWhere, status: BookingStatus.PENDING_REVIEW },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        car: { select: { brand: true, model: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.booking.findMany({
      where: {
        ...baseWhere,
        ...(statusFilter
          ? { status: statusFilter }
          : { status: { not: BookingStatus.PENDING_REVIEW } }),
      },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        car: { select: { brand: true, model: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const showPendingSection =
    !statusFilter || statusFilter === BookingStatus.PENDING_REVIEW;

  const totalCount = pendingReview.length + otherBookings.length;
  const confirmedRevenue = otherBookings
    .filter(
      (b) =>
        b.status === BookingStatus.CONFIRMED ||
        b.status === BookingStatus.IN_PROGRESS ||
        b.status === BookingStatus.COMPLETED,
    )
    .reduce((sum, b) => sum + Number(b.totalPrice), 0);

  return (
    <>
      <PageHeader
        eyebrow="Opérations"
        title="Réservations"
        lede="Validez les demandes entrantes, suivez les locations et clôturez les courses."
        meta={
          <>
            <PageMetaItem label="Demandes à valider" value={pendingReview.length} />
            <PageMetaItem label="Total affiché" value={totalCount} />
            <PageMetaItem label="Revenu confirmé" value={formatEUR(confirmedRevenue)} />
          </>
        }
      />

      <form className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
        <Select name="carId" defaultValue={params.carId ?? ""} options={carOptions} />
        <Select
          name="status"
          defaultValue={params.status ?? ""}
          options={STATUS_FILTER_OPTIONS}
        />
        <Input type="date" name="startDate" defaultValue={params.startDate ?? ""} />
        <Input type="date" name="endDate" defaultValue={params.endDate ?? ""} />
        <Button type="submit" variant="secondary" size="md">
          Filtrer
        </Button>
      </form>

      {showPendingSection && pendingReview.length > 0 && (
        <section className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--admin-warn)]" />
            <h2 className="text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--admin-text)]">
              Demandes en attente de validation
            </h2>
            <span className="text-[0.75rem] text-[color:var(--admin-text-muted)]">
              · {pendingReview.length}
            </span>
          </div>

          <div className="overflow-hidden rounded-lg border border-[color:var(--admin-warn)]/30 bg-[color:var(--admin-warn-dim)]/40">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[color:var(--admin-line-strong)]">
                    <th className="px-4 py-2.5 text-[0.75rem] font-medium text-[color:var(--admin-text-muted)]">
                      Demande
                    </th>
                    <th className="px-4 py-2.5 text-[0.75rem] font-medium text-[color:var(--admin-text-muted)]">
                      Client
                    </th>
                    <th className="px-4 py-2.5 text-[0.75rem] font-medium text-[color:var(--admin-text-muted)]">
                      Véhicule
                    </th>
                    <th className="px-4 py-2.5 text-[0.75rem] font-medium text-[color:var(--admin-text-muted)]">
                      Période
                    </th>
                    <th className="px-4 py-2.5 text-right text-[0.75rem] font-medium text-[color:var(--admin-text-muted)]">
                      Montant
                    </th>
                    <th className="px-4 py-2.5 text-right text-[0.75rem] font-medium text-[color:var(--admin-text-muted)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingReview.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-[color:var(--admin-line)] last:border-0"
                    >
                      <td className="px-4 py-3 align-top">
                        <div className="admin-tabular text-[0.75rem] text-[color:var(--admin-text-muted)]">
                          {formatDateTime(booking.createdAt)}
                        </div>
                        <div className="admin-mono text-[0.6875rem] text-[color:var(--admin-text-muted)]">
                          #{booking.id.slice(-8).toUpperCase()}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="text-[0.8125rem] font-medium text-[color:var(--admin-text)]">
                          {booking.user.name}
                        </div>
                        <div className="text-[0.75rem] text-[color:var(--admin-text-muted)]">
                          {booking.user.email}
                        </div>
                        {booking.user.phone && (
                          <div className="admin-tabular text-[0.75rem] text-[color:var(--admin-text-muted)]">
                            {booking.user.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top text-[0.8125rem] text-[color:var(--admin-text)]">
                        {booking.car.brand} {booking.car.model}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="admin-tabular text-[0.8125rem] text-[color:var(--admin-text)]">
                          {formatDate(booking.startDate)}
                        </div>
                        <div className="admin-tabular text-[0.75rem] text-[color:var(--admin-text-muted)]">
                          → {formatDate(booking.endDate)}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-right">
                        <div className="admin-tabular text-[0.875rem] font-medium text-[color:var(--admin-text)]">
                          {formatEUR(Number(booking.totalPrice))}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex justify-end">
                          <BookingActions
                            bookingId={booking.id}
                            status={booking.status}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pendingReview.some((b) => b.customerMessage) && (
              <div className="border-t border-[color:var(--admin-line)] bg-[color:var(--admin-surface)] px-4 py-3">
                <p className="text-[0.6875rem] uppercase tracking-[0.08em] text-[color:var(--admin-text-muted)]">
                  Messages clients
                </p>
                <ul className="mt-2 space-y-2">
                  {pendingReview
                    .filter((b) => b.customerMessage)
                    .map((b) => (
                      <li key={b.id} className="text-[0.8125rem]">
                        <span className="admin-mono text-[0.6875rem] text-[color:var(--admin-text-muted)]">
                          #{b.id.slice(-8).toUpperCase()}
                        </span>
                        <span className="ml-2 text-[color:var(--admin-text-soft)]">
                          « {b.customerMessage} »
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      <div className="overflow-hidden rounded-lg border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)]">
        {otherBookings.length === 0 && (statusFilter || pendingReview.length === 0) ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--admin-surface)]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                aria-hidden
                className="text-[color:var(--admin-text-muted)]"
              >
                <rect
                  x="3"
                  y="4"
                  width="12"
                  height="11"
                  rx="1.5"
                  stroke="currentColor"
                  strokeWidth="1.25"
                />
                <path
                  d="M6 3V5M12 3V5M3 8H15"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="text-[0.875rem] font-medium text-[color:var(--admin-text)]">
              Aucune réservation
            </p>
            <p className="text-[0.8125rem] text-[color:var(--admin-text-muted)]">
              Modifiez les filtres pour élargir la recherche.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[color:var(--admin-line-strong)]">
                  <th className="px-4 py-2.5 text-[0.75rem] font-medium text-[color:var(--admin-text-muted)]">
                    Client
                  </th>
                  <th className="px-4 py-2.5 text-[0.75rem] font-medium text-[color:var(--admin-text-muted)]">
                    Véhicule
                  </th>
                  <th className="px-4 py-2.5 text-[0.75rem] font-medium text-[color:var(--admin-text-muted)]">
                    Période
                  </th>
                  <th className="px-4 py-2.5 text-right text-[0.75rem] font-medium text-[color:var(--admin-text-muted)]">
                    Montant
                  </th>
                  <th className="px-4 py-2.5 text-[0.75rem] font-medium text-[color:var(--admin-text-muted)]">
                    Statut
                  </th>
                  <th className="px-4 py-2.5 text-right text-[0.75rem] font-medium text-[color:var(--admin-text-muted)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {otherBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-[color:var(--admin-line)] last:border-0 hover:bg-[color:var(--admin-surface)]/40"
                  >
                    <td className="px-4 py-3 align-top">
                      <div className="text-[0.8125rem] font-medium text-[color:var(--admin-text)]">
                        {booking.user.name}
                      </div>
                      <div className="text-[0.75rem] text-[color:var(--admin-text-muted)]">
                        {booking.user.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-[0.8125rem] text-[color:var(--admin-text)]">
                      {booking.car.brand} {booking.car.model}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="admin-tabular text-[0.8125rem] text-[color:var(--admin-text)]">
                        {formatDate(booking.startDate)}
                      </div>
                      <div className="admin-tabular text-[0.75rem] text-[color:var(--admin-text-muted)]">
                        → {formatDate(booking.endDate)}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <div className="admin-tabular text-[0.8125rem] font-medium text-[color:var(--admin-text)]">
                        {formatEUR(Number(booking.totalPrice))}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className={`admin-pill ${STATUS_STYLE[booking.status]}`}>
                        {STATUS_LABEL[booking.status]}
                      </span>
                      {booking.status === BookingStatus.DECLINED && booking.declineReason && (
                        <div className="mt-1 text-[0.6875rem] italic text-[color:var(--admin-text-muted)]">
                          {booking.declineReason}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex justify-end">
                        <BookingActions
                          bookingId={booking.id}
                          status={booking.status}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
