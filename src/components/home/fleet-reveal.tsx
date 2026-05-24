"use client";

import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";

export function FleetReveal({ children }: { children: React.ReactNode }) {
  const ref = useRevealOnScroll<HTMLDivElement>({ threshold: 0.15 });
  return (
    <div
      ref={ref}
      className="reveal-stagger grid grid-cols-1 gap-3.5 md:grid-cols-3"
    >
      {children}
    </div>
  );
}
