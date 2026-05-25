"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { Button } from "./button";

interface ConfirmDialogOptions {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "primary" | "danger";
}

type Resolver = (value: boolean) => void;

let openDialogRef: ((opts: ConfirmDialogOptions) => Promise<boolean>) | null = null;

export function confirmDialog(options: ConfirmDialogOptions): Promise<boolean> {
  if (!openDialogRef) {
    return Promise.resolve(false);
  }
  return openDialogRef(options);
}

export function ConfirmDialogHost() {
  const [options, setOptions] = useState<ConfirmDialogOptions | null>(null);
  const resolverRef = useRef<Resolver | null>(null);

  useEffect(() => {
    openDialogRef = (opts) => {
      setOptions(opts);
      return new Promise<boolean>((resolve) => {
        resolverRef.current = resolve;
      });
    };
    return () => {
      openDialogRef = null;
    };
  }, []);

  function close(result: boolean) {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setOptions(null);
  }

  useEffect(() => {
    if (!options) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [options]);

  if (!options) return null;

  const isDanger = options.variant === "danger";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={() => close(false)}
    >
      <div
        className="admin-fade-in relative w-full max-w-md overflow-hidden rounded-lg border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.7)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                isDanger
                  ? "bg-[color:var(--admin-danger-dim)] text-[color:var(--admin-danger)]"
                  : "bg-[color:var(--admin-accent-dim)] text-[color:var(--admin-accent)]"
              }`}
            >
              {isDanger ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 7V10M9 13V13.01M9 2L1 15H17L9 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M9 8.5V12.5M9 6V6.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-[0.9375rem] font-semibold text-[color:var(--admin-text)]">
                {options.title}
              </h2>
              {options.description && (
                <div className="mt-1 text-[0.8125rem] leading-relaxed text-[color:var(--admin-text-soft)]">
                  {options.description}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-[color:var(--admin-line)] bg-[color:var(--admin-surface)] px-5 py-3">
          <Button variant="secondary" size="md" onClick={() => close(false)}>
            {options.cancelLabel ?? "Annuler"}
          </Button>
          <Button
            variant={isDanger ? "danger" : "primary"}
            size="md"
            onClick={() => close(true)}
          >
            {options.confirmLabel ?? "Confirmer"}
          </Button>
        </div>
      </div>
    </div>
  );
}
