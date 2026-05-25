import { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, lede, meta, actions }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <p className="mb-1.5 text-[0.75rem] font-medium text-[color:var(--admin-text-muted)]">
            {eyebrow}
          </p>
        )}
        <h1 className="truncate text-[1.375rem] font-semibold tracking-tight text-[color:var(--admin-text)]">
          {title}
        </h1>
        {lede && (
          <p className="mt-1 text-[0.875rem] text-[color:var(--admin-text-soft)]">
            {lede}
          </p>
        )}
        {meta && (
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.75rem] text-[color:var(--admin-text-muted)]">
            {meta}
          </div>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}

export function PageMetaItem({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-[color:var(--admin-text-muted)]">{label}</span>
      <span className="admin-tabular text-[color:var(--admin-text-soft)]">{value}</span>
    </span>
  );
}
