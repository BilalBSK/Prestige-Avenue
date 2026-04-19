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
      <label htmlFor={htmlFor} className="block text-sm font-medium text-zinc-200">
        {label}
        {required && <span className="ml-1 text-amber-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
      {!error && hint && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}
