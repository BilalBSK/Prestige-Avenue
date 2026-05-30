"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

interface CarGalleryProps {
  images: string[];
  alt: string;
}

export function CarGallery({ images, alt }: CarGalleryProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const dragState = useRef({ isDown: false, startX: 0, startScroll: 0, moved: false });

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

  const scrollToIndex = useCallback((index: number) => {
    const node = scrollerRef.current;
    if (!node) return;
    const clamped = Math.min(images.length - 1, Math.max(0, index));
    const card = node.children[clamped] as HTMLElement | undefined;
    if (!card) return;
    const left = card.offsetLeft - (node.clientWidth - card.clientWidth) / 2;
    node.scrollTo({ left, behavior: "smooth" });
  }, [images.length]);

  // Drag-to-scroll with the mouse (desktop). Lenis hijacks the wheel, so this
  // is the primary way to browse photos on a non-touch device.
  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;
    const node = scrollerRef.current;
    if (!node) return;
    dragState.current = {
      isDown: true,
      startX: event.clientX,
      startScroll: node.scrollLeft,
      moved: false,
    };
    node.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const state = dragState.current;
    if (!state.isDown) return;
    const node = scrollerRef.current;
    if (!node) return;
    const delta = event.clientX - state.startX;
    if (Math.abs(delta) > 4) state.moved = true;
    node.scrollLeft = state.startScroll - delta;
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    const node = scrollerRef.current;
    if (node?.hasPointerCapture(event.pointerId)) {
      node.releasePointerCapture(event.pointerId);
    }
    dragState.current.isDown = false;
  }

  if (images.length === 0) return null;

  const total = String(images.length).padStart(2, "0");
  const current = String(activeIndex + 1).padStart(2, "0");
  const atStart = activeIndex === 0;
  const atEnd = activeIndex === images.length - 1;

  return (
    <section className="relative py-12 md:py-16">
      <div
        ref={scrollerRef}
        className="car-gallery-scroller flex cursor-grab gap-3.5 overflow-x-auto pl-[max(16px,calc((100vw-1152px)/2+16px))] pr-4 pb-3 active:cursor-grabbing"
        style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
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
              className="pointer-events-none select-none object-cover"
              sizes="(max-width: 768px) 80vw, 80vw"
              quality={85}
              draggable={false}
            />
          </div>
        ))}
      </div>

      <div className="lux-container mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Photo précédente"
            onClick={() => scrollToIndex(activeIndex - 1)}
            disabled={atStart}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--ink-line)] text-[var(--ink-ivory)] transition-colors hover:border-[var(--ink-ivory)] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Photo suivante"
            onClick={() => scrollToIndex(activeIndex + 1)}
            disabled={atEnd}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--ink-line)] text-[var(--ink-ivory)] transition-colors hover:border-[var(--ink-ivory)] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <p className="font-[family:var(--font-fraunces)] text-[18px] font-light tracking-[-0.01em] text-[var(--ink-ivory)]">
          {current} <span className="text-[var(--ink-dim)]">/ {total}</span>
        </p>
      </div>

      <style>{`
        .car-gallery-scroller::-webkit-scrollbar { display: none; }
        .car-gallery-scroller { touch-action: pan-y; }
        @media (prefers-reduced-motion: reduce) {
          .car-gallery-scroller { scroll-snap-type: none !important; }
        }
      `}</style>
    </section>
  );
}
