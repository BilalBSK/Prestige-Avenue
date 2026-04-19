import { BlockDateForm } from "@/components/admin/block-date-form";
import { BlockedDateDeleteButton } from "@/components/admin/blocked-date-delete-button";
import { prisma } from "@/lib/prisma";

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
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Gestion blocage dates</h2>
      <BlockDateForm cars={cars} />

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <h3 className="mb-3 text-lg font-semibold text-white">Periodes bloquees</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-zinc-400">
              <tr>
                <th className="px-2 py-2">Voiture</th>
                <th className="px-2 py-2">Debut</th>
                <th className="px-2 py-2">Fin</th>
                <th className="px-2 py-2">Raison</th>
                <th className="px-2 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {blockedDates.map((blockedDate) => (
                <tr key={blockedDate.id} className="border-t border-zinc-800 text-zinc-200">
                  <td className="px-2 py-3">
                    {blockedDate.car.brand} {blockedDate.car.model}
                  </td>
                  <td className="px-2 py-3">{blockedDate.startDate.toISOString().slice(0, 10)}</td>
                  <td className="px-2 py-3">{blockedDate.endDate.toISOString().slice(0, 10)}</td>
                  <td className="px-2 py-3">{blockedDate.reason}</td>
                  <td className="px-2 py-3">
                    <BlockedDateDeleteButton blockedDateId={blockedDate.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
