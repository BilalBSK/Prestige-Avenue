"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  error?: boolean;
  unit?: string;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  { className = "", error, unit, ...props },
  ref,
) {
  return (
    <div className="relative">
      <input
        ref={ref}
        type="number"
        inputMode="decimal"
        aria-invalid={error || undefined}
        className={`h-10 w-full rounded-lg border bg-black/60 px-3 pr-14 text-sm text-zinc-100 tabular-nums placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 ${
          error ? "border-red-500" : "border-zinc-700"
        } ${className}`}
        {...props}
      />
      {unit && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
          {unit}
        </span>
      )}
    </div>
  );
});
