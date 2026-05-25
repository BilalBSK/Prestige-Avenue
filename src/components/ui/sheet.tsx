"use client";

import { useEffect, useRef } from "react";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  ariaLabel: string;
}

const FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Sheet({ open, onClose, children, ariaLabel }: SheetProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    lastActiveRef.current = (document.activeElement as HTMLElement | null) ?? null;
    lockScroll();

    const focusFirst = () => {
      const node = panelRef.current;
      if (!node) return;
      const firstFocusable = node.querySelector<HTMLElement>(FOCUSABLE_SELECTORS);
      (firstFocusable ?? node).focus();
    };
    const t = window.setTimeout(focusFirst, 30);

    return () => {
      window.clearTimeout(t);
      unlockScroll();
      lastActiveRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const node = panelRef.current;
      if (!node) return;
      const focusables = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)).filter(
        (el) => !el.hasAttribute("disabled") && el.offsetParent !== null,
      );
      if (focusables.length === 0) {
        event.preventDefault();
        node.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60]"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      data-lenis-prevent
    >
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-[2px] animate-[sheet-fade-in_240ms_ease-out_forwards]"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        data-lenis-prevent
        className="absolute right-0 top-0 flex h-full w-full max-w-[560px] flex-col bg-[var(--ink-onyx)] shadow-[-30px_0_80px_-20px_rgba(0,0,0,0.6)] outline-none animate-[sheet-slide-in_400ms_cubic-bezier(0.16,1,0.3,1)_forwards] sm:max-w-[520px]"
      >
        {children}
      </div>
      <style>{`
        @keyframes sheet-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes sheet-slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          [aria-modal="true"] *[class*="sheet-"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
