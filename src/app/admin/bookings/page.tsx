import { BookingActions } from "@/components/admin/booking-actions";
import { prisma } from "@/lib/prisma";

interface AdminBookingsPageProps {
  searchParams: Promise<{
    carId?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function AdminBookingsPage({ searchParams }: AdminBookingsPageProps) {
  const params = await searchParams;
  const cars = await prisma.car.findMany({
    select: { id: true, brand: true, model: true },
    orderBy: { brand: "asc" },
  });

  const bookings = await prisma.booking.findMany({
    where: {
      ...(params.carId ? { carId: params.carId } : {}),
      ...(params.startDate || params.endDate
        ? {
            startDate: {
              ...(params.startDate ? { gte: new Date(params.startDate) } : {}),
              ...(params.endDate ? { lte: new Date(params.endDate) } : {}),
            },
          }
        : {}),
    },
    include: {
      user: { select: { name: true, email: true } },
      car: { select: { brand: true, model: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Reservations</h2>
      <form className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4 md:grid-cols-4">
        <select
          name="carId"
          defaultValue={params.carId ?? ""}
          className="rounded-md border border-zinc-700 bg-black px-3 py-2 text-zinc-100"
        >
          <option value="">Toutes les voitures</option>
          {cars.map((car) => (
            <option key={car.id} value={car.id}>
              {car.brand} {car.model}
            </option>
          ))}
        </select>
        <input
          type="date"
          name="startDate"
          defaultValue={params.startDate ?? ""}
          className="rounded-md border border-zinc-700 bg-black px-3 py-2 text-zinc-100"
        />
        <input
          type="date"
          name="endDate"
          defaultValue={params.endDate ?? ""}
          className="rounded-md border border-zinc-700 bg-black px-3 py-2 text-zinc-100"
        />
        <button
          type="submit"
          className="rounded-md bg-amber-500 px-4 py-2 font-medium text-black transition hover:bg-amber-400"
        >
          Filtrer
        </button>
      </form>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-zinc-400">
              <tr>
                <th className="px-2 py-2">Client</th>
                <th className="px-2 py-2">Voiture</th>
                <th className="px-2 py-2">Periode</th>
                <th className="px-2 py-2">Montants</th>
                <th className="px-2 py-2">Statuts</th>
                <th className="px-2 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-t border-zinc-800 text-zinc-200">
                  <td className="px-2 py-3">
                    <div>{booking.user.name}</div>
                    <div className="text-xs text-zinc-500">{booking.user.email}</div>
                  </td>
                  <td className="px-2 py-3">
                    {booking.car.brand} {booking.car.model}
                  </td>
                  <td className="px-2 py-3">
                    {booking.startDate.toISOString().slice(0, 10)} -{" "}
                    {booking.endDate.toISOString().slice(0, 10)}
                  </td>
                  <td className="px-2 py-3">
                    <div>Total: {Number(booking.totalPrice).toFixed(2)} EUR</div>
                    <div className="text-xs text-zinc-400">
                      Acompte: {Number(booking.depositDueNow).toFixed(2)} EUR
                    </div>
                    <div className="text-xs text-zinc-500">
                      Solde: {Number(booking.remainingBalance).toFixed(2)} EUR
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <div>{booking.status}</div>
                    <div className="text-xs text-zinc-500">{booking.paymentStatus}</div>
                  </td>
                  <td className="px-2 py-3">
                    <BookingActions bookingId={booking.id} />
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
