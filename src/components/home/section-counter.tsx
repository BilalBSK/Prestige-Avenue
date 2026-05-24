interface SectionCounterProps {
  index: number;
  total?: number;
  className?: string;
}

export function SectionCounter({ index, total = 7, className = "" }: SectionCounterProps) {
  const padded = String(index).padStart(2, "0");
  const totalPadded = String(total).padStart(2, "0");

  return (
    <span
      className={`inline-block font-[family:var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--ink-muted)] ${className}`}
    >
      — {padded} / {totalPadded}
    </span>
  );
}
