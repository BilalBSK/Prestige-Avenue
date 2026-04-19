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
    <header className="admin-fade-up relative mb-10 grid gap-8 border-b border-[color:var(--admin-line)] pb-10 md:grid-cols-[1fr_auto] md:items-end">
      <div>
        {eyebrow && (
          <p className="admin-mono text-[0.62rem] uppercase tracking-[0.42em] text-[color:var(--admin-accent)]">
            {eyebrow}
          </p>
        )}
        <h1 className="admin-serif mt-5 text-[2.75rem] font-normal leading-[1.02] tracking-[-0.01em] text-[color:var(--admin-text)] md:text-[3.25rem]">
          {title}
        </h1>
        {lede && (
          <p className="admin-serif mt-5 max-w-2xl text-[1.05rem] italic leading-relaxed text-[color:var(--admin-text-muted)]">
            {lede}
          </p>
        )}
        {meta && (
          <div className="admin-mono mt-6 flex flex-wrap items-center gap-4 text-[0.6rem] uppercase tracking-[0.32em] text-[color:var(--admin-text-muted)]">
            {meta}
          </div>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
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
    <span className="inline-flex items-baseline gap-2">
      <span className="text-[color:var(--admin-text-muted)]/60">{label}</span>
      <span className="admin-tabular text-[color:var(--admin-text)]">{value}</span>
    </span>
  );
}
