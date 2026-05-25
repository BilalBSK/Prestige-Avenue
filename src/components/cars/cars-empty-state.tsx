"use client";

import { usePathname, useRouter } from "next/navigation";

export function CarsEmptyState() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <p className="mb-2 font-[family:var(--font-dm-sans)] text-[11px] uppercase tracking-[0.28em] text-[var(--ink-muted)]">
        — Aucun résultat
      </p>
      <h2 className="font-[family:var(--font-fraunces)] text-[clamp(36px,5vw,56px)] font-light leading-[1] tracking-[-0.025em] text-[var(--ink-ivory)]">
        Aucune voiture
        <br />
        <em className="italic font-normal">ne correspond.</em>
      </h2>
      <button
        type="button"
        onClick={() => router.replace(pathname, { scroll: false })}
        className="group mt-8 inline-flex items-center gap-2 font-[family:var(--font-fraunces)] text-[14px] italic text-[var(--ink-ivory)] transition-opacity duration-200 hover:opacity-80"
      >
        <span className="border-b border-[var(--ink-ivory)] pb-0.5">
          Réinitialiser les filtres
        </span>
        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </button>
    </div>
  );
}
