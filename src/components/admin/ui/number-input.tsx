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
        className={`admin-mono h-11 w-full border-0 border-b bg-transparent px-0 ${
          unit ? "pr-14" : "pr-0"
        } text-[0.92rem] text-[color:var(--admin-text)] transition-colors duration-300 placeholder:text-[color:var(--admin-text-muted)]/50 focus:outline-none ${
          error
            ? "border-[color:var(--admin-danger)]"
            : "border-[color:var(--admin-line-strong)] focus:border-[color:var(--admin-accent)]"
        } ${className}`}
        {...props}
      />
      {unit && (
        <span className="admin-mono pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[0.7rem] uppercase tracking-widest text-[color:var(--admin-text-muted)]">
          {unit}
        </span>
      )}
    </div>
  );
});
