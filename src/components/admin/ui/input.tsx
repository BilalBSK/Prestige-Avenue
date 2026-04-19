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
      className={`h-10 w-full rounded-lg border bg-black/60 px-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 ${
        error ? "border-red-500" : "border-zinc-700"
      } ${className}`}
      {...props}
    />
  );
});
