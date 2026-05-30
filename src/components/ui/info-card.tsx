"use client";

import { memo, useCallback } from "react";

interface InfoCardProps {
  title: React.ReactNode;
  children: React.ReactNode;
  index?: number;
}

function InfoCardComponent({ title, children, index }: InfoCardProps) {
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    target.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }, []);

  return (
    <article
      onPointerMove={handlePointerMove}
      className="info-card group relative overflow-hidden rounded-lg border border-[var(--ink-line)] bg-[var(--ink-surface)] p-7 transition-[border-color,background-color,transform] duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[var(--ink-dim)] hover:bg-[var(--ink-elevated)]"
    >
      {/* Cursor-following spotlight */}
      <span aria-hidden className="info-card-spot" />

      {/* Top hairline that draws on hover */}
      <span
        aria-hidden
        className="info-card-line absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-[var(--ink-ivory)] transition-transform duration-[600ms] ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:scale-x-100"
      />

      <div className="relative flex items-start justify-between gap-4">
        <h4 className="font-[family:var(--font-fraunces)] text-[19px] font-normal leading-tight tracking-[-0.005em] text-[var(--ink-ivory)]">
          {title}
        </h4>
        {index !== undefined && (
          <span className="shrink-0 font-[family:var(--font-dm-sans)] text-[11px] tabular-nums tracking-[0.18em] text-[var(--ink-dim)] transition-colors duration-[450ms] group-hover:text-[var(--ink-text-soft)]">
            0{index}
          </span>
        )}
      </div>
      <div className="relative mt-3 font-[family:var(--font-dm-sans)] text-[13.5px] leading-relaxed text-[var(--ink-text-soft)]">
        {children}
      </div>
    </article>
  );
}

export const InfoCard = memo(InfoCardComponent);
