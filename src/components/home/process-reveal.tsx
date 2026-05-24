"use client";

import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";

export function ProcessReveal({ children }: { children: React.ReactNode }) {
  const ref = useRevealOnScroll<HTMLDivElement>({ threshold: 0.2 });
  return (
    <div ref={ref} className="reveal-stagger relative grid grid-cols-1 md:grid-cols-3">
      {children}
    </div>
  );
}
