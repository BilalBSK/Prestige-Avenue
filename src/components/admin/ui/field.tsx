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
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1 text-[0.8125rem] font-medium text-[color:var(--admin-text)]"
      >
        {label}
        {required && (
          <span aria-hidden className="text-[color:var(--admin-danger-soft)]">
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p className="text-[0.75rem] text-[color:var(--admin-danger-soft)]">
          {error}
        </p>
      )}
      {!error && hint && (
        <p className="text-[0.75rem] text-[color:var(--admin-text-muted)]">{hint}</p>
      )}
    </div>
  );
}
