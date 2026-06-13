interface SectionCounterProps {
  index: number;
  className?: string;
}

// Repère de section : un fin filet doré (primitif « gold-rule », au reflet
// vivant — voir globals.css) suivi du seul numéro. Volontairement sans
// « / total » : le rapport indice/total faisait template générique, et le
// dénominateur n'était de toute façon pas cohérent d'une page à l'autre.
export function SectionCounter({ index, className = "" }: SectionCounterProps) {
  const padded = String(index).padStart(2, "0");

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span aria-hidden className="gold-rule h-px w-10 shrink-0" />
      <span className="font-[family:var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[0.28em] tabular-nums text-[var(--ink-soft)]">
        {padded}
      </span>
    </span>
  );
}
