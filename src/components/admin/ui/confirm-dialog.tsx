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

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={() => close(false)}
    >
      <div
        className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-zinc-100">{options.title}</h2>
        {options.description && (
          <div className="mt-2 text-sm text-zinc-400">{options.description}</div>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => close(false)}>
            {options.cancelLabel ?? "Annuler"}
          </Button>
          <Button
            variant={options.variant === "danger" ? "danger" : "primary"}
            onClick={() => close(true)}
          >
            {options.confirmLabel ?? "Confirmer"}
          </Button>
        </div>
      </div>
    </div>
  );
}
