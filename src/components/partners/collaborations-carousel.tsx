"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CollaborationSlide } from "@/services/collaboration.service";

interface CollaborationsCarouselProps {
  slides: CollaborationSlide[];
}

// Hauteur fixe de la pellicule ; chaque photo garde son ratio naturel, donc les
// portraits deviennent étroits et les paysages larges. Aucun recadrage forcé.
const ROW_HEIGHT_MOBILE = 300;
const ROW_HEIGHT_DESKTOP = 440;
const AUTO_SCROLL_PX_PER_SEC = 32;

export function CollaborationsCarousel({ slides }: CollaborationsCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number>(0);
  const lastTsRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const dragState = useRef({ isDown: false, startX: 0, startScroll: 0, moved: false });
  const [rowHeight, setRowHeight] = useState(ROW_HEIGHT_DESKTOP);

  // Hauteur de rangée responsive (sans dépendre de Tailwind pour le calcul JS).
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setRowHeight(mq.matches ? ROW_HEIGHT_DESKTOP : ROW_HEIGHT_MOBILE);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Auto-défilement continu + boucle sans couture. La piste est dupliquée : dès
  // qu'on dépasse la moitié (= un jeu complet de photos), on rembobine d'autant.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || slides.length === 0) return;

    function step(ts: number) {
      const node = scrollerRef.current;
      const trackNode = trackRef.current;
      if (!node || !trackNode) return;

      if (lastTsRef.current === null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      if (!pausedRef.current && !dragState.current.isDown) {
        const half = trackNode.scrollWidth / 2;
        let next = node.scrollLeft + AUTO_SCROLL_PX_PER_SEC * dt;
        if (half > 0 && next >= half) next -= half;
        node.scrollLeft = next;
      }
      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [slides.length, rowHeight]);

  // Pause quand l'onglet est masqué (économie + évite un saut au retour).
  useEffect(() => {
    const onVisibility = () => {
      pausedRef.current = document.hidden;
      if (!document.hidden) lastTsRef.current = null;
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Rembobinage si l'utilisateur glisse au-delà des bornes (garde la boucle).
  function normalizeLoop() {
    const node = scrollerRef.current;
    const track = trackRef.current;
    if (!node || !track) return;
    const half = track.scrollWidth / 2;
    if (half <= 0) return;
    if (node.scrollLeft >= half) node.scrollLeft -= half;
    else if (node.scrollLeft < 0) node.scrollLeft += half;
  }

  function pause() {
    pausedRef.current = true;
  }
  function resume() {
    pausedRef.current = false;
    lastTsRef.current = null;
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return; // le scroll tactile natif gère
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
    normalizeLoop();
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    const node = scrollerRef.current;
    if (node?.hasPointerCapture(event.pointerId)) {
      node.releasePointerCapture(event.pointerId);
    }
    dragState.current.isDown = false;
  }

  if (slides.length === 0) return null;

  // Piste dupliquée pour une boucle continue ; clés stables par cycle.
  const looped = [...slides, ...slides];

  return (
    <div
      className="collab-scroller flex w-full cursor-grab gap-4 overflow-x-auto pb-2 active:cursor-grabbing md:gap-5"
      ref={scrollerRef}
      style={{ scrollbarWidth: "none", touchAction: "pan-x" }}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
      onScroll={() => {
        // Maintient la boucle lors du défilement tactile / inertie.
        if (!dragState.current.isDown) normalizeLoop();
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div ref={trackRef} className="flex shrink-0 gap-4 md:gap-5">
        {looped.map((slide, index) => {
          const cardWidth = Math.round(rowHeight * (slide.width / slide.height));
          // Le second jeu n'est qu'un clone visuel pour la boucle : masqué aux
          // lecteurs d'écran et hors du parcours clavier.
          const isClone = index >= slides.length;
          return (
            <figure
              key={`${isClone ? "b" : "a"}-${index}-${slide.url}`}
              aria-hidden={isClone || undefined}
              className="group relative shrink-0 overflow-hidden rounded-[2px] bg-[var(--ink-elevated)]"
              style={{ width: cardWidth, height: rowHeight }}
            >
              <Image
                src={slide.url}
                alt={isClone ? "" : `Collaboration — ${slide.partnerName}`}
                fill
                className="pointer-events-none select-none object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                sizes={`${Math.min(cardWidth, 900)}px`}
                quality={85}
                draggable={false}
              />

              {/* Voile bas pour la lisibilité du crédit. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(180deg,transparent,rgba(5,5,5,0.78))] opacity-80 transition-opacity duration-500 group-hover:opacity-100"
              />

              <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 md:p-5">
                <CreditLabel
                  partnerName={slide.partnerName}
                  partnerUrl={slide.partnerUrl}
                  focusable={!isClone}
                />
              </figcaption>
            </figure>
          );
        })}
      </div>

      <style>{`
        .collab-scroller::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

function CreditLabel({
  partnerName,
  partnerUrl,
  focusable,
}: {
  partnerName: string;
  partnerUrl: string | null;
  focusable: boolean;
}) {
  const inner = (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className="h-px w-5 bg-[var(--ink-text-soft)] transition-[width] duration-500 ease-out group-hover:w-8"
      />
      <span className="font-[family:var(--font-fraunces)] text-[15px] font-light italic leading-none tracking-[-0.01em] text-[var(--ink-ivory)] md:text-[17px]">
        {partnerName}
      </span>
    </span>
  );

  if (!partnerUrl) {
    return <span className="relative z-10 inline-flex items-center">{inner}</span>;
  }

  return (
    <a
      href={partnerUrl}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={focusable ? undefined : -1}
      onClick={(e) => e.stopPropagation()}
      className="group/credit relative z-10 inline-flex items-center transition-opacity duration-300 hover:opacity-80"
      aria-label={`Voir le profil de ${partnerName}`}
    >
      {inner}
    </a>
  );
}
