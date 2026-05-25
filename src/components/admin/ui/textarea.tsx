"use client";

import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className = "", error, rows = 4, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={error || undefined}
      className={`w-full resize-none rounded-md border bg-[color:var(--admin-surface)] px-3 py-2 text-[0.8125rem] leading-relaxed text-[color:var(--admin-text)] transition-colors placeholder:text-[color:var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--admin-accent)]/40 disabled:cursor-not-allowed disabled:opacity-50 ${
        error
          ? "border-[color:var(--admin-danger)]/70 focus:border-[color:var(--admin-danger)] focus:ring-[color:var(--admin-danger)]/30"
          : "border-[color:var(--admin-line-strong)] focus:border-[color:var(--admin-accent)]"
      } ${className}`}
      {...props}
    />
  );
});
