import { getAdminDashboardMetrics } from "@/services/admin.service";

export default async function AdminDashboardPage() {
  const metrics = await getAdminDashboardMetrics();

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm text-zinc-400">Reservations du mois</p>
          <p className="mt-2 text-2xl font-semibold text-white">{metrics.bookingsThisMonth}</p>
        </article>
        <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm text-zinc-400">Acomptes encaisses (mois)</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {Number(metrics.monthlyRevenue).toFixed(2)} EUR
          </p>
        </article>
        <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm text-zinc-400">Reservations a venir</p>
          <p className="mt-2 text-2xl font-semibold text-white">{metrics.upcomingBookings}</p>
        </article>
        <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-sm text-zinc-400">Taux occupation</p>
          <p className="mt-2 text-2xl font-semibold text-white">{metrics.occupationRate}%</p>
        </article>
      </div>
    </section>
  );
}
