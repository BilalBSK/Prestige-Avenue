"use client";

import { useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { ManualBookingForm, type CarOption } from "./manual-booking-form";

interface ManualBookingButtonProps {
  cars: CarOption[];
}

export function ManualBookingButton({ cars }: ManualBookingButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="primary" size="md" onClick={() => setOpen(true)}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M7 3v8M3 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Nouvelle réservation
      </Button>
      <ManualBookingForm open={open} onClose={() => setOpen(false)} cars={cars} />
    </>
  );
}
