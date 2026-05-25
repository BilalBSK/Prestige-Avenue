"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CarCategory, CarStatus } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "../ui/button-variants";
import { DeleteCarButton } from "./delete-car-button";
import { ToggleFeaturedSwitch } from "./toggle-featured-switch";

const STATUS_STYLE: Record<
  CarStatus,
  { label: string; className: string }
> = {
  AVAILABLE: {
    label: "Disponible",
    className:
      "border-[color:var(--admin-success-dim)] bg-[color:var(--admin-success-dim)] text-[color:var(--admin-success)]",
  },
  MAINTENANCE: {
    label: "Maintenance",
    className:
      "border-[color:var(--admin-warn-dim)] bg-[color:var(--admin-warn-dim)] text-[color:var(--admin-warn)]",
  },
  DISABLED: {
    label: "Désactivée",
    className:
      "border-[color:var(--admin-danger-dim)] bg-[color:var(--admin-danger-dim)] text-[color:var(--admin-danger-soft)]",
  },
};

const CATEGORY_LABEL: Record<CarCategory, string> = {
  CITADINE: "Citadine",
  COMPACTE: "Compacte",
  BERLINE: "Berline",
  SUV: "SUV",
  COUPE: "Coupé",
  CABRIOLET: "Cabriolet",
  SPORTIVE: "Sportive",
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

export function CarsListRow({ car, bookingCount }: CarsListRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: car.id });

  const status = STATUS_STYLE[car.status];

  return (
    <tr
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.55 : 1,
      }}
      className="admin-row border-b border-[color:var(--admin-line)] last:border-0"
    >
      <td className="w-8 px-3 py-2.5">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="flex h-6 w-6 cursor-grab items-center justify-center rounded-md text-[color:var(--admin-text-muted)] transition-colors hover:bg-[color:var(--admin-surface)] hover:text-[color:var(--admin-text-soft)] active:cursor-grabbing"
          aria-label="Réordonner"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="5" cy="3" r="1" fill="currentColor" />
            <circle cx="9" cy="3" r="1" fill="currentColor" />
            <circle cx="5" cy="7" r="1" fill="currentColor" />
            <circle cx="9" cy="7" r="1" fill="currentColor" />
            <circle cx="5" cy="11" r="1" fill="currentColor" />
            <circle cx="9" cy="11" r="1" fill="currentColor" />
          </svg>
        </button>
      </td>
      <td className="w-12 px-2 py-2.5">
        <div className="relative aspect-[4/3] w-11 overflow-hidden rounded-md border border-[color:var(--admin-line)] bg-[color:var(--admin-surface)]">
          {car.mainImage && (
            <Image
              src={car.mainImage}
              alt=""
              fill
              sizes="44px"
              className="object-cover"
            />
          )}
        </div>
      </td>
      <td className="px-3 py-2.5">
        <div className="text-[0.875rem] font-medium text-[color:var(--admin-text)]">
          {car.brand} <span className="font-normal text-[color:var(--admin-text-soft)]">{car.model}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[0.75rem] text-[color:var(--admin-text-muted)]">
          {car.trim && <span className="truncate">{car.trim}</span>}
          {car.trim && <span className="text-[color:var(--admin-text-muted)]/50">·</span>}
          <span className="admin-mono">/{car.slug}</span>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <span className="text-[0.8125rem] text-[color:var(--admin-text-soft)]">
          {CATEGORY_LABEL[car.category]}
        </span>
      </td>
      <td className="px-3 py-2.5">
        <span className={`admin-pill border ${status.className}`}>
          <span className="admin-pill-dot" />
          {status.label}
        </span>
      </td>
      <td className="px-3 py-2.5 text-right">
        <div className="admin-tabular text-[0.875rem] text-[color:var(--admin-text)]">
          {Math.round(car.pricePerDay)}
          <span className="ml-0.5 text-[0.75rem] text-[color:var(--admin-text-muted)]">€</span>
        </div>
      </td>
      <td className="px-3 py-2.5 text-right">
        {car.weekendPackagePrice !== null ? (
          <div className="admin-tabular text-[0.875rem] text-[color:var(--admin-text)]">
            {Math.round(car.weekendPackagePrice)}
            <span className="ml-0.5 text-[0.75rem] text-[color:var(--admin-text-muted)]">€</span>
          </div>
        ) : (
          <span className="text-[0.8125rem] text-[color:var(--admin-text-muted)]">—</span>
        )}
      </td>
      <td className="px-3 py-2.5">
        <div className="flex justify-center">
          <ToggleFeaturedSwitch carId={car.id} initial={car.isFeatured} />
        </div>
      </td>
      <td className="w-20 px-3 py-2.5">
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
