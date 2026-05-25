"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface CarGalleryProps {
  images: string[];
  alt: string;
}

export function CarGallery({ images, alt }: CarGalleryProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    function onScroll() {
      const node = scrollerRef.current;
      if (!node) return;
      const cardWidth = node.clientWidth * 0.8;
      const idx = Math.round(node.scrollLeft / cardWidth);
      setActiveIndex(Math.min(images.length - 1, Math.max(0, idx)));
    }

    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [images.length]);

  if (images.length === 0) return null;

  const total = String(images.length).padStart(2, "0");
  const current = String(activeIndex + 1).padStart(2, "0");

  return (
    <section className="relative py-12 md:py-16">
      <div
        ref={scrollerRef}
        className="car-gallery-scroller flex gap-3.5 overflow-x-auto pl-[max(16px,calc((100vw-1152px)/2+16px))] pr-4 pb-3"
        style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none" }}
      >
        {images.map((image, index) => (
          <div
            key={`${image}-${index}`}
            className="relative aspect-[16/10] w-[80vw] max-w-[1100px] flex-shrink-0 overflow-hidden bg-[var(--ink-elevated)]"
            style={{ scrollSnapAlign: "center" }}
          >
            <Image
              src={image}
              alt={`${alt} — vue ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 80vw, 80vw"
              quality={85}
            />
          </div>
        ))}
      </div>

      <div className="lux-container mt-6 flex items-center justify-between">
        <p className="font-[family:var(--font-fraunces)] text-[14px] italic text-[var(--ink-text-soft)]">
          ← Glissez →
        </p>
        <p className="font-[family:var(--font-fraunces)] text-[18px] font-light tracking-[-0.01em] text-[var(--ink-ivory)]">
          {current} <span className="text-[var(--ink-dim)]">/ {total}</span>
        </p>
      </div>

      <style>{`
        .car-gallery-scroller::-webkit-scrollbar { display: none; }
        @media (prefers-reduced-motion: reduce) {
          .car-gallery-scroller { scroll-snap-type: none !important; }
        }
      `}</style>
    </section>
  );
}
