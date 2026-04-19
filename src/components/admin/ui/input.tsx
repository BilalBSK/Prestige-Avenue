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
      className={`h-11 w-full border-0 border-b bg-transparent px-0 text-[0.92rem] text-[color:var(--admin-text)] transition-colors duration-300 placeholder:text-[color:var(--admin-text-muted)]/60 focus:outline-none ${
        error
          ? "border-[color:var(--admin-danger)]"
          : "border-[color:var(--admin-line-strong)] focus:border-[color:var(--admin-accent)]"
      } ${className}`}
      {...props}
    />
  );
});
