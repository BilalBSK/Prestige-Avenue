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
        className={`admin-tabular h-9 w-full rounded-md border bg-[color:var(--admin-surface)] px-3 ${
          unit ? "pr-11" : "pr-3"
        } text-[0.8125rem] text-[color:var(--admin-text)] transition-colors placeholder:text-[color:var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--admin-accent)]/40 disabled:cursor-not-allowed disabled:opacity-50 ${
          error
            ? "border-[color:var(--admin-danger)]/70 focus:border-[color:var(--admin-danger)] focus:ring-[color:var(--admin-danger)]/30"
            : "border-[color:var(--admin-line-strong)] focus:border-[color:var(--admin-accent)]"
        } ${className}`}
        {...props}
      />
      {unit && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.75rem] text-[color:var(--admin-text-muted)]">
          {unit}
        </span>
      )}
    </div>
  );
});
