"use client";

import { useEffect, useRef } from "react";

interface CarsGridProps {
  cacheKey: string;
  children: React.ReactNode;
}

export function CarsGrid({ cacheKey, children }: CarsGridProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.classList.remove("is-visible");
    if (typeof IntersectionObserver === "undefined") {
      node.classList.add("is-visible");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.classList.add("is-visible");
            observer.unobserve(node);
          }
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [cacheKey]);

  return (
    <div
      ref={ref}
      className="reveal-stagger grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3"
    >
      {children}
    </div>
  );
}
