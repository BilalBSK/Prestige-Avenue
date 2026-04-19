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
        className={`h-11 w-full appearance-none border-0 border-b bg-transparent pr-8 text-[0.92rem] text-[color:var(--admin-text)] transition-colors duration-300 focus:outline-none ${
          error
            ? "border-[color:var(--admin-danger)]"
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
      <span
        aria-hidden
        className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[0.65rem] text-[color:var(--admin-text-muted)]"
      >
        ▾
      </span>
    </div>
  );
});
