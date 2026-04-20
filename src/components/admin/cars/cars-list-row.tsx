"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CarCategory, CarStatus } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "../ui/button-variants";
import { DeleteCarButton } from "./delete-car-button";
import { ToggleFeaturedSwitch } from "./toggle-featured-switch";

const STATUS_STYLE: Record<CarStatus, { label: string; tone: "accent" | "warn" | "danger" }> = {
  AVAILABLE: { label: "Disponible", tone: "accent" },
  MAINTENANCE: { label: "Maintenance", tone: "warn" },
  DISABLED: { label: "Désactivée", tone: "danger" },
};

const TONE_CLASSES: Record<"accent" | "warn" | "danger", string> = {
  accent: "bg-[color:var(--admin-accent)]",
  warn: "bg-[#caa25a]",
  danger: "bg-[color:var(--admin-danger)]",
};

export interface CarRow {
  id: string;
  brand: string;
  model: string;
  trim: string | null;
  slug: string;
  category: CarCategory;
  status: CarStatus;
  mainImage: string;
  pricePerDay: number;
  weekendPackagePrice: number | null;
  isFeatured: boolean;
  bookingCount: number;
}

interface CarsListRowProps {
  car: CarRow;
  index: number;
  bookingCount: number;
}

export function CarsListRow({ car, index, bookingCount }: CarsListRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: car.id });

  const statusStyle = STATUS_STYLE[car.status];

  return (
    <tr
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.55 : 1,
      }}
      className="admin-row group relative border-b border-[color:var(--admin-line)] transition-colors duration-300"
    >
      <td className="w-12 px-3 py-5">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="admin-mono flex h-6 w-6 cursor-grab items-center justify-center text-[color:var(--admin-text-muted)]/60 transition-colors duration-300 hover:text-[color:var(--admin-accent)] active:cursor-grabbing"
          aria-label="Réordonner"
        >
          ⋮⋮
        </button>
      </td>
      <td className="w-14 px-3 py-5">
        <span className="admin-mono admin-tabular text-[0.65rem] tracking-[0.28em] text-[color:var(--admin-text-muted)]">
          {String(index + 1).padStart(2, "0")}
        </span>
      </td>
      <td className="w-20 px-3 py-5">
        <div className="relative aspect-[4/3] w-16 overflow-hidden border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)]">
          {car.mainImage && (
            <Image
              src={car.mainImage}
              alt=""
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              unoptimized
            />
          )}
        </div>
      </td>
      <td className="px-4 py-5">
        <div className="admin-serif text-[1.05rem] leading-tight tracking-tight text-[color:var(--admin-text)]">
          {car.brand}{" "}
          <span className="text-[color:var(--admin-text-muted)]">{car.model}</span>
        </div>
        {car.trim && (
          <div className="mt-0.5 text-[0.78rem] italic text-[color:var(--admin-text-muted)]/80">
            {car.trim}
          </div>
        )}
        <div className="admin-mono mt-1.5 text-[0.6rem] uppercase tracking-[0.28em] text-[color:var(--admin-text-muted)]/60">
          /{car.slug}
        </div>
      </td>
      <td className="px-4 py-5">
        <span className="admin-mono text-[0.65rem] uppercase tracking-[0.3em] text-[color:var(--admin-text-muted)]">
          {car.category}
        </span>
      </td>
      <td className="px-4 py-5">
        <span className="inline-flex items-center gap-2.5">
          <span className={`h-1 w-1 rounded-full ${TONE_CLASSES[statusStyle.tone]}`} />
          <span className="text-[0.82rem] tracking-wide text-[color:var(--admin-text)]">
            {statusStyle.label}
          </span>
        </span>
      </td>
      <td className="px-4 py-5 text-right">
        <div className="admin-mono admin-tabular text-[0.95rem] text-[color:var(--admin-text)]">
          {Math.round(car.pricePerDay)}
          <span className="ml-1 text-[0.62rem] uppercase tracking-[0.2em] text-[color:var(--admin-text-muted)]">
            €/j
          </span>
        </div>
      </td>
      <td className="px-4 py-5 text-right">
        {car.weekendPackagePrice !== null ? (
          <div className="admin-mono admin-tabular text-[0.95rem] text-[color:var(--admin-text)]">
            {Math.round(car.weekendPackagePrice)}
            <span className="ml-1 text-[0.62rem] uppercase tracking-[0.2em] text-[color:var(--admin-text-muted)]">
              €
            </span>
          </div>
        ) : (
          <span className="admin-mono text-[0.7rem] text-[color:var(--admin-text-muted)]/50">
            —
          </span>
        )}
      </td>
      <td className="px-4 py-5">
        <div className="flex justify-center">
          <ToggleFeaturedSwitch carId={car.id} initial={car.isFeatured} />
        </div>
      </td>
      <td className="px-4 py-5">
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/admin/cars/${car.id}/edit`}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Éditer
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
