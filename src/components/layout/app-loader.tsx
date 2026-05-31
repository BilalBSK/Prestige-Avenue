"use client";

import { useEffect, useState } from "react";
import { scrollToTopImmediate } from "@/lib/scroll-lock";

// Minimum time the splash stays up so the wave animation is actually seen,
// even on instant loads. Capped by a safety timeout so slow/broken loads
// never hang behind the overlay forever.
const MIN_VISIBLE_MS = 1000;
const FADE_MS = 700;
const SAFETY_MS = 6000;

/**
 * Full-screen brand splash shown on the initial document load and on every
 * full reload (F5). It is mounted once in the root layout, so client-side
 * navigation between pages never re-triggers it.
 *
 * The `app-loading` class on <html> (added synchronously by an inline script
 * in the layout, before first paint) locks scroll and pauses the hero entry
 * animation. Removing it here, as the loader fades out, lets the hero reveal
 * play in sync with the splash lifting instead of finishing unseen behind it.
 */
export function AppLoader() {
  const [hidden, setHidden] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const start = performance.now();
    let fadeTimer = 0;
    let removeTimer = 0;

    // Pin the page to the top WHILE the splash covers everything. The browser
    // may restore a prior scroll position before React runs, and Lenis (desktop)
    // initialises a frame or two late — so re-assert the top over a few frames.
    // All of this happens behind the opaque loader, so it is never seen.
    scrollToTopImmediate();
    const f1 = window.setTimeout(scrollToTopImmediate, 60);
    const f2 = window.setTimeout(scrollToTopImmediate, 180);

    const reveal = () => {
      const elapsed = performance.now() - start;
      fadeTimer = window.setTimeout(() => {
        // Final assertion right before lifting, covering both scroll engines.
        scrollToTopImmediate();
        setHidden(true);
        document.documentElement.classList.remove("app-loading");
        removeTimer = window.setTimeout(() => setRemoved(true), FADE_MS);
      }, Math.max(0, MIN_VISIBLE_MS - elapsed));
    };

    const safety = window.setTimeout(reveal, SAFETY_MS);

    if (document.readyState === "complete") {
      reveal();
    } else {
      window.addEventListener("load", reveal, { once: true });
    }

    return () => {
      window.removeEventListener("load", reveal);
      window.clearTimeout(safety);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
      window.clearTimeout(f1);
      window.clearTimeout(f2);
    };
  }, []);

  if (removed) return null;

  return (
    <div
      className={`app-loader${hidden ? " is-hidden" : ""}`}
      role="presentation"
      aria-hidden
    >
      <div className="app-loader__stage">
        <div className="app-loader__ring" />
        <div className="app-loader__orb">
          <div className="app-loader__liquid" />
        </div>
      </div>
    </div>
  );
}
