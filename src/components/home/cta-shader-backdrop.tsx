"use client";

import { useEffect, useRef, useState } from "react";
import { ShaderAnimation } from "@/components/ui/shader-lines";

/**
 * Integration layer for the vendored `ShaderAnimation` (21st.dev shader-lines).
 *
 * The raw component paints a full-bleed field of animated, RGB-colored radial
 * filaments on an opaque black canvas. Prestige Avenue is strict monochrome
 * luxury with gold used sparingly ("effet bijou"), so all brand adaptation
 * happens HERE, on the wrapper — the vendor file is never edited:
 *
 *  - `mix-blend-screen` drops the canvas's black to nothing, leaving only the
 *    glowing lines floating over the section's near-black background.
 *  - the `filter` chain desaturates the rainbow output and re-tints it to
 *    champagne gold (#c9a24e family).
 *  - a radial `mask` melts the rectangular canvas edges into a soft vignette,
 *    echoing the concentric motion of the shader itself.
 *
 * The WebGL context is expensive and this section lives at the very bottom of a
 * long page, so the shader is mounted lazily the first time the section nears
 * the viewport. Visitors who prefer reduced motion never mount it at all — they
 * get a static gold bloom instead, so the section keeps its depth either way.
 */
export function CtaShaderBackdrop() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [allowMotion, setAllowMotion] = useState(false);

  // Resolve the motion preference (and keep it live if the user toggles it).
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setAllowMotion(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Mount the shader only once the section approaches the viewport.
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const renderShader = inView && allowMotion;

  return (
    <div ref={rootRef} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Static gold bloom — atmosphere base, and the sole layer for reduced-motion. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 46%, rgba(201,162,78,0.10) 0%, rgba(201,162,78,0.04) 38%, transparent 72%)",
        }}
      />

      {/* Animated shader layer — re-tinted to gold, edges masked to a vignette. */}
      {renderShader && (
        <div
          className="cta-shader-fade absolute inset-0"
          style={
            {
              "--cta-shader-opacity": "0.6",
              mixBlendMode: "screen",
              filter:
                "grayscale(1) sepia(1) saturate(2) hue-rotate(3deg) brightness(1.04) contrast(1.05)",
              WebkitMaskImage:
                "radial-gradient(ellipse 78% 72% at 50% 47%, #000 26%, rgba(0,0,0,0.5) 60%, transparent 80%)",
              maskImage:
                "radial-gradient(ellipse 78% 72% at 50% 47%, #000 26%, rgba(0,0,0,0.5) 60%, transparent 80%)",
            } as React.CSSProperties
          }
        >
          <ShaderAnimation />
        </div>
      )}

      {/* Legibility scrim — keeps the headline and pill crisp over the glow,
          and feathers the backdrop back into the page above and below. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(46% 52% at 50% 50%, rgba(5,5,5,0.62) 0%, rgba(5,5,5,0.32) 42%, transparent 70%), linear-gradient(180deg, var(--ink-onyx) 0%, transparent 22%, transparent 78%, var(--ink-onyx) 100%)",
        }}
      />

      {/* Fine grain — matches the hero's overlay so the section reads as one surface. */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence baseFrequency='1.4'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.45'/></svg>\")",
        }}
      />
    </div>
  );
}
