import { ReactNode } from "react";

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export function Field({ label, htmlFor, error, hint, required, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.24em] text-[color:var(--admin-text-muted)]"
      >
        {label}
        {required && (
          <span aria-hidden className="text-[color:var(--admin-accent)]">
            ·
          </span>
        )}
      </label>
      {children}
      {error && (
        <p className="admin-mono text-[0.68rem] text-[color:var(--admin-danger-soft)]">
          {error}
        </p>
      )}
      {!error && hint && (
        <p className="text-[0.7rem] text-[color:var(--admin-text-muted)]">{hint}</p>
      )}
    </div>
  );
}
