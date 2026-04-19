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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-[2px]"
      onClick={() => close(false)}
    >
      <div
        className="admin-fade-up relative w-full max-w-lg border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)] p-8"
        style={{
          boxShadow:
            "0 30px 80px -20px rgba(0,0,0,0.7), 0 1px 0 0 rgba(245,241,234,0.04) inset",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <span
          aria-hidden
          className={`absolute left-0 top-0 h-full w-[2px] ${
            isDanger
              ? "bg-[color:var(--admin-danger)]"
              : "bg-[color:var(--admin-accent)]"
          }`}
        />
        <p
          className={`admin-mono text-[0.6rem] uppercase tracking-[0.32em] ${
            isDanger
              ? "text-[color:var(--admin-danger-soft)]"
              : "text-[color:var(--admin-accent)]"
          }`}
        >
          {isDanger ? "Action irréversible" : "Confirmation requise"}
        </p>
        <h2 className="admin-serif mt-3 text-[1.75rem] font-normal leading-[1.15] tracking-tight text-[color:var(--admin-text)]">
          {options.title}
        </h2>
        {options.description && (
          <div className="mt-4 text-[0.92rem] leading-relaxed text-[color:var(--admin-text-muted)]">
            {options.description}
          </div>
        )}
        <div className="mt-8 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={() => close(false)}>
            {options.cancelLabel ?? "Annuler"}
          </Button>
          <Button
            variant={isDanger ? "danger" : "primary"}
            onClick={() => close(true)}
          >
            {options.confirmLabel ?? "Confirmer"}
          </Button>
        </div>
      </div>
    </div>
  );
}
