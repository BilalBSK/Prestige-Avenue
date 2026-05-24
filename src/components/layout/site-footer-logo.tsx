"use client";

import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";

export function SiteFooterLogo() {
  const ref = useRevealOnScroll<HTMLHeadingElement>({ threshold: 0.3 });

  return (
    <h2
      ref={ref}
      className="reveal-blur text-center font-[family:var(--font-fraunces)] text-[clamp(72px,12vw,156px)] font-light leading-[0.9] tracking-[-0.04em] text-[var(--ink-ivory)]"
    >
      Prestige <em className="font-normal italic">Avenue.</em>
    </h2>
  );
}
