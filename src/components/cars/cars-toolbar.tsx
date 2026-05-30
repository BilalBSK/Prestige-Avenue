"use client";

import { Popover } from "@/components/ui/popover";
import { RangeSlider } from "@/components/ui/range-slider";
import {
  CatalogFiltersState,
  DEFAULT_FILTERS,
  FUEL_OPTIONS,
  PRICE_MAX,
  PRICE_MIN,
  PRICE_STEP,
  SORT_OPTIONS,
  TRANSMISSION_OPTIONS,
  activeFilterCount,
  serializeFiltersToParams,
} from "@/lib/cars/filters";
import type { FuelType, Transmission } from "@prisma/client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

interface CarsToolbarProps {
  initialFilters: CatalogFiltersState;
  brands: string[];
}

export function CarsToolbar({ initialFilters, brands }: CarsToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState<CatalogFiltersState>(initialFilters);
  const [openPopover, setOpenPopover] = useState<null | "price" | "transmission" | "fuel" | "brands" | "sort">(
    null,
  );
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const totalActive = useMemo(() => activeFilterCount(filters), [filters]);

  function pushFilters(next: CatalogFiltersState) {
    const params = serializeFiltersToParams(next);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function update(patch: Partial<CatalogFiltersState>, debounce = false) {
    const next = { ...filters, ...patch };
    setFilters(next);
    if (debounce) {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => pushFilters(next), 300);
    } else {
      pushFilters(next);
    }
  }

  function clearAll() {
    setFilters(DEFAULT_FILTERS);
    router.replace(pathname, { scroll: false });
  }

  const priceLabel =
    filters.minPrice === PRICE_MIN && filters.maxPrice === PRICE_MAX
      ? "Prix"
      : `${filters.minPrice}€ – ${filters.maxPrice === PRICE_MAX ? "800€+" : `${filters.maxPrice}€`}`;
  const transmissionLabel = filters.transmission
    ? filters.transmission === "AUTOMATIC"
      ? "Auto"
      : "Manuelle"
    : "Transmission";
  const fuelLabel =
    filters.fuelTypes.length === 0
      ? "Carburant"
      : `Carburant · ${filters.fuelTypes.length}`;
  const brandsLabel = filters.brands.length === 0 ? "Marques" : `Marques · ${filters.brands.length}`;
  const sortLabel = SORT_OPTIONS.find((o) => o.value === filters.sortBy)?.label ?? "Tri";

  return (
    <div className="sticky top-16 z-30 border-y border-[var(--ink-line)] bg-[rgba(5,5,5,0.88)] backdrop-blur-md">
      <div className="lux-container flex flex-wrap items-center justify-between gap-x-4 gap-y-3 py-3 md:h-16 md:flex-nowrap md:py-0">
        {/* Sort dropdown — left */}
        <Popover
          open={openPopover === "sort"}
          onClose={() => setOpenPopover(null)}
          align="left"
          trigger={
            <button
              type="button"
              onClick={() => setOpenPopover(openPopover === "sort" ? null : "sort")}
              className="font-[family:var(--font-dm-sans)] text-[12px] uppercase tracking-[0.16em] text-[var(--ink-text-soft)] transition-colors duration-200 hover:text-[var(--ink-ivory)]"
            >
              Tri · <em className="font-[family:var(--font-fraunces)] not-italic text-[var(--ink-ivory)]">{sortLabel}</em>
            </button>
          }
          className="min-w-[200px] border border-[var(--ink-line)] bg-[var(--ink-elevated)] py-2 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.85)]"
        >
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                update({ sortBy: opt.value });
                setOpenPopover(null);
              }}
              className={`block w-full px-4 py-2 text-left font-[family:var(--font-dm-sans)] text-[13px] transition-colors duration-150 hover:bg-[var(--ink-surface)] ${
                filters.sortBy === opt.value
                  ? "text-[var(--ink-ivory)]"
                  : "text-[var(--ink-text-soft)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </Popover>

        {/* Filter pills — center */}
        <div className="order-last flex w-full flex-wrap items-center gap-2 md:order-none md:w-auto md:flex-nowrap">
          <FilterPill
            label={priceLabel}
            active={filters.minPrice !== PRICE_MIN || filters.maxPrice !== PRICE_MAX}
            open={openPopover === "price"}
            onToggle={() => setOpenPopover(openPopover === "price" ? null : "price")}
            popoverContent={
              <PricePanel
                value={[filters.minPrice, filters.maxPrice]}
                onChange={(v) => update({ minPrice: v[0], maxPrice: v[1] }, true)}
              />
            }
            popoverOpen={openPopover === "price"}
            popoverClose={() => setOpenPopover(null)}
          />
          <FilterPill
            label={transmissionLabel}
            active={!!filters.transmission}
            open={openPopover === "transmission"}
            onToggle={() => setOpenPopover(openPopover === "transmission" ? null : "transmission")}
            popoverContent={
              <TransmissionPanel
                value={filters.transmission}
                onChange={(v) => {
                  update({ transmission: v });
                  setOpenPopover(null);
                }}
              />
            }
            popoverOpen={openPopover === "transmission"}
            popoverClose={() => setOpenPopover(null)}
          />
          <FilterPill
            label={fuelLabel}
            active={filters.fuelTypes.length > 0}
            open={openPopover === "fuel"}
            onToggle={() => setOpenPopover(openPopover === "fuel" ? null : "fuel")}
            popoverContent={
              <FuelPanel
                value={filters.fuelTypes}
                onChange={(v) => update({ fuelTypes: v })}
              />
            }
            popoverOpen={openPopover === "fuel"}
            popoverClose={() => setOpenPopover(null)}
          />
          <FilterPill
            label={brandsLabel}
            active={filters.brands.length > 0}
            open={openPopover === "brands"}
            onToggle={() => setOpenPopover(openPopover === "brands" ? null : "brands")}
            popoverContent={
              <BrandsPanel
                brands={brands}
                value={filters.brands}
                onChange={(v) => update({ brands: v })}
              />
            }
            popoverOpen={openPopover === "brands"}
            popoverClose={() => setOpenPopover(null)}
          />
        </div>

        {/* Clear all — right */}
        <button
          type="button"
          onClick={clearAll}
          disabled={totalActive === 0}
          className="group inline-flex items-center gap-1.5 font-[family:var(--font-fraunces)] text-[14px] italic text-[var(--ink-text-soft)] transition-colors duration-200 hover:text-[var(--ink-ivory)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Tout effacer
          <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
        </button>
      </div>
    </div>
  );
}

interface FilterPillProps {
  label: string;
  active: boolean;
  open: boolean;
  onToggle: () => void;
  popoverContent: React.ReactNode;
  popoverOpen: boolean;
  popoverClose: () => void;
}

function FilterPill({ label, active, open, onToggle, popoverContent, popoverOpen, popoverClose }: FilterPillProps) {
  return (
    <Popover
      open={popoverOpen}
      onClose={popoverClose}
      align="center"
      trigger={
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className={`rounded-full border px-4 py-1.5 font-[family:var(--font-dm-sans)] text-[12px] tracking-[0.04em] transition-colors duration-200 ${
            active
              ? "border-[var(--ink-ivory)] bg-[var(--ink-ivory)] text-[var(--ink-onyx)]"
              : open
                ? "border-[var(--ink-text-soft)] bg-transparent text-[var(--ink-ivory)]"
                : "border-[var(--ink-line-soft)] bg-transparent text-[var(--ink-text-soft)] hover:border-[var(--ink-dim)] hover:text-[var(--ink-ivory)]"
          }`}
        >
          {label}
        </button>
      }
      className="w-[min(320px,calc(100vw-2rem))] border border-[var(--ink-line)] bg-[var(--ink-elevated)] p-5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.85)]"
    >
      {popoverContent}
    </Popover>
  );
}

function PricePanel({
  value,
  onChange,
}: {
  value: [number, number];
  onChange: (v: [number, number]) => void;
}) {
  return (
    <div>
      <h3 className="mb-4 font-[family:var(--font-fraunces)] text-[18px] font-light text-[var(--ink-ivory)]">
        Prix <em className="italic">par jour.</em>
      </h3>
      <RangeSlider
        min={PRICE_MIN}
        max={PRICE_MAX}
        step={PRICE_STEP}
        value={value}
        onChange={onChange}
        formatLabel={(v) => `${v}€${v === PRICE_MAX ? "+" : ""}`}
      />
    </div>
  );
}

function TransmissionPanel({
  value,
  onChange,
}: {
  value: Transmission | null;
  onChange: (v: Transmission | null) => void;
}) {
  return (
    <div>
      <h3 className="mb-4 font-[family:var(--font-fraunces)] text-[18px] font-light text-[var(--ink-ivory)]">
        Transmission.
      </h3>
      <div className="flex flex-wrap gap-2">
        {TRANSMISSION_OPTIONS.map((opt) => {
          const isSelected =
            (opt.value === "ALL" && value === null) || opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value === "ALL" ? null : opt.value)}
              className={`rounded-full border px-4 py-1.5 font-[family:var(--font-dm-sans)] text-[12px] transition-colors duration-200 ${
                isSelected
                  ? "border-[var(--ink-ivory)] bg-[var(--ink-ivory)] text-[var(--ink-onyx)]"
                  : "border-[var(--ink-line-soft)] text-[var(--ink-text-soft)] hover:border-[var(--ink-dim)] hover:text-[var(--ink-ivory)]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FuelPanel({
  value,
  onChange,
}: {
  value: FuelType[];
  onChange: (v: FuelType[]) => void;
}) {
  function toggle(option: FuelType) {
    onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option]);
  }
  return (
    <div>
      <h3 className="mb-4 font-[family:var(--font-fraunces)] text-[18px] font-light text-[var(--ink-ivory)]">
        Carburant.
      </h3>
      <div className="flex flex-wrap gap-2">
        {FUEL_OPTIONS.map((opt) => {
          const isSelected = value.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`rounded-full border px-4 py-1.5 font-[family:var(--font-dm-sans)] text-[12px] transition-colors duration-200 ${
                isSelected
                  ? "border-[var(--ink-ivory)] bg-[var(--ink-ivory)] text-[var(--ink-onyx)]"
                  : "border-[var(--ink-line-soft)] text-[var(--ink-text-soft)] hover:border-[var(--ink-dim)] hover:text-[var(--ink-ivory)]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BrandsPanel({
  brands,
  value,
  onChange,
}: {
  brands: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  function toggle(brand: string) {
    onChange(value.includes(brand) ? value.filter((b) => b !== brand) : [...value, brand]);
  }
  return (
    <div>
      <h3 className="mb-4 font-[family:var(--font-fraunces)] text-[18px] font-light text-[var(--ink-ivory)]">
        Marques.
      </h3>
      <div className="flex max-h-[260px] flex-wrap gap-2 overflow-y-auto pr-1">
        {brands.length === 0 ? (
          <p className="font-[family:var(--font-dm-sans)] text-[12px] text-[var(--ink-text-soft)]">
            Aucune marque disponible.
          </p>
        ) : (
          brands.map((brand) => {
            const isSelected = value.includes(brand);
            return (
              <button
                key={brand}
                type="button"
                onClick={() => toggle(brand)}
                className={`rounded-full border px-3.5 py-1.5 font-[family:var(--font-dm-sans)] text-[12px] transition-colors duration-200 ${
                  isSelected
                    ? "border-[var(--ink-ivory)] bg-[var(--ink-ivory)] text-[var(--ink-onyx)]"
                    : "border-[var(--ink-line-soft)] text-[var(--ink-text-soft)] hover:border-[var(--ink-dim)] hover:text-[var(--ink-ivory)]"
                }`}
              >
                {brand}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
