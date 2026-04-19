"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Car, CarStatus } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { DeleteCarButton } from "./delete-car-button";
import { ToggleFeaturedSwitch } from "./toggle-featured-switch";

const STATUS_STYLE: Record<CarStatus, { label: string; dot: string }> = {
  AVAILABLE: { label: "Disponible", dot: "bg-emerald-500" },
  MAINTENANCE: { label: "Maintenance", dot: "bg-amber-500" },
  DISABLED: { label: "Désactivée", dot: "bg-red-500" },
};

interface CarsListRowProps {
  car: Car;
  bookingCount: number;
}

export function CarsListRow({ car, bookingCount }: CarsListRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: car.id });

  const statusStyle = STATUS_STYLE[car.status];

  return (
    <tr
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
      className="border-b border-zinc-800 hover:bg-zinc-900/50"
    >
      <td className="w-10 px-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab text-zinc-500 hover:text-zinc-200"
          aria-label="Réordonner"
        >
          ⋮⋮
        </button>
      </td>
      <td className="w-16 px-2 py-3">
        <div className="relative h-12 w-12 overflow-hidden rounded-md bg-zinc-900">
          {car.mainImage && (
            <Image src={car.mainImage} alt="" fill className="object-cover" unoptimized />
          )}
        </div>
      </td>
      <td className="px-3 py-3">
        <div className="font-medium text-zinc-100">
          {car.brand} {car.model}
          {car.trim ? ` — ${car.trim}` : ""}
        </div>
        <div className="text-xs text-zinc-500">{car.slug}</div>
      </td>
      <td className="px-3 py-3 text-xs uppercase tracking-wide text-zinc-400">
        {car.category}
      </td>
      <td className="px-3 py-3">
        <span className="inline-flex items-center gap-1.5 text-xs text-zinc-300">
          <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
          {statusStyle.label}
        </span>
      </td>
      <td className="px-3 py-3 text-right tabular-nums text-zinc-200">
        {Number(car.pricePerDay).toFixed(2)} €
      </td>
      <td className="px-3 py-3 text-right tabular-nums text-zinc-200">
        {car.weekendPackagePrice ? `${Number(car.weekendPackagePrice).toFixed(0)} €` : "—"}
      </td>
      <td className="px-3 py-3 text-center">
        <ToggleFeaturedSwitch carId={car.id} initial={car.isFeatured} />
      </td>
      <td className="px-3 py-3">
        <div className="flex justify-end gap-1">
          <Link href={`/admin/cars/${car.id}/edit`}>
            <Button variant="secondary" size="sm">
              Éditer
            </Button>
          </Link>
          <DeleteCarButton
            carId={car.id}
            carLabel={`${car.brand} ${car.model}`}
            hasBookings={bookingCount > 0}
          />
        </div>
      </td>
    </tr>
  );
}
