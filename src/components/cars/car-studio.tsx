"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";
import type { FlatShot, ShotGroup } from "@/lib/cars/shots";
import { SHOT_GROUPS } from "@/lib/cars/shots";
import { videoMimeFromUrl } from "@/lib/cars/video";

interface CarStudioProps {
  shots: FlatShot[];
  /** URL R2 de la vidéo auto-hébergée, ou null. */
  videoUrl: string | null;
  /** Image de couverture utilisée comme poster de la vidéo. */
  poster?: string;
  alt: string;
}

type StudioItem =
  | {
      kind: "image";
      url: string;
      group: ShotGroup;
      groupLabel: string;
      label: string;
      caption: string;
      /** Numéro 1-based de la photo au sein de son groupe (pour le marqueur "EXT · 02"). */
      groupIndex: number;
    }
  | { kind: "video"; videoUrl: string };

const GROUP_SHORT: Record<ShotGroup, string> = {
  EXTERIEUR: "EXT",
  INTERIEUR: "INT",
};

/** Onglet de navigation (un groupe de photos ou la vidéo). */
interface StudioTab {
  key: string;
  label: string;
  /** Index du premier item de cet onglet dans la séquence. */
  firstIndex: number;
  count: number | null;
}

export function CarStudio({ shots, videoUrl, poster, alt }: CarStudioProps) {
  const headerRef = useRevealOnScroll<HTMLDivElement>({ threshold: 0.3 });
  const stageWrapRef = useRevealOnScroll<HTMLDivElement>({ threshold: 0.2 });
  const railRef = useRef<HTMLDivElement | null>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const drag = useRef({ down: false, startX: 0, startScroll: 0, moved: false });

  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  // Séquence unifiée : toutes les photos (dans l'ordre canonique des angles)
  // puis la vidéo en dernier "plan".
  const items = useMemo<StudioItem[]>(() => {
    const groupCounters: Record<string, number> = {};
    const imageItems: StudioItem[] = shots.map((shot: FlatShot) => {
      const n = (groupCounters[shot.group] = (groupCounters[shot.group] ?? 0) + 1);
      const groupLabel =
        SHOT_GROUPS.find((g) => g.group === shot.group)?.label ?? shot.group;
      return {
        kind: "image",
        url: shot.url,
        group: shot.group,
        groupLabel,
        label: shot.label,
        caption: shot.caption,
        groupIndex: n,
      };
    });
    if (videoUrl) imageItems.push({ kind: "video", videoUrl });
    return imageItems;
  }, [shots, videoUrl]);

  const imageCount = items.filter((i) => i.kind === "image").length;
  const hasVideo = Boolean(videoUrl);

  // Onglets : un par groupe présent + "Vidéo" si disponible.
  const tabs = useMemo<StudioTab[]>(() => {
    const list: StudioTab[] = [];
    for (const g of SHOT_GROUPS) {
      const first = items.findIndex((i) => i.kind === "image" && i.group === g.group);
      if (first === -1) continue;
      const count = items.filter((i) => i.kind === "image" && i.group === g.group).length;
      list.push({ key: g.group, label: g.label, firstIndex: first, count });
    }
    if (hasVideo) {
      const vi = items.findIndex((i) => i.kind === "video");
      list.push({ key: "VIDEO", label: "Vidéo", firstIndex: vi, count: null });
    }
    return list;
  }, [items, hasVideo]);

  const activeItem = items[active];
  const activeTabKey =
    activeItem?.kind === "video" ? "VIDEO" : activeItem?.group ?? "";

  const total = items.length;

  const goTo = useCallback(
    (index: number) => {
      if (total === 0) return;
      const next = ((index % total) + total) % total;
      setActive(next);
    },
    [total],
  );

  const go = useCallback((delta: number) => goTo(active + delta), [active, goTo]);

  // Recentre la vignette active dans la pellicule sans bouger la page.
  useEffect(() => {
    const rail = railRef.current;
    const thumb = thumbRefs.current[active];
    if (!rail || !thumb) return;
    const target =
      thumb.offsetLeft - rail.clientWidth / 2 + thumb.clientWidth / 2;
    rail.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [active]);

  // Navigation clavier quand la visionneuse a le focus (ou en plein écran).
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "Escape" && lightbox) {
        setLightbox(false);
      }
    },
    [go, lightbox],
  );

  // Verrouille le scroll de la page tant que le plein écran est ouvert + ESC global.
  useEffect(() => {
    if (!lightbox) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox, go]);

  // Swipe (mobile) + clic = plein écran sur la scène.
  function onStageDown(e: React.PointerEvent) {
    drag.current = { down: true, startX: e.clientX, startScroll: 0, moved: false };
  }
  function onStageMove(e: React.PointerEvent) {
    if (!drag.current.down) return;
    if (Math.abs(e.clientX - drag.current.startX) > 8) drag.current.moved = true;
  }
  function onStageUp(e: React.PointerEvent) {
    if (!drag.current.down) return;
    const delta = e.clientX - drag.current.startX;
    drag.current.down = false;
    if (drag.current.moved && Math.abs(delta) > 44) {
      go(delta < 0 ? 1 : -1);
    } else if (!drag.current.moved && activeItem?.kind === "image") {
      setLightbox(true);
    }
  }

  // Drag-to-scroll de la pellicule (desktop — Lenis confisque la molette).
  function onRailDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "touch") return;
    const node = railRef.current;
    if (!node) return;
    drag.current = {
      down: true,
      startX: e.clientX,
      startScroll: node.scrollLeft,
      moved: false,
    };
    node.setPointerCapture(e.pointerId);
  }
  function onRailMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current.down) return;
    const node = railRef.current;
    if (!node) return;
    const delta = e.clientX - drag.current.startX;
    if (Math.abs(delta) > 4) drag.current.moved = true;
    node.scrollLeft = drag.current.startScroll - delta;
  }
  function onRailUp(e: React.PointerEvent<HTMLDivElement>) {
    const node = railRef.current;
    if (node?.hasPointerCapture(e.pointerId)) node.releasePointerCapture(e.pointerId);
    drag.current.down = false;
  }

  if (total === 0) return null;

  const counter = String(active + 1).padStart(2, "0");
  const totalStr = String(total).padStart(2, "0");

  return (
    <section className="border-y border-[var(--ink-line)] bg-[var(--ink-surface)] py-20 md:py-28">
      <div className="lux-container">
        {/* En-tête */}
        <div
          ref={headerRef}
          className="reveal-fade-up mb-8 flex flex-wrap items-end justify-between gap-6 md:mb-10"
        >
          <div className="max-w-[680px]">
            <p className="lux-eyebrow mb-4 font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em]">
              — Le studio
            </p>
            <h2 className="font-[family:var(--font-fraunces)] text-[clamp(32px,4vw,52px)] font-light leading-[1] tracking-[-0.025em] text-[var(--ink-ivory)]">
              Sous tous <em className="italic font-normal">les angles.</em>
            </h2>
          </div>
          <p className="font-[family:var(--font-dm-sans)] text-[11px] uppercase tracking-[0.22em] text-[var(--ink-text-soft)]">
            {imageCount} vue{imageCount > 1 ? "s" : ""}
            {hasVideo ? " · 1 vidéo" : ""}
          </p>
        </div>

        {/* Onglets de groupe */}
        {tabs.length > 1 && (
          <div className="mb-5 flex items-center gap-1 overflow-x-auto pb-1 [scrollbar-width:none] md:mb-6">
            {tabs.map((tab) => {
              const isActive = tab.key === activeTabKey;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => goTo(tab.firstIndex)}
                  className={`group relative shrink-0 px-4 py-2 font-[family:var(--font-dm-sans)] text-[11px] uppercase tracking-[0.2em] transition-colors duration-300 ${
                    isActive
                      ? "text-[var(--ink-ivory)]"
                      : "text-[var(--ink-muted)] hover:text-[var(--ink-text-soft)]"
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span className="ml-1.5 align-super text-[8px] tracking-normal text-[var(--ink-dim)]">
                      {tab.count}
                    </span>
                  )}
                  <span
                    aria-hidden
                    className={`gold-rule absolute inset-x-3 -bottom-px transition-opacity duration-300 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        )}

        {/* Scène principale */}
        <div
          ref={stageWrapRef}
          className="group/stage reveal-blur relative aspect-[4/3] w-full select-none overflow-hidden border border-[var(--ink-line)] bg-[var(--ink-elevated)] outline-none sm:aspect-[16/10] lg:aspect-[16/9]"
          tabIndex={0}
          role="group"
          aria-roledescription="carrousel"
          aria-label={`Galerie ${alt}`}
          onKeyDown={onKeyDown}
          onPointerDown={onStageDown}
          onPointerMove={onStageMove}
          onPointerUp={onStageUp}
          onPointerCancel={() => (drag.current.down = false)}
        >
          {/* Couches images empilées — crossfade + léger zoom à l'entrée */}
          {items.map((item, i) =>
            item.kind === "image" ? (
              <div
                key={item.url}
                aria-hidden={i !== active}
                className={`absolute inset-0 transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  i === active
                    ? "scale-100 opacity-100"
                    : "pointer-events-none scale-[1.04] opacity-0"
                }`}
              >
                <Image
                  src={item.url}
                  alt={`${alt} — ${item.caption}`}
                  fill
                  priority={i === 0}
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1152px) 90vw, 1152px"
                  quality={85}
                  draggable={false}
                />
              </div>
            ) : null,
          )}

          {/* Plan vidéo — lecteur natif auto-hébergé, monté uniquement lorsqu'il
              est actif (la lecture s'arrête en quittant le plan). */}
          {activeItem?.kind === "video" && (
            <video
              key={activeItem.videoUrl}
              poster={poster}
              controls
              playsInline
              preload="metadata"
              className="absolute inset-0 z-20 h-full w-full bg-black object-contain"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <source src={activeItem.videoUrl} type={videoMimeFromUrl(activeItem.videoUrl)} />
            </video>
          )}

          {/* Voile dégradé + grain — profondeur, masqué sur la vidéo */}
          {activeItem?.kind === "image" && (
            <>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.28)_0%,transparent_24%,transparent_62%,rgba(5,5,5,0.78)_100%)]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.05]"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence baseFrequency='1.4'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.45'/></svg>\")",
                }}
              />
            </>
          )}

          {/* Marqueur d'angle (haut gauche) */}
          {activeItem?.kind === "image" && (
            <div
              key={`marker-${active}`}
              className="booking-step-fade pointer-events-none absolute left-4 top-4 z-30 md:left-6 md:top-6"
            >
              <span className="font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em] text-[var(--ink-text-soft)]">
                {GROUP_SHORT[activeItem.group]} · {String(activeItem.groupIndex).padStart(2, "0")}
              </span>
            </div>
          )}

          {/* Légende (bas gauche) — masquée sur la vidéo pour ne pas couvrir
              la barre de lecture du lecteur embarqué. */}
          {activeItem?.kind === "image" && (
            <div
              key={`caption-${active}`}
              className="booking-step-fade pointer-events-none absolute bottom-4 left-4 z-30 md:bottom-6 md:left-6"
            >
              <p className="font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em] text-[var(--ink-muted)]">
                {activeItem.groupLabel}
              </p>
              <p className="mt-1.5 font-[family:var(--font-fraunces)] text-[clamp(20px,2.6vw,30px)] font-light italic leading-none tracking-[-0.01em] text-[var(--ink-ivory)]">
                {activeItem.caption}
              </p>
            </div>
          )}

          {/* Compteur (bas droite) — images uniquement, idem. */}
          {activeItem?.kind === "image" && (
            <div className="pointer-events-none absolute bottom-4 right-4 z-30 md:bottom-6 md:right-6">
              <p className="font-[family:var(--font-fraunces)] text-[16px] font-light tracking-[-0.01em] text-[var(--ink-ivory)]">
                {counter} <span className="text-[var(--ink-dim)]">/ {totalStr}</span>
              </p>
            </div>
          )}

          {/* Plein écran (haut droite) — images uniquement */}
          {activeItem?.kind === "image" && (
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setLightbox(true)}
              aria-label="Afficher en plein écran"
              className="absolute right-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/30 text-[var(--ink-ivory)] backdrop-blur-sm transition-colors duration-300 hover:border-white/40 hover:bg-black/55 md:right-6 md:top-6"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {/* Flèches précédent / suivant */}
          {total > 1 && (
            <>
              <StageArrow side="left" onClick={() => go(-1)} />
              <StageArrow side="right" onClick={() => go(1)} />
            </>
          )}
        </div>

        {/* Pellicule de vignettes, groupée par angle */}
        {total > 1 && (
          <div
            ref={railRef}
            className="car-studio-rail mt-4 flex cursor-grab gap-2.5 overflow-x-auto pb-2 active:cursor-grabbing md:mt-5"
            style={{ scrollbarWidth: "none" }}
            onPointerDown={onRailDown}
            onPointerMove={onRailMove}
            onPointerUp={onRailUp}
            onPointerCancel={onRailUp}
          >
            {items.map((item, i) => {
              const prev = items[i - 1];
              const showLabel =
                item.kind === "image" &&
                (i === 0 || prev?.kind !== "image" || prev.group !== item.group);
              return (
                <div key={item.kind === "image" ? item.url : "video"} className="flex shrink-0 items-stretch gap-2.5">
                  {showLabel && i !== 0 && (
                    <span aria-hidden className="my-2 w-px shrink-0 bg-[var(--ink-line)]" />
                  )}
                  <div className="flex flex-col gap-1.5">
                    {showLabel && (
                      <span className="pl-0.5 font-[family:var(--font-dm-sans)] text-[9px] uppercase tracking-[0.24em] text-[var(--ink-soft)]">
                        {item.kind === "image" ? item.groupLabel : ""}
                      </span>
                    )}
                    {!showLabel && <span className="h-[14px]" aria-hidden />}
                    <button
                      type="button"
                      ref={(el) => {
                        thumbRefs.current[i] = el;
                      }}
                      onClick={() => {
                        if (!drag.current.moved) goTo(i);
                      }}
                      aria-label={
                        item.kind === "image"
                          ? `Voir : ${item.caption}`
                          : "Voir la vidéo"
                      }
                      aria-current={i === active}
                      className={`group relative h-[68px] w-[100px] shrink-0 overflow-hidden border bg-[var(--ink-elevated)] transition-all duration-300 sm:h-[76px] sm:w-[112px] ${
                        i === active
                          ? "border-[var(--gold)] opacity-100"
                          : "border-[var(--ink-line)] opacity-55 hover:opacity-90"
                      }`}
                    >
                      {item.kind === "image" ? (
                        <Image
                          src={item.url}
                          alt=""
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="112px"
                          quality={75}
                          draggable={false}
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center bg-[var(--ink-onyx)]">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 text-[var(--ink-ivory)]">
                            <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
                              <path d="M3 1.5v9l7-4.5z" />
                            </svg>
                          </span>
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Plein écran immersif (images) */}
      {lightbox && activeItem?.kind === "image" && (
        <div
          className="car-studio-lightbox fixed inset-0 z-[9998] flex items-center justify-center bg-[rgba(5,5,5,0.96)] p-4 md:p-10"
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} — ${activeItem.caption}`}
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="Fermer"
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-[var(--ink-ivory)] transition-colors hover:border-white/40 hover:bg-white/5 md:right-8 md:top-8"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          <div
            className="relative h-full max-h-[82vh] w-full max-w-[1400px]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              key={activeItem.url}
              src={activeItem.url}
              alt={`${alt} — ${activeItem.caption}`}
              fill
              className="car-studio-lightbox-img object-contain"
              sizes="100vw"
              quality={100}
              draggable={false}
            />
          </div>

          <div
            className="pointer-events-none absolute bottom-5 left-1/2 z-10 -translate-x-1/2 text-center md:bottom-8"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em] text-[var(--ink-muted)]">
              {activeItem.groupLabel} · {counter} / {totalStr}
            </p>
            <p className="mt-1 font-[family:var(--font-fraunces)] text-[20px] font-light italic text-[var(--ink-ivory)]">
              {activeItem.caption}
            </p>
          </div>

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                aria-label="Précédent"
                className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 text-[var(--ink-ivory)] transition-colors hover:border-white/40 hover:bg-white/5 md:left-8"
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                aria-label="Suivant"
                className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 text-[var(--ink-ivory)] transition-colors hover:border-white/40 hover:bg-white/5 md:right-8"
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}

      <style>{`
        .car-studio-rail::-webkit-scrollbar { display: none; }
        .car-studio-rail { touch-action: pan-x; }
        .car-studio-lightbox { animation: car-studio-fade 280ms cubic-bezier(0.16,1,0.3,1); }
        .car-studio-lightbox-img { animation: car-studio-zoom 420ms cubic-bezier(0.16,1,0.3,1); }
        @keyframes car-studio-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes car-studio-zoom { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
        @media (prefers-reduced-motion: reduce) {
          .car-studio-lightbox, .car-studio-lightbox-img { animation: none; }
        }
      `}</style>
    </section>
  );
}

function StageArrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onClick}
      aria-label={side === "left" ? "Vue précédente" : "Vue suivante"}
      className={`absolute top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/30 text-[var(--ink-ivory)] opacity-100 backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-black/55 focus-visible:opacity-100 md:opacity-0 md:group-hover/stage:opacity-100 ${
        side === "left" ? "left-3 md:left-5" : "right-3 md:right-5"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        {side === "left" ? (
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}
