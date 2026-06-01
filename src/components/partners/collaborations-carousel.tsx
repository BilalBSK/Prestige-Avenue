"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CollaborationSlide } from "@/services/collaboration.service";

interface CollaborationsCarouselProps {
  slides: CollaborationSlide[];
}

// Hauteur fixe de la pellicule ; chaque photo garde son ratio naturel, donc les
// portraits deviennent étroits et les paysages larges. Aucun recadrage forcé.
const ROW_HEIGHT_MOBILE = 300;
const ROW_HEIGHT_DESKTOP = 440;

// Réglages du ruban : vitesse de croisière calme, seuil avant de considérer
// qu'un pointeur « glisse » vraiment, et physique de l'inertie au relâcher.
const AUTO_SPEED_PX_PER_SEC = 32;
const DRAG_THRESHOLD_PX = 6;
const FLICK_FRICTION = 5; // amortissement de l'inertie (s⁻¹) → ~0,8 s
const MAX_FLICK_PX_PER_SEC = 2400;

export function CollaborationsCarousel({ slides }: CollaborationsCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  // Le ruban est animé par un `transform: translateX` piloté en JS (jamais par
  // scrollLeft) : pas d'arrondi au pixel, pas de boucle de rétroaction onScroll,
  // donc un défilement parfaitement lisse même avec une mise à l'échelle système.
  const rafRef = useRef<number>(0);
  const lastTsRef = useRef<number | null>(null);
  const offsetRef = useRef(0); // décalage courant (px), croissant = vers la gauche
  const periodRef = useRef(0); // largeur d'un jeu complet = point de bouclage
  const flickRef = useRef(0); // impulsion d'inertie résiduelle (px/s)
  const hiddenRef = useRef(false); // onglet masqué → on gèle
  const focusedRef = useRef(false); // un crédit a le focus clavier → on gèle

  const dragRef = useRef({
    down: false,
    active: false,
    id: -1,
    startX: 0,
    startY: 0,
    startOffset: 0,
    lastX: 0,
    lastT: 0,
    velocity: 0,
    moved: false,
  });

  const [rowHeight, setRowHeight] = useState(ROW_HEIGHT_DESKTOP);
  // Nombre de copies du jeu de photos. Au moins 2 pour boucler sans couture ; on
  // en ajoute si un seul jeu est plus étroit que l'écran (évite un vide au bord).
  const [copies, setCopies] = useState(2);

  // Hauteur de rangée responsive (sans dépendre de Tailwind pour le calcul JS).
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setRowHeight(mq.matches ? ROW_HEIGHT_DESKTOP : ROW_HEIGHT_MOBILE);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Helpers partagés par le moteur rAF et les gestes : une seule définition pour
  // éviter toute divergence. L'élément à l'index `slides.length` est le 1er clone ;
  // son offsetLeft relatif au 1er élément = largeur d'un jeu complet (= période de
  // bouclage), mesurée sans dépendre des valeurs de gap Tailwind.
  const measurePeriod = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const kids = track.children;
    if (kids.length > slides.length) {
      const first = kids[0] as HTMLElement;
      const cloneFirst = kids[slides.length] as HTMLElement;
      periodRef.current = cloneFirst.offsetLeft - first.offsetLeft;
    }
  }, [slides.length]);

  const wrap = useCallback((offset: number) => {
    const period = periodRef.current;
    if (period <= 0) return offset;
    offset %= period;
    if (offset < 0) offset += period;
    return offset;
  }, []);

  const applyTransform = useCallback((offset: number) => {
    const track = trackRef.current;
    if (track) track.style.transform = `translate3d(${-offset}px, 0, 0)`;
  }, []);

  // Garantit assez de copies pour couvrir l'écran au point de bouclage : au pire,
  // l'offset atteint une période complète et la fenêtre visible va jusqu'à
  // période + largeur écran, qui doit rester remplie. Renvoie true si un nouveau
  // rendu a été demandé (l'appelant doit alors attendre la prochaine passe).
  const ensureCoverage = useCallback(() => {
    const scroller = scrollerRef.current;
    const oneSet = periodRef.current;
    if (!scroller || oneSet <= 0) return false;
    const needed = Math.max(2, Math.ceil(scroller.clientWidth / oneSet) + 1);
    if (needed > copies) {
      setCopies(needed);
      return true;
    }
    return false;
  }, [copies]);

  // Moteur d'auto-défilement + inertie. Un seul requestAnimationFrame possède le
  // transform ; le drag et l'inertie passent par les mêmes refs, sans conflit.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track || slides.length === 0) return;

    measurePeriod();
    if (ensureCoverage()) return; // re-rendu en attente avec plus de copies

    applyTransform(wrap(offsetRef.current));

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return; // statique, mais le glissé manuel reste possible

    lastTsRef.current = null;

    const step = (ts: number) => {
      if (periodRef.current <= 0) measurePeriod(); // au cas où la 1re mesure a raté

      if (lastTsRef.current === null) lastTsRef.current = ts;
      let dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      if (dt > 0.05) dt = 0.05; // borne après un onglet masqué / image saccadée

      const drag = dragRef.current;
      // On avance tant que l'utilisateur ne tient pas le ruban et que l'onglet
      // est visible. Vitesse = croisière + inertie résiduelle (additive, donc
      // un flick accélère puis se fond dans la croisière sans à-coup).
      if (!(drag.down && drag.active) && !hiddenRef.current && !focusedRef.current) {
        let offset = offsetRef.current + (AUTO_SPEED_PX_PER_SEC + flickRef.current) * dt;
        if (flickRef.current !== 0) {
          flickRef.current *= Math.exp(-FLICK_FRICTION * dt);
          if (Math.abs(flickRef.current) < 2) flickRef.current = 0;
        }
        offset = wrap(offset);
        offsetRef.current = offset;
        applyTransform(offset);
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [slides.length, rowHeight, copies, measurePeriod, ensureCoverage, wrap, applyTransform]);

  // Gel quand l'onglet est masqué (économie + évite un saut au retour).
  useEffect(() => {
    const onVisibility = () => {
      hiddenRef.current = document.hidden;
      if (!document.hidden) lastTsRef.current = null;
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Sur redimensionnement : re-mesure la période et garantit que les copies
  // couvrent toujours la nouvelle largeur (sinon un vide pourrait apparaître au
  // bouclage si la fenêtre s'élargit fortement).
  useEffect(() => {
    const onResize = () => {
      measurePeriod();
      ensureCoverage();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measurePeriod, ensureCoverage]);

  // --- Glissé unifié souris / tactile / stylet via Pointer Events ------------
  // `touch-action: pan-y` laisse le navigateur gérer le défilement vertical de
  // la page ; seuls les gestes horizontaux nous parviennent. On ne « capture »
  // le pointeur qu'une fois l'intention horizontale confirmée, pour ne pas
  // voler un défilement vertical ni un simple clic sur un crédit partenaire.
  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    flickRef.current = 0; // saisir le ruban coupe l'inertie en cours
    dragRef.current = {
      down: true,
      active: false,
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffset: offsetRef.current,
      lastX: event.clientX,
      lastT: event.timeStamp,
      velocity: 0,
      moved: false,
    };
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag.down || event.pointerId !== drag.id) return;
    const node = scrollerRef.current;
    if (!node) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;

    if (!drag.active) {
      if (Math.abs(dx) < DRAG_THRESHOLD_PX && Math.abs(dy) < DRAG_THRESHOLD_PX) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        drag.down = false; // intention verticale → on laisse défiler la page
        return;
      }
      drag.active = true;
      drag.moved = true;
      try {
        node.setPointerCapture(event.pointerId);
      } catch {
        /* capture indisponible : on continue sans */
      }
      drag.lastX = event.clientX;
      drag.lastT = event.timeStamp;
    }

    // Position absolue depuis le début du geste → aucun cumul d'erreur.
    const offset = wrap(drag.startOffset - dx);
    offsetRef.current = offset;
    applyTransform(offset);

    // Vitesse du décalage (lissée) pour l'inertie au relâcher.
    const dtMs = Math.max(event.timeStamp - drag.lastT, 1);
    const vNow = (-(event.clientX - drag.lastX) / dtMs) * 1000;
    drag.velocity = 0.7 * vNow + 0.3 * drag.velocity;
    drag.lastX = event.clientX;
    drag.lastT = event.timeStamp;
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (event.pointerId !== drag.id) return;
    const node = scrollerRef.current;
    if (node?.hasPointerCapture?.(event.pointerId)) {
      node.releasePointerCapture(event.pointerId);
    }
    if (drag.active) {
      flickRef.current = Math.max(
        Math.min(drag.velocity, MAX_FLICK_PX_PER_SEC),
        -MAX_FLICK_PX_PER_SEC,
      );
      lastTsRef.current = null; // repart sans pic de dt
    }
    drag.down = false;
    drag.active = false;
  }

  if (slides.length === 0) return null;

  // Piste dupliquée pour une boucle continue ; le 1er jeu seul est lisible par
  // les lecteurs d'écran et navigable au clavier, les copies sont décoratives.
  const looped = Array.from({ length: copies }).flatMap((_, copyIndex) =>
    slides.map((slide, i) => ({ slide, copyIndex, i })),
  );

  return (
    <div
      className="collab-scroller relative w-full cursor-grab select-none overflow-hidden active:cursor-grabbing"
      ref={scrollerRef}
      style={{ touchAction: "pan-y" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onFocusCapture={() => {
        // Pause au focus clavier (WCAG 2.2.2) : le focus ne bouge que sur action
        // délibérée, jamais « tout seul » — contrairement au survol.
        focusedRef.current = true;
      }}
      onBlurCapture={() => {
        focusedRef.current = false;
        lastTsRef.current = null;
      }}
      onClickCapture={(event) => {
        // Un glissé ne doit jamais déclencher la navigation d'un crédit.
        if (dragRef.current.moved) {
          event.preventDefault();
          event.stopPropagation();
          dragRef.current.moved = false;
        }
      }}
    >
      <div ref={trackRef} className="flex w-max gap-4 md:gap-5" style={{ willChange: "transform" }}>
        {looped.map(({ slide, copyIndex, i }) => {
          const cardWidth = Math.round(rowHeight * (slide.width / slide.height));
          const isClone = copyIndex > 0;
          return (
            <figure
              key={`${copyIndex}-${i}-${slide.url}`}
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
