"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

type Listener = (toasts: Toast[]) => void;

class ToastStore {
  private toasts: Toast[] = [];
  private listeners = new Set<Listener>();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.toasts);
    return () => {
      this.listeners.delete(listener);
    };
  }

  push(type: ToastType, message: string) {
    const id = crypto.randomUUID();
    this.toasts = [...this.toasts, { id, type, message }];
    this.emit();
    setTimeout(() => this.dismiss(id), 4200);
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.emit();
  }

  private emit() {
    for (const l of this.listeners) l(this.toasts);
  }
}

const store = new ToastStore();

export const toast = {
  success: (message: string) => store.push("success", message),
  error: (message: string) => store.push("error", message),
  info: (message: string) => store.push("info", message),
};

const ToastContext = createContext<ToastStore>(store);

const LABELS: Record<ToastType, string> = {
  success: "Succès",
  error: "Erreur",
  info: "Information",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => store.subscribe(setToasts), []);

  return (
    <ToastContext.Provider value={store}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex w-[22rem] flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`admin-toast pointer-events-auto border-l-2 bg-[color:var(--admin-bg-elev)]/95 px-5 py-4 backdrop-blur-sm ${
              t.type === "success"
                ? "border-l-[color:var(--admin-accent)]"
                : t.type === "error"
                  ? "border-l-[color:var(--admin-danger)]"
                  : "border-l-[color:var(--admin-text-muted)]"
            }`}
            style={{
              boxShadow:
                "0 14px 40px -10px rgba(0,0,0,0.55), 0 1px 0 0 rgba(245,241,234,0.04) inset",
            }}
          >
            <p
              className={`admin-mono text-[0.58rem] uppercase tracking-[0.32em] ${
                t.type === "success"
                  ? "text-[color:var(--admin-accent)]"
                  : t.type === "error"
                    ? "text-[color:var(--admin-danger-soft)]"
                    : "text-[color:var(--admin-text-muted)]"
              }`}
            >
              {LABELS[t.type]}
            </p>
            <p className="mt-1.5 text-[0.86rem] leading-relaxed text-[color:var(--admin-text)]">
              {t.message}
            </p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
