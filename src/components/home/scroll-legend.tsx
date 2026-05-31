"use client";

import { useEffect, useRef, useState } from "react";
import { smoothScrollTo } from "@/lib/scroll-lock";

export interface ScrollLegendItem {
  /** `id` de la <section> ciblée. */
  id: string;
  /** Libellé affiché au survol. */
  label: string;
}

interface ScrollLegendProps {
  items: ScrollLegendItem[];
}

/**
 * « Le fil » — index vertical des sections, épinglé dans la gouttière gauche.
 *
 * Au repos : de fines graduations. La section active est tracée en un filament
 * ivoire plus long, nimbé d'un halo. Au survol du rail, les libellés se révèlent
 * en cascade. Le rail reste masqué sur le hero puis glisse depuis la gauche dès
 * que l'on entre dans le contenu. Sur mobile : graduations seules (pas de survol).
 */
export function ScrollLegend({ items }: ScrollLegendProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");
  const [revealed, setRevealed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const tickingRef = useRef(false);

  useEffect(() => {
    const update = () => {
      tickingRef.current = false;

      // Ligne de référence à 40 % de la hauteur visible.
      const line = window.scrollY + window.innerHeight * 0.4;

      // Masqué tant que l'on est dans le premier écran (hero cinématique).
      setRevealed(window.scrollY > window.innerHeight * 0.55);

      let current = items[0]?.id ?? "";
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (top <= line) current = item.id;
      }
      setActiveId(current);
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
  }, [items]);

  const goTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) smoothScrollTo(el);
  };

  return (
    <nav
      aria-label="Repères de section"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`pointer-events-none fixed left-0 top-1/2 z-20 -translate-y-1/2 select-none pl-2.5 pr-4 sm:pl-4 md:pl-6 md:pr-10 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        revealed
          ? "translate-x-0 opacity-100 md:pointer-events-auto"
          : "-translate-x-3 opacity-0"
      }`}
    >
      {/* Voile dégradé — donne un fond lisible aux libellés révélés (desktop). */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 left-0 hidden w-60 bg-gradient-to-r from-[rgba(5,5,5,0.9)] via-[rgba(5,5,5,0.45)] to-transparent transition-opacity duration-500 md:block ${
          hovered ? "opacity-100" : "opacity-0"
        }`}
      />

      <ul className="relative flex flex-col gap-1.5 md:gap-1">
        {items.map((item, i) => {
          const active = item.id === activeId;
          const num = String(i + 1).padStart(2, "0");
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => goTo(item.id)}
                aria-label={item.label}
                aria-current={active ? "location" : undefined}
                className="group/item relative flex w-full items-center justify-center gap-4 py-1 outline-none md:min-h-0 md:justify-start md:py-2"
              >
                {/* Zone graduation — fine sur mobile, alignée à gauche sur desktop. */}
                <span className="relative flex w-3 items-center justify-center md:w-10 md:justify-start">
                  {/* Halo de la section active. */}
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl transition-opacity duration-700 md:left-0 ${
                      active ? "opacity-100" : "opacity-0"
                    }`}
                    style={{
                      background:
                        "radial-gradient(circle, rgba(250,250,250,0.35), transparent 70%)",
                    }}
                  />
                  {/* Le filament — barre verticale sur mobile, trait horizontal sur desktop. */}
                  <span
                    aria-hidden
                    className={`relative rounded-full transition-[width,height,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      active
                        ? "h-7 w-0.5 bg-[var(--ink-ivory)] shadow-[0_0_10px_rgba(250,250,250,0.55)] md:h-px md:w-10"
                        : "h-3.5 w-px bg-[var(--ink-dim)] md:h-px md:w-4 md:group-hover/item:w-6 md:group-hover/item:bg-[var(--ink-text-soft)]"
                    }`}
                  />
                </span>

                {/* Libellé — cascade au survol (desktop), masqué sur mobile. */}
                <span
                  aria-hidden
                  style={{ transitionDelay: hovered ? `${i * 45}ms` : "0ms" }}
                  className={`hidden items-baseline gap-2 whitespace-nowrap transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-focus-visible/item:!translate-x-0 group-focus-visible/item:!opacity-100 md:flex ${
                    hovered ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0"
                  }`}
                >
                  <span
                    className={`font-[family:var(--font-dm-sans)] text-[9px] font-medium uppercase tracking-[0.3em] tabular-nums transition-colors duration-500 ${
                      active
                        ? "text-[var(--ink-text-soft)]"
                        : "text-[var(--ink-dim)] group-hover/item:text-[var(--ink-text-soft)]"
                    }`}
                  >
                    {num}
                  </span>
                  <span
                    className={`font-[family:var(--font-fraunces)] text-[15px] font-light leading-none tracking-[-0.01em] transition-colors duration-500 group-hover/item:text-[var(--ink-ivory)] ${
                      active
                        ? "italic text-[var(--ink-ivory)]"
                        : "text-[var(--ink-text-soft)]"
                    }`}
                  >
                    {item.label}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
