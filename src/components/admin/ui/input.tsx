"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = "", error, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={error || undefined}
      className={`h-9 w-full rounded-md border bg-[color:var(--admin-surface)] px-3 text-[0.8125rem] text-[color:var(--admin-text)] transition-colors placeholder:text-[color:var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--admin-accent)]/40 disabled:cursor-not-allowed disabled:opacity-50 ${
        error
          ? "border-[color:var(--admin-danger)]/70 focus:border-[color:var(--admin-danger)] focus:ring-[color:var(--admin-danger)]/30"
          : "border-[color:var(--admin-line-strong)] focus:border-[color:var(--admin-accent)]"
      } ${className}`}
      {...props}
    />
  );
});
