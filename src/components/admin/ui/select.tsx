"use client";

import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  error?: boolean;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className = "", options, error, placeholder, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={error || undefined}
        className={`h-9 w-full appearance-none rounded-md border bg-[color:var(--admin-surface)] pl-3 pr-8 text-[0.8125rem] text-[color:var(--admin-text)] transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--admin-accent)]/40 disabled:cursor-not-allowed disabled:opacity-50 ${
          error
            ? "border-[color:var(--admin-danger)]/70 focus:border-[color:var(--admin-danger)] focus:ring-[color:var(--admin-danger)]/30"
            : "border-[color:var(--admin-line-strong)] focus:border-[color:var(--admin-accent)]"
        } ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[color:var(--admin-bg-elev)]">
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden
        width="12"
        height="12"
        viewBox="0 0 12 12"
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[color:var(--admin-text-muted)]"
      >
        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.25" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
});
