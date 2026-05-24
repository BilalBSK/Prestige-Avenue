"use client";

import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";

export function CtaReveal({ children }: { children: React.ReactNode }) {
  const ref = useRevealOnScroll<HTMLDivElement>({ threshold: 0.3 });
  return (
    <div ref={ref} className="reveal-fade-up">
      {children}
    </div>
  );
}
