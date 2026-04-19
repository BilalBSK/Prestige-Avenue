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
      className={`w-full resize-none border bg-[color:var(--admin-surface)]/40 px-4 py-3 text-[0.92rem] leading-relaxed text-[color:var(--admin-text)] transition-colors duration-300 placeholder:text-[color:var(--admin-text-muted)]/60 focus:outline-none ${
        error
          ? "border-[color:var(--admin-danger)]"
          : "border-[color:var(--admin-line-strong)] focus:border-[color:var(--admin-accent)]"
      } ${className}`}
      {...props}
    />
  );
});
