"use client";

import { memo } from "react";

interface InfoCardProps {
  title: React.ReactNode;
  children: React.ReactNode;
}

function InfoCardComponent({ title, children }: InfoCardProps) {
  return (
    <article className="info-card group relative overflow-hidden rounded-lg border border-[var(--ink-line)] bg-[var(--ink-surface)] p-7 transition-[border-color,background-color] duration-[350ms] ease-out hover:border-[var(--ink-dim)] hover:bg-[var(--ink-elevated)]">
      <span
        aria-hidden
        className="info-card-line absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-[var(--ink-ivory)] transition-transform duration-[600ms] ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:scale-x-100"
      />
      <h4 className="font-[family:var(--font-fraunces)] text-[19px] font-normal leading-tight tracking-[-0.005em] text-[var(--ink-ivory)]">
        {title}
      </h4>
      <div className="mt-3 font-[family:var(--font-dm-sans)] text-[13.5px] leading-relaxed text-[var(--ink-text-soft)]">
        {children}
      </div>
    </article>
  );
}

export const InfoCard = memo(InfoCardComponent);
