"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { BookingRequestSheet } from "@/components/booking/booking-request-sheet";

interface BookingSheetContextValue {
  openSheet: () => void;
}

const BookingSheetContext = createContext<BookingSheetContextValue | null>(null);

export function useBookingSheet() {
  const ctx = useContext(BookingSheetContext);
  if (!ctx) throw new Error("useBookingSheet must be used inside BookingSheetProvider");
  return ctx;
}

interface BookingSheetProviderProps {
  children: React.ReactNode;
  carId: string;
  brand: string;
  model: string;
  pricePerDay: number;
  pricePerKm?: number | null;
  weekendPackagePrice: number | null;
}

export function BookingSheetProvider({
  children,
  carId,
  brand,
  model,
  pricePerDay,
  pricePerKm = null,
  weekendPackagePrice,
}: BookingSheetProviderProps) {
  const [open, setOpen] = useState(false);
  const openSheet = useCallback(() => setOpen(true), []);
  const closeSheet = useCallback(() => setOpen(false), []);

  return (
    <BookingSheetContext.Provider value={{ openSheet }}>
      {children}
      <BookingRequestSheet
        open={open}
        onClose={closeSheet}
        carId={carId}
        brand={brand}
        model={model}
        pricePerDay={pricePerDay}
        pricePerKm={pricePerKm}
        weekendPackagePrice={weekendPackagePrice}
      />
    </BookingSheetContext.Provider>
  );
}
