"use client";

import { useEffect, useRef } from "react";

interface PopoverProps {
  open: boolean;
  onClose: () => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}

export function Popover({
  open,
  onClose,
  trigger,
  children,
  align = "left",
  className = "",
}: PopoverProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function onClick(event: MouseEvent) {
      const target = event.target as Node;
      if (!containerRef.current?.contains(target)) {
        onClose();
      }
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(
        'button:not([disabled]), [tabindex]:not([tabindex="-1"]), input, select, textarea, a[href]',
      );
      first?.focus();
    }, 10);
    return () => window.clearTimeout(t);
  }, [open]);

  const alignClass =
    align === "center"
      ? "left-1/2 -translate-x-1/2"
      : align === "right"
        ? "right-0"
        : "left-0";

  return (
    <div ref={containerRef} className="relative inline-flex">
      {trigger}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          className={`absolute top-[calc(100%+10px)] z-50 ${alignClass} ${className}`}
          style={{ animation: "popover-in 220ms cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          {children}
        </div>
      )}
      <style>{`
        @keyframes popover-in {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          [role="dialog"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
