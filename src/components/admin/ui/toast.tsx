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
    setTimeout(() => this.dismiss(id), 4000);
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

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => store.subscribe(setToasts), []);

  return (
    <ToastContext.Provider value={store}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto rounded-lg border px-4 py-3 text-sm shadow-lg ${
              t.type === "success"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
                : t.type === "error"
                  ? "border-red-500/40 bg-red-500/10 text-red-100"
                  : "border-zinc-700 bg-zinc-900 text-zinc-100"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
