"use client";

import { useEffect, useRef } from "react";

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement | null>(null);
  const tickingRef = useRef(false);

  useEffect(() => {
    const update = () => {
      tickingRef.current = false;
      const node = barRef.current;
      if (!node) return;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        documentHeight <= 0
          ? 0
          : Math.min(100, Math.max(0, (window.scrollY / documentHeight) * 100));
      node.style.width = `${progress}%`;
    };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px bg-transparent">
      <div ref={barRef} className="h-full bg-[var(--ink-ivory)]" style={{ width: "0%" }} />
    </div>
  );
}
