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

function ToastIcon({ type }: { type: ToastType }) {
  if (type === "success") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-[color:var(--admin-success)]">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.25" />
        <path d="M5 8.2L7 10.2L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "error") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-[color:var(--admin-danger)]">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.25" />
        <path d="M8 4.5V8.5M8 11V11.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-[color:var(--admin-info)]">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.25" />
      <path d="M8 7.5V11.5M8 5V5.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => store.subscribe(setToasts), []);

  return (
    <ToastContext.Provider value={store}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[22rem] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="admin-fade-in pointer-events-auto flex items-start gap-2.5 rounded-lg border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)] px-3.5 py-3 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.5)]"
          >
            <ToastIcon type={t.type} />
            <p className="flex-1 text-[0.8125rem] leading-relaxed text-[color:var(--admin-text)]">
              {t.message}
            </p>
            <button
              type="button"
              onClick={() => store.dismiss(t.id)}
              aria-label="Fermer"
              className="shrink-0 text-[color:var(--admin-text-muted)] transition-colors hover:text-[color:var(--admin-text)]"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
