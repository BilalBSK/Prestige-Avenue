"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface PopoverProps {
  open: boolean;
  onClose: () => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
  /** Accessible label for the floating dialog. */
  title?: string;
}

const VIEWPORT_PAD = 16; // min gap from any screen edge
const TRIGGER_GAP = 10; // gap between the trigger and the panel

interface Coords {
  top: number;
  left: number;
  maxHeight: number;
}

export function Popover({
  open,
  onClose,
  trigger,
  children,
  align = "left",
  className = "",
  title,
}: PopoverProps) {
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);

  useEffect(() => setMounted(true), []);

  // Anchor the panel to the trigger, then clamp inside the viewport so it can
  // never be clipped at a screen edge (collision-aware, like Floating UI).
  const reposition = useCallback(() => {
    const t = triggerRef.current;
    const p = panelRef.current;
    if (!t || !p) return;

    const tr = t.getBoundingClientRect();
    const pr = p.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Horizontal: align under the trigger, then shift to stay on-screen.
    let left =
      align === "center"
        ? tr.left + tr.width / 2 - pr.width / 2
        : align === "right"
          ? tr.right - pr.width
          : tr.left;
    left = Math.max(VIEWPORT_PAD, Math.min(left, vw - pr.width - VIEWPORT_PAD));

    // Vertical: prefer below; flip above only when there's clearly more room.
    const spaceBelow = vh - (tr.bottom + TRIGGER_GAP) - VIEWPORT_PAD;
    const spaceAbove = tr.top - TRIGGER_GAP - VIEWPORT_PAD;

    let top: number;
    let maxHeight: number;
    if (pr.height <= spaceBelow || spaceBelow >= spaceAbove) {
      top = tr.bottom + TRIGGER_GAP;
      maxHeight = spaceBelow;
    } else {
      maxHeight = spaceAbove;
      top = tr.top - TRIGGER_GAP - Math.min(pr.height, spaceAbove);
    }

    setCoords({ top, left, maxHeight: Math.max(0, maxHeight) });
  }, [align]);

  // Measure + position on open, and keep it anchored on scroll / resize.
  useEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }
    const raf = requestAnimationFrame(reposition);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open, reposition]);

  // Dismiss on outside click + Escape. No scrim — the page stays visible and
  // interactive behind the panel.
  useEffect(() => {
    if (!open) return;

    function onDown(event: MouseEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      onClose();
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Move focus into the panel once it's positioned.
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      panelRef.current
        ?.querySelector<HTMLElement>(
          'button:not([disabled]), [tabindex]:not([tabindex="-1"]), input, select, textarea, a[href]',
        )
        ?.focus();
    }, 20);
    return () => window.clearTimeout(id);
  }, [open]);

  return (
    <div ref={triggerRef} className="relative inline-flex">
      {trigger}

      {/* Floating panel — portaled to <body> so it escapes the toolbar's
          backdrop-blur containing block and any overflow clipping, and is
          positioned with fixed coords clamped to the viewport. */}
      {mounted &&
        open &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label={title}
            data-lenis-prevent
            className={`fixed z-[60] overflow-y-auto overscroll-contain ${className}`}
            style={{
              top: coords?.top ?? 0,
              left: coords?.left ?? 0,
              maxHeight: coords?.maxHeight,
              opacity: coords ? 1 : 0,
              transformOrigin: "top center",
              animation: coords
                ? "popover-in 200ms cubic-bezier(0.16, 1, 0.3, 1)"
                : undefined,
            }}
          >
            {children}
          </div>,
          document.body,
        )}

      <style>{`
        @keyframes popover-in {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          [role="dialog"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
