# Admin Shell + Voitures CRUD — Plan d'Implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Livrer un espace admin professionnel complet permettant aux 2 dirigeants de Prestige Avenue de gérer leur flotte (créer, éditer, supprimer, mettre en avant, réordonner des voitures avec upload d'images).

**Architecture:** Route group `(admin)` avec layout dédié, Server Actions pour toutes les mutations (pas d'API routes), schéma zod partagé client/serveur, upload direct au CDN via tokens signés Vercel Blob, primitives UI maison minimales, reorder drag&drop via @dnd-kit.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict, Prisma, PostgreSQL, Tailwind v4, NextAuth v4, react-hook-form, zod, @vercel/blob, @dnd-kit/core + /sortable.

**Source de vérité:** `docs/superpowers/specs/2026-04-19-admin-shell-cars-crud-design.md`

---

## Prérequis avant de commencer

- [ ] Lire le spec complet
- [ ] Confirmer que le type-check passe avant toute modification : `npx tsc --noEmit`
- [ ] Confirmer que le lint passe : `npm run lint`
- [ ] Noter le SHA de départ : `git rev-parse HEAD`

**Testing:** Aucun framework de test configuré. Vérifications = type-check (`npx tsc --noEmit`) + lint (`npm run lint`) + checks manuels décrits en fin de plan.

**Commits:** Un commit par tâche après type-check OK. Messages en anglais, format `type(scope): summary`.

---

## Structure des fichiers à créer/modifier

### Créer (nouveaux)

```
src/lib/
  admin-auth.ts
  slugify.ts
  blob.ts

src/server/admin/
  cars.schema.ts
  cars.actions.ts
  cars.queries.ts
  upload.actions.ts

src/components/admin/ui/
  button.tsx
  input.tsx
  textarea.tsx
  number-input.tsx
  select.tsx
  switch.tsx
  field.tsx
  toast.tsx
  confirm-dialog.tsx
  image-picker.tsx
  media-gallery.tsx
  tags-input.tsx
  features-editor.tsx

src/components/admin/shell/
  admin-sidebar.tsx
  admin-topbar.tsx
  admin-user-menu.tsx

src/components/admin/cars/
  cars-list.tsx
  cars-list-row.tsx
  cars-filters.tsx
  car-form.tsx
  delete-car-button.tsx
  toggle-featured-switch.tsx

src/app/(admin)/
  layout.tsx
  loading.tsx
  dashboard/page.tsx
  cars/page.tsx
  cars/new/page.tsx
  cars/[id]/edit/page.tsx
  error.tsx
```

### Modifier

- `middleware.ts` — retirer la gate `/admin/*` (remplacée par layout gate)
- `.env.example` — documenter `BLOB_READ_WRITE_TOKEN`
- `package.json` — ajouter `@vercel/blob`, `@dnd-kit/core`, `@dnd-kit/sortable`

### Supprimer

- `src/components/admin/create-car-form.tsx`
- `src/components/admin/car-status-actions.tsx`
- `src/app/admin/layout.tsx` (l'ancien)
- `src/app/admin/page.tsx`
- `src/app/admin/dashboard/page.tsx`
- `src/app/admin/cars/page.tsx`
- `src/app/api/admin/cars/route.ts`
- `src/app/api/admin/cars/[id]/route.ts`

### Conserver inchangé

- `src/app/admin/bookings/**`, `/admin/clients/**`, `/admin/blocked-dates/**`
- `src/app/api/admin/bookings/**`, `/admin/blocked-dates/**`
- `src/lib/permissions.ts`, `src/lib/csrf.ts`, `src/lib/auth.ts`
- Middleware CSRF cookie
- Pages publiques et leurs APIs

---

## Ordre d'exécution

Tâches 1→22. Dépendances linéaires entre tâches (sauf mention contraire). Chaque tâche est autonome et commitable.

---

### Task 1: Installer les dépendances npm

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Installer @vercel/blob**

```bash
npm install @vercel/blob
```

Expected: `@vercel/blob` apparaît dans `dependencies`, pas d'erreur de peer dependency.

- [ ] **Step 2: Installer @dnd-kit**

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

Expected: les 3 packages apparaissent dans `dependencies`.

- [ ] **Step 3: Vérifier que tout compile**

```bash
npx tsc --noEmit
```

Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): add @vercel/blob and @dnd-kit for admin"
```

---

### Task 2: Documenter BLOB_READ_WRITE_TOKEN

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Lire .env.example**

```bash
cat .env.example
```

- [ ] **Step 2: Ajouter la variable Vercel Blob en bas**

Ajouter à la fin du fichier :

```
# Vercel Blob (stockage images voitures)
# Créer un store sur vercel.com > Storage > Blob, puis copier le token
BLOB_READ_WRITE_TOKEN=
```

- [ ] **Step 3: Commit**

```bash
git add .env.example
git commit -m "docs(env): document BLOB_READ_WRITE_TOKEN for image uploads"
```

---

### Task 3: Helper admin-auth

**Files:**
- Create: `src/lib/admin-auth.ts`

- [ ] **Step 1: Créer le helper**

```ts
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export async function requireAdminSessionOrRedirect() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }
  return session;
}
```

- [ ] **Step 2: Vérifier le type-check**

```bash
npx tsc --noEmit
```

Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add src/lib/admin-auth.ts
git commit -m "feat(admin-auth): add requireAdminSessionOrRedirect helper"
```

---

### Task 4: Helper slugify

**Files:**
- Create: `src/lib/slugify.ts`

- [ ] **Step 1: Créer le helper**

```ts
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function buildCarSlug(brand: string, model: string, trim?: string | null): string {
  const parts = [brand, model, trim].filter(Boolean).join(" ");
  return slugify(parts);
}
```

- [ ] **Step 2: Vérifier le type-check**

```bash
npx tsc --noEmit
```

Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add src/lib/slugify.ts
git commit -m "feat(slugify): add slugify helpers for car slugs"
```

---

### Task 5: Helper blob (validation)

**Files:**
- Create: `src/lib/blob.ts`

- [ ] **Step 1: Créer le helper**

```ts
export const ALLOWED_IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export function isAllowedImageMime(mime: string): boolean {
  return (ALLOWED_IMAGE_MIMES as readonly string[]).includes(mime);
}

export function isUnderMaxImageSize(size: number): boolean {
  return size > 0 && size <= MAX_IMAGE_SIZE_BYTES;
}

export function getExtensionFromMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
    default:
      return "bin";
  }
}
```

- [ ] **Step 2: Vérifier le type-check**

```bash
npx tsc --noEmit
```

Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add src/lib/blob.ts
git commit -m "feat(blob): add image mime and size validation helpers"
```

---

### Task 6: Schéma zod partagé cars

**Files:**
- Create: `src/server/admin/cars.schema.ts`

- [ ] **Step 1: Créer le schéma**

```ts
import { CarCategory, CarStatus, FuelType, Transmission } from "@prisma/client";
import { z } from "zod";

export const featureSchema = z.object({
  title: z.string().min(3).max(60),
  body: z.string().min(10).max(300),
});

export const carFormSchema = z.object({
  brand: z.string().min(2).max(50),
  model: z.string().min(1).max(50),
  trim: z.string().max(60).nullable(),
  year: z.number().int().min(1990).max(2030),
  slug: z
    .string()
    .min(3)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug invalide (lettres minuscules, chiffres, tirets)"),
  category: z.enum(CarCategory),
  shortTagline: z.string().max(150).nullable(),

  power: z.number().int().min(40).max(1500),
  transmission: z.enum(Transmission),
  fuelType: z.enum(FuelType),
  seats: z.number().int().min(2).max(9),
  doors: z.number().int().min(2).max(5),

  pricePerDay: z.number().positive().max(100000),
  pricePerKm: z.number().positive().max(100).nullable(),
  includedKmPerDay: z.number().int().positive().max(10000).nullable(),
  weekendPackagePrice: z.number().positive().max(100000).nullable(),
  weekendPackageIncludedKm: z.number().int().positive().max(10000).nullable(),
  depositAmount: z.number().positive().max(1000000),

  minDriverAge: z.number().int().min(18).max(99),
  minLicenseYears: z.number().int().min(0).max(50),

  description: z.string().min(50).max(2000),
  highlights: z.array(z.string().min(3).max(80)).max(8),
  features: z.array(featureSchema).max(10),

  mainImage: z.url(),
  galleryImages: z.array(z.url()).max(12),
  videoUrl: z.url().nullable(),

  status: z.enum(CarStatus),
  isFeatured: z.boolean(),
  displayOrder: z.number().int().min(0).max(9999),
});

export type CarInput = z.infer<typeof carFormSchema>;

export const uploadTokenInputSchema = z.object({
  filename: z.string().min(1).max(200),
  mime: z.string().min(1),
  size: z.number().int().positive(),
  folder: z.string().min(1).max(80),
});

export type UploadTokenInput = z.infer<typeof uploadTokenInputSchema>;
```

- [ ] **Step 2: Vérifier le type-check**

```bash
npx tsc --noEmit
```

Expected: aucune erreur. Si Prisma client pas régénéré, lancer `npx prisma generate`.

- [ ] **Step 3: Commit**

```bash
git add src/server/admin/cars.schema.ts
git commit -m "feat(admin-schema): add shared zod schema for car form"
```

---

### Task 7: Primitive Button

**Files:**
- Create: `src/components/admin/ui/button.tsx`

- [ ] **Step 1: Créer le composant**

```tsx
"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { ButtonHTMLAttributes, forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50",
  {
    variants: {
      variant: {
        primary: "bg-amber-500 text-black hover:bg-amber-400",
        secondary: "border border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800",
        ghost: "text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100",
        danger: "bg-red-600 text-white hover:bg-red-500",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, loading, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={buttonVariants({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
});
```

- [ ] **Step 2: Installer class-variance-authority si manquant**

```bash
npm ls class-variance-authority
```

Si non installé :

```bash
npm install class-variance-authority
```

- [ ] **Step 3: Vérifier le type-check**

```bash
npx tsc --noEmit
```

Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/ui/button.tsx package.json package-lock.json
git commit -m "feat(admin-ui): add Button primitive with variants"
```

---

### Task 8: Primitives Input, Textarea, NumberInput, Select, Switch, Field

**Files:**
- Create: `src/components/admin/ui/input.tsx`
- Create: `src/components/admin/ui/textarea.tsx`
- Create: `src/components/admin/ui/number-input.tsx`
- Create: `src/components/admin/ui/select.tsx`
- Create: `src/components/admin/ui/switch.tsx`
- Create: `src/components/admin/ui/field.tsx`

- [ ] **Step 1: Créer `field.tsx`**

```tsx
import { ReactNode } from "react";

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export function Field({ label, htmlFor, error, hint, required, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-zinc-200">
        {label}
        {required && <span className="ml-1 text-amber-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
      {!error && hint && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Créer `input.tsx`**

```tsx
"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = "", error, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={error || undefined}
      className={`h-10 w-full rounded-lg border bg-black/60 px-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 ${
        error ? "border-red-500" : "border-zinc-700"
      } ${className}`}
      {...props}
    />
  );
});
```

- [ ] **Step 3: Créer `textarea.tsx`**

```tsx
"use client";

import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className = "", error, rows = 4, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={error || undefined}
      className={`w-full rounded-lg border bg-black/60 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 ${
        error ? "border-red-500" : "border-zinc-700"
      } ${className}`}
      {...props}
    />
  );
});
```

- [ ] **Step 4: Créer `number-input.tsx`**

```tsx
"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  error?: boolean;
  unit?: string;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  { className = "", error, unit, ...props },
  ref,
) {
  return (
    <div className="relative">
      <input
        ref={ref}
        type="number"
        inputMode="decimal"
        aria-invalid={error || undefined}
        className={`h-10 w-full rounded-lg border bg-black/60 px-3 pr-14 text-sm text-zinc-100 tabular-nums placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 ${
          error ? "border-red-500" : "border-zinc-700"
        } ${className}`}
        {...props}
      />
      {unit && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
          {unit}
        </span>
      )}
    </div>
  );
});
```

- [ ] **Step 5: Créer `select.tsx`**

```tsx
"use client";

import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  error?: boolean;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className = "", options, error, placeholder, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      aria-invalid={error || undefined}
      className={`h-10 w-full rounded-lg border bg-black/60 px-3 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 ${
        error ? "border-red-500" : "border-zinc-700"
      } ${className}`}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
});
```

- [ ] **Step 6: Créer `switch.tsx`**

```tsx
"use client";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  "aria-label"?: string;
}

export function Switch({ checked, onCheckedChange, disabled, ...props }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={props["aria-label"]}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-amber-500" : "bg-zinc-700"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
```

- [ ] **Step 7: Vérifier le type-check**

```bash
npx tsc --noEmit
```

Expected: aucune erreur.

- [ ] **Step 8: Commit**

```bash
git add src/components/admin/ui/
git commit -m "feat(admin-ui): add form primitives (Input, Textarea, NumberInput, Select, Switch, Field)"
```

---

### Task 9: Primitives Toast + ConfirmDialog

**Files:**
- Create: `src/components/admin/ui/toast.tsx`
- Create: `src/components/admin/ui/confirm-dialog.tsx`

- [ ] **Step 1: Créer `toast.tsx` avec store global**

```tsx
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
    return () => this.listeners.delete(listener);
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
```

- [ ] **Step 2: Créer `confirm-dialog.tsx`**

```tsx
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
```

- [ ] **Step 3: Vérifier le type-check**

```bash
npx tsc --noEmit
```

Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/ui/toast.tsx src/components/admin/ui/confirm-dialog.tsx
git commit -m "feat(admin-ui): add Toast provider and ConfirmDialog host"
```

---

### Task 10: Shell admin (sidebar, topbar, user-menu)

**Files:**
- Create: `src/components/admin/shell/admin-sidebar.tsx`
- Create: `src/components/admin/shell/admin-topbar.tsx`
- Create: `src/components/admin/shell/admin-user-menu.tsx`

- [ ] **Step 1: Créer `admin-sidebar.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/cars", label: "Voitures" },
  { href: "/admin/bookings", label: "Réservations" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/blocked-dates", label: "Dates bloquées" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-zinc-800 bg-zinc-950 lg:block">
      <div className="flex h-16 items-center border-b border-zinc-800 px-6">
        <Link href="/admin/dashboard" className="text-sm font-semibold tracking-wide text-white">
          Prestige Avenue
        </Link>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {LINKS.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-amber-500 text-black"
                  : "text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 2: Créer `admin-user-menu.tsx`**

```tsx
"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

interface AdminUserMenuProps {
  name: string | null | undefined;
  email: string | null | undefined;
}

export function AdminUserMenu({ name, email }: AdminUserMenuProps) {
  const [open, setOpen] = useState(false);
  const initials = (name ?? email ?? "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-2 pr-3 text-sm text-zinc-200 hover:bg-zinc-800"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-xs font-semibold text-black">
          {initials}
        </span>
        <span className="hidden max-w-[160px] truncate md:block">{email}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-zinc-800 bg-zinc-950 py-1 shadow-xl">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="block w-full px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-900"
            >
              Déconnexion
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Créer `admin-topbar.tsx`**

```tsx
import { AdminUserMenu } from "./admin-user-menu";

interface AdminTopbarProps {
  userName: string | null | undefined;
  userEmail: string | null | undefined;
}

export function AdminTopbar({ userName, userEmail }: AdminTopbarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6">
      <div className="text-sm text-zinc-400">Espace dirigeant</div>
      <AdminUserMenu name={userName} email={userEmail} />
    </header>
  );
}
```

- [ ] **Step 4: Vérifier le type-check**

```bash
npx tsc --noEmit
```

Expected: aucune erreur.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/shell/
git commit -m "feat(admin-shell): add sidebar, topbar and user menu"
```

---

### Task 11: Layout admin + loading + error boundary

**Files:**
- Create: `src/app/(admin)/layout.tsx`
- Create: `src/app/(admin)/loading.tsx`
- Create: `src/app/(admin)/error.tsx`
- Create: `src/app/(admin)/dashboard/page.tsx`

- [ ] **Step 1: Créer `layout.tsx`**

```tsx
import { AdminSidebar } from "@/components/admin/shell/admin-sidebar";
import { AdminTopbar } from "@/components/admin/shell/admin-topbar";
import { ConfirmDialogHost } from "@/components/admin/ui/confirm-dialog";
import { ToastProvider } from "@/components/admin/ui/toast";
import { requireAdminSessionOrRedirect } from "@/lib/admin-auth";
import { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireAdminSessionOrRedirect();

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-black text-zinc-100">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar userName={session.user?.name} userEmail={session.user?.email} />
          <main className="flex-1 overflow-x-auto px-6 py-6">{children}</main>
        </div>
      </div>
      <ConfirmDialogHost />
    </ToastProvider>
  );
}
```

- [ ] **Step 2: Créer `loading.tsx`**

```tsx
export default function AdminLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-zinc-500">
      Chargement...
    </div>
  );
}
```

- [ ] **Step 3: Créer `error.tsx`**

```tsx
"use client";

import { Button } from "@/components/admin/ui/button";

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-6">
      <h2 className="text-lg font-semibold text-red-100">Une erreur est survenue</h2>
      <p className="text-sm text-red-200/80">
        Le chargement de cette page a échoué. Vous pouvez réessayer ou revenir au tableau de bord.
      </p>
      <Button variant="secondary" onClick={reset}>
        Réessayer
      </Button>
    </div>
  );
}
```

- [ ] **Step 4: Créer `dashboard/page.tsx` (placeholder pro)**

```tsx
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Tableau de bord</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Vue d&apos;ensemble de l&apos;activité de Prestige Avenue.
        </p>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-8 text-center">
        <p className="text-sm text-zinc-400">
          Les indicateurs clés (chiffre d&apos;affaires, taux d&apos;occupation, réservations à venir)
          arrivent prochainement.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Vérifier le type-check**

```bash
npx tsc --noEmit
```

Expected: aucune erreur.

- [ ] **Step 6: Commit**

```bash
git add src/app/\(admin\)/
git commit -m "feat(admin-shell): add layout, dashboard placeholder, loading, error boundary"
```

---

### Task 12: Retirer la gate admin du middleware

**Files:**
- Modify: `middleware.ts`

- [ ] **Step 1: Remplacer le contenu entier**

```ts
import { CSRF_COOKIE_NAME, generateCsrfToken } from "@/lib/csrf";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function withCsrfCookie(request: NextRequest, response: NextResponse) {
  if (!request.cookies.get(CSRF_COOKIE_NAME)?.value) {
    response.cookies.set(CSRF_COOKIE_NAME, generateCsrfToken(), {
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      httpOnly: false,
    });
  }
  return response;
}

export async function middleware(request: NextRequest) {
  return withCsrfCookie(request, NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
```

- [ ] **Step 2: Vérifier le type-check**

```bash
npx tsc --noEmit
```

Expected: aucune erreur. L'import `getToken` a disparu, aucune autre ref ne doit subsister.

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "refactor(middleware): drop admin gate (handled by layout helper)"
```

---

### Task 13: Supprimer l'ancien shell admin + ses pages

**Files:**
- Delete: `src/app/admin/layout.tsx`
- Delete: `src/app/admin/page.tsx`
- Delete: `src/app/admin/dashboard/page.tsx`
- Delete: `src/app/admin/cars/page.tsx`
- Delete: `src/components/admin/create-car-form.tsx`
- Delete: `src/components/admin/car-status-actions.tsx`

- [ ] **Step 1: Supprimer les fichiers**

```bash
rm src/app/admin/layout.tsx
rm src/app/admin/page.tsx
rm src/app/admin/dashboard/page.tsx
rm src/app/admin/cars/page.tsx
rm src/components/admin/create-car-form.tsx
rm src/components/admin/car-status-actions.tsx
```

- [ ] **Step 2: Vérifier les références cassées**

```bash
npx tsc --noEmit
```

Attendu : erreurs possibles si d'autres pages important `create-car-form` ou `car-status-actions`. Les corriger (elles ne devraient pas exister hors des fichiers supprimés).

- [ ] **Step 3: Si erreur, chercher et supprimer les imports orphelins**

```bash
grep -r "create-car-form\|car-status-actions" src/
```

Supprimer chaque import trouvé (aucun ne devrait rester — c'était utilisé uniquement dans `src/app/admin/cars/page.tsx` qu'on vient de supprimer).

- [ ] **Step 4: Vérifier le type-check final**

```bash
npx tsc --noEmit
```

Expected: aucune erreur.

- [ ] **Step 5: Commit**

```bash
git add -A src/app/admin/ src/components/admin/
git commit -m "chore(admin): remove legacy admin layout and car page"
```

---

### Task 14: Server Action upload (Vercel Blob)

**Files:**
- Create: `src/server/admin/upload.actions.ts`

- [ ] **Step 1: Créer le fichier**

```ts
"use server";

import { requireAdminSessionOrRedirect } from "@/lib/admin-auth";
import {
  getExtensionFromMime,
  isAllowedImageMime,
  isUnderMaxImageSize,
} from "@/lib/blob";
import { uploadTokenInputSchema, type UploadTokenInput } from "./cars.schema";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

export interface ClientUploadTokenPayload {
  token: string;
  pathname: string;
}

export async function getUploadPathname(input: UploadTokenInput): Promise<string> {
  await requireAdminSessionOrRedirect();

  const parsed = uploadTokenInputSchema.parse(input);

  if (!isAllowedImageMime(parsed.mime)) {
    throw new Error("Type de fichier non autorisé.");
  }
  if (!isUnderMaxImageSize(parsed.size)) {
    throw new Error("Fichier trop volumineux (max 5 Mo).");
  }

  const ext = getExtensionFromMime(parsed.mime);
  const uuid = crypto.randomUUID();
  return `cars/${parsed.folder}/${uuid}.${ext}`;
}

export async function generateClientUpload(
  body: HandleUploadBody,
  request: Request,
): Promise<unknown> {
  return handleUpload({
    body,
    request,
    onBeforeGenerateToken: async () => {
      await requireAdminSessionOrRedirect();
      return {
        allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
        maximumSizeInBytes: 5 * 1024 * 1024,
      };
    },
    onUploadCompleted: async () => {
      // no-op: URLs will be persisted via form submission
    },
  });
}
```

- [ ] **Step 2: Créer la route API companion pour `handleUpload` (requis par Vercel Blob client)**

Fichier : `src/app/api/admin/upload/route.ts`

```ts
import { generateClientUpload } from "@/server/admin/upload.actions";
import { HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const jsonResponse = await generateClientUpload(body, request);
    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload refusé.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
```

- [ ] **Step 3: Vérifier le type-check**

```bash
npx tsc --noEmit
```

Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add src/server/admin/upload.actions.ts src/app/api/admin/upload/route.ts
git commit -m "feat(admin-upload): add Vercel Blob upload token endpoint"
```

---

### Task 15: Primitives ImagePicker + MediaGallery

**Files:**
- Create: `src/components/admin/ui/image-picker.tsx`
- Create: `src/components/admin/ui/media-gallery.tsx`

- [ ] **Step 1: Créer `image-picker.tsx`**

```tsx
"use client";

import { upload } from "@vercel/blob/client";
import Image from "next/image";
import { useRef, useState } from "react";
import { Button } from "./button";
import { toast } from "./toast";

interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  folder: string;
}

export function ImagePicker({ value, onChange, folder }: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Seules les images sont acceptées.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Fichier trop volumineux (max 5 Mo).");
      return;
    }

    setUploading(true);
    try {
      const blob = await upload(`${folder}/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
      });
      onChange(blob.url);
      toast.success("Image importée.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur d'upload.";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      {value ? (
        <div className="relative h-48 w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
          <Image src={value} alt="Preview" fill className="object-cover" unoptimized />
          <div className="absolute bottom-2 right-2 flex gap-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={uploading}
              onClick={() => inputRef.current?.click()}
            >
              Remplacer
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => onChange("")}
            >
              Retirer
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-48 w-full items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-950 text-sm text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
        >
          {uploading ? "Upload en cours..." : "Cliquer pour importer une image"}
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Créer `media-gallery.tsx`**

```tsx
"use client";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { upload } from "@vercel/blob/client";
import Image from "next/image";
import { useRef, useState } from "react";
import { Button } from "./button";
import { toast } from "./toast";

interface MediaGalleryProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder: string;
  maxItems?: number;
}

function SortableItem({ url, onRemove }: { url: string; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: url });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="group relative h-32 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950"
    >
      <div {...attributes} {...listeners} className="absolute inset-0 cursor-grab">
        <Image src={url} alt="" fill className="object-cover" unoptimized />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 rounded bg-black/70 px-2 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
      >
        Retirer
      </button>
    </div>
  );
}

export function MediaGallery({ value, onChange, folder, maxItems = 12 }: MediaGalleryProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  async function handleFiles(files: FileList) {
    const remaining = maxItems - value.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${maxItems} images.`);
      return;
    }
    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of toUpload) {
        if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
          toast.error(`Fichier ignoré : ${file.name}`);
          continue;
        }
        const blob = await upload(`${folder}/${file.name}`, file, {
          access: "public",
          handleUploadUrl: "/api/admin/upload",
        });
        urls.push(blob.url);
      }
      if (urls.length) {
        onChange([...value, ...urls]);
        toast.success(`${urls.length} image(s) importée(s).`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur d'upload.";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = value.indexOf(String(active.id));
    const newIndex = value.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    onChange(arrayMove(value, oldIndex, newIndex));
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={value} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {value.map((url) => (
              <SortableItem
                key={url}
                url={url}
                onRemove={() => onChange(value.filter((u) => u !== url))}
              />
            ))}
            {value.length < maxItems && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="flex h-32 items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-950 text-xs text-zinc-400 hover:border-zinc-500"
              >
                {uploading ? "Upload..." : "Ajouter"}
              </button>
            )}
          </div>
        </SortableContext>
      </DndContext>
      <p className="text-xs text-zinc-500">
        {value.length}/{maxItems} images · Glissez-déposez pour réordonner
      </p>
      <Button type="button" variant="secondary" size="sm" onClick={() => onChange([])}>
        Tout retirer
      </Button>
    </div>
  );
}
```

- [ ] **Step 3: Vérifier le type-check**

```bash
npx tsc --noEmit
```

Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/ui/image-picker.tsx src/components/admin/ui/media-gallery.tsx
git commit -m "feat(admin-ui): add ImagePicker and MediaGallery with Vercel Blob upload"
```

---

### Task 16: Primitives TagsInput + FeaturesEditor

**Files:**
- Create: `src/components/admin/ui/tags-input.tsx`
- Create: `src/components/admin/ui/features-editor.tsx`

- [ ] **Step 1: Créer `tags-input.tsx`**

```tsx
"use client";

import { KeyboardEvent, useState } from "react";
import { Input } from "./input";

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  maxItems?: number;
  placeholder?: string;
}

export function TagsInput({
  value,
  onChange,
  maxItems = 8,
  placeholder = "Ajouter puis Entrée",
}: TagsInputProps) {
  const [draft, setDraft] = useState("");

  function commit() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (value.includes(trimmed)) {
      setDraft("");
      return;
    }
    if (value.length >= maxItems) return;
    onChange([...value, trimmed]);
    setDraft("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="text-zinc-500 hover:text-zinc-100"
              aria-label={`Retirer ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      {value.length < maxItems && (
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={commit}
          placeholder={placeholder}
        />
      )}
      <p className="text-xs text-zinc-500">
        {value.length}/{maxItems}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Créer `features-editor.tsx`**

```tsx
"use client";

import { Button } from "./button";
import { Field } from "./field";
import { Input } from "./input";
import { Textarea } from "./textarea";

export interface FeatureItem {
  title: string;
  body: string;
}

interface FeaturesEditorProps {
  value: FeatureItem[];
  onChange: (items: FeatureItem[]) => void;
  maxItems?: number;
}

export function FeaturesEditor({ value, onChange, maxItems = 10 }: FeaturesEditorProps) {
  function update(index: number, patch: Partial<FeatureItem>) {
    onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function add() {
    if (value.length >= maxItems) return;
    onChange([...value, { title: "", body: "" }]);
  }

  return (
    <div className="space-y-3">
      {value.map((item, i) => (
        <div key={i} className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
          <Field label={`Titre ${i + 1}`}>
            <Input
              value={item.title}
              onChange={(e) => update(i, { title: e.target.value })}
              placeholder="Sécurité augmentée"
            />
          </Field>
          <Field label="Description">
            <Textarea
              rows={3}
              value={item.body}
              onChange={(e) => update(i, { body: e.target.value })}
              placeholder="Expliquez cet équipement en 1-2 phrases."
            />
          </Field>
          <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)}>
            Supprimer cet équipement
          </Button>
        </div>
      ))}
      {value.length < maxItems && (
        <Button type="button" variant="secondary" size="sm" onClick={add}>
          + Ajouter un équipement
        </Button>
      )}
      <p className="text-xs text-zinc-500">
        {value.length}/{maxItems}
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Vérifier le type-check**

```bash
npx tsc --noEmit
```

Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/ui/tags-input.tsx src/components/admin/ui/features-editor.tsx
git commit -m "feat(admin-ui): add TagsInput and FeaturesEditor"
```

---

### Task 17: Server Actions cars (CRUD + toggle + reorder)

**Files:**
- Create: `src/server/admin/cars.queries.ts`
- Create: `src/server/admin/cars.actions.ts`

- [ ] **Step 1: Créer `cars.queries.ts`**

```ts
import { prisma } from "@/lib/prisma";

export async function listCarsForAdmin() {
  return prisma.car.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getCarForAdmin(id: string) {
  return prisma.car.findUnique({ where: { id } });
}
```

- [ ] **Step 2: Créer `cars.actions.ts`**

```ts
"use server";

import { requireAdminSessionOrRedirect } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { carFormSchema, type CarInput } from "./cars.schema";

function toPrismaData(input: CarInput) {
  return {
    brand: input.brand,
    model: input.model,
    trim: input.trim,
    year: input.year,
    slug: input.slug,
    category: input.category,
    shortTagline: input.shortTagline,
    power: input.power,
    transmission: input.transmission,
    fuelType: input.fuelType,
    seats: input.seats,
    doors: input.doors,
    pricePerDay: new Prisma.Decimal(input.pricePerDay),
    pricePerKm: input.pricePerKm !== null ? new Prisma.Decimal(input.pricePerKm) : null,
    includedKmPerDay: input.includedKmPerDay,
    weekendPackagePrice:
      input.weekendPackagePrice !== null ? new Prisma.Decimal(input.weekendPackagePrice) : null,
    weekendPackageIncludedKm: input.weekendPackageIncludedKm,
    depositAmount: new Prisma.Decimal(input.depositAmount),
    minDriverAge: input.minDriverAge,
    minLicenseYears: input.minLicenseYears,
    description: input.description,
    highlights: input.highlights,
    features: input.features,
    mainImage: input.mainImage,
    galleryImages: input.galleryImages,
    videoUrl: input.videoUrl,
    status: input.status,
    isFeatured: input.isFeatured,
    displayOrder: input.displayOrder,
  };
}

function revalidateCarSurfaces() {
  revalidatePath("/admin/cars");
  revalidatePath("/cars");
  revalidatePath("/");
}

export async function createCar(input: CarInput): Promise<{ id: string }> {
  await requireAdminSessionOrRedirect();
  const parsed = carFormSchema.parse(input);

  try {
    const created = await prisma.car.create({ data: toPrismaData(parsed) });
    revalidateCarSurfaces();
    return { id: created.id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("Ce slug est déjà utilisé.");
    }
    throw error;
  }
}

export async function updateCar(id: string, input: CarInput): Promise<void> {
  await requireAdminSessionOrRedirect();
  const parsed = carFormSchema.parse(input);

  try {
    await prisma.car.update({ where: { id }, data: toPrismaData(parsed) });
    revalidateCarSurfaces();
    revalidatePath(`/cars/${id}`);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("Ce slug est déjà utilisé.");
    }
    throw error;
  }
}

export async function deleteCar(id: string): Promise<{ softDeleted: boolean }> {
  await requireAdminSessionOrRedirect();

  const bookingCount = await prisma.booking.count({ where: { carId: id } });
  if (bookingCount > 0) {
    await prisma.car.update({ where: { id }, data: { status: "DISABLED" } });
    revalidateCarSurfaces();
    return { softDeleted: true };
  }

  await prisma.$transaction([
    prisma.blockedDate.deleteMany({ where: { carId: id } }),
    prisma.car.delete({ where: { id } }),
  ]);
  revalidateCarSurfaces();
  return { softDeleted: false };
}

export async function toggleCarFeatured(id: string): Promise<void> {
  await requireAdminSessionOrRedirect();
  const car = await prisma.car.findUnique({ where: { id }, select: { isFeatured: true } });
  if (!car) throw new Error("Véhicule introuvable.");
  await prisma.car.update({ where: { id }, data: { isFeatured: !car.isFeatured } });
  revalidateCarSurfaces();
}

export async function reorderCars(orderedIds: string[]): Promise<void> {
  await requireAdminSessionOrRedirect();
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.car.update({ where: { id }, data: { displayOrder: index + 1 } }),
    ),
  );
  revalidateCarSurfaces();
}
```

- [ ] **Step 3: Vérifier le type-check**

```bash
npx tsc --noEmit
```

Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add src/server/admin/cars.queries.ts src/server/admin/cars.actions.ts
git commit -m "feat(admin-cars): add CRUD, toggle featured and reorder server actions"
```

---

### Task 18: Composants cars — toggle, delete button

**Files:**
- Create: `src/components/admin/cars/toggle-featured-switch.tsx`
- Create: `src/components/admin/cars/delete-car-button.tsx`

- [ ] **Step 1: Créer `toggle-featured-switch.tsx`**

```tsx
"use client";

import { Switch } from "@/components/admin/ui/switch";
import { toast } from "@/components/admin/ui/toast";
import { toggleCarFeatured } from "@/server/admin/cars.actions";
import { useState, useTransition } from "react";

interface ToggleFeaturedSwitchProps {
  carId: string;
  initial: boolean;
}

export function ToggleFeaturedSwitch({ carId, initial }: ToggleFeaturedSwitchProps) {
  const [checked, setChecked] = useState(initial);
  const [pending, startTransition] = useTransition();

  function onChange(next: boolean) {
    setChecked(next);
    startTransition(async () => {
      try {
        await toggleCarFeatured(carId);
      } catch (err) {
        setChecked(!next);
        const msg = err instanceof Error ? err.message : "Erreur.";
        toast.error(msg);
      }
    });
  }

  return (
    <Switch
      checked={checked}
      onCheckedChange={onChange}
      disabled={pending}
      aria-label="Mettre en avant"
    />
  );
}
```

- [ ] **Step 2: Créer `delete-car-button.tsx`**

```tsx
"use client";

import { Button } from "@/components/admin/ui/button";
import { confirmDialog } from "@/components/admin/ui/confirm-dialog";
import { toast } from "@/components/admin/ui/toast";
import { deleteCar } from "@/server/admin/cars.actions";
import { useTransition } from "react";

interface DeleteCarButtonProps {
  carId: string;
  carLabel: string;
  hasBookings: boolean;
}

export function DeleteCarButton({ carId, carLabel, hasBookings }: DeleteCarButtonProps) {
  const [pending, startTransition] = useTransition();

  async function onClick() {
    const confirmed = await confirmDialog({
      title: `Supprimer ${carLabel} ?`,
      description: hasBookings
        ? "Cette voiture sera désactivée et cachée du catalogue. Les réservations existantes sont conservées."
        : "Cette voiture sera définitivement supprimée.",
      confirmLabel: hasBookings ? "Désactiver" : "Supprimer",
      variant: "danger",
    });
    if (!confirmed) return;

    startTransition(async () => {
      try {
        const { softDeleted } = await deleteCar(carId);
        toast.success(softDeleted ? "Véhicule désactivé." : "Véhicule supprimé.");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erreur.";
        toast.error(msg);
      }
    });
  }

  return (
    <Button variant="ghost" size="sm" onClick={onClick} loading={pending}>
      Supprimer
    </Button>
  );
}
```

- [ ] **Step 3: Vérifier le type-check**

```bash
npx tsc --noEmit
```

Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/cars/toggle-featured-switch.tsx src/components/admin/cars/delete-car-button.tsx
git commit -m "feat(admin-cars): add feature toggle and delete button components"
```

---

### Task 19: Composants cars — liste (filters + row + list)

**Files:**
- Create: `src/components/admin/cars/cars-filters.tsx`
- Create: `src/components/admin/cars/cars-list-row.tsx`
- Create: `src/components/admin/cars/cars-list.tsx`

- [ ] **Step 1: Créer `cars-filters.tsx`**

```tsx
"use client";

import { Input } from "@/components/admin/ui/input";
import { Select } from "@/components/admin/ui/select";
import { CarStatus } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const STATUS_OPTIONS = [
  { value: "", label: "Tous statuts" },
  { value: "AVAILABLE", label: "Disponible" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "DISABLED", label: "Désactivée" },
] satisfies { value: string | CarStatus; label: string }[];

const FEATURED_OPTIONS = [
  { value: "", label: "Toutes" },
  { value: "yes", label: "Mises en avant" },
  { value: "no", label: "Hors mise en avant" },
];

export function CarsFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.replace(`/admin/cars?${next.toString()}`);
    },
    [params, router],
  );

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-[220px] flex-1">
        <label className="mb-1 block text-xs text-zinc-500">Recherche</label>
        <Input
          defaultValue={params.get("q") ?? ""}
          placeholder="Marque, modèle, slug"
          onChange={(e) => update("q", e.target.value)}
        />
      </div>
      <div className="w-48">
        <label className="mb-1 block text-xs text-zinc-500">Statut</label>
        <Select
          options={STATUS_OPTIONS}
          defaultValue={params.get("status") ?? ""}
          onChange={(e) => update("status", e.target.value)}
        />
      </div>
      <div className="w-48">
        <label className="mb-1 block text-xs text-zinc-500">Mise en avant</label>
        <Select
          options={FEATURED_OPTIONS}
          defaultValue={params.get("featured") ?? ""}
          onChange={(e) => update("featured", e.target.value)}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Créer `cars-list-row.tsx`**

```tsx
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Car, CarStatus } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { DeleteCarButton } from "./delete-car-button";
import { ToggleFeaturedSwitch } from "./toggle-featured-switch";

const STATUS_STYLE: Record<CarStatus, { label: string; dot: string }> = {
  AVAILABLE: { label: "Disponible", dot: "bg-emerald-500" },
  MAINTENANCE: { label: "Maintenance", dot: "bg-amber-500" },
  DISABLED: { label: "Désactivée", dot: "bg-red-500" },
};

interface CarsListRowProps {
  car: Car;
  bookingCount: number;
}

export function CarsListRow({ car, bookingCount }: CarsListRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: car.id });

  const statusStyle = STATUS_STYLE[car.status];

  return (
    <tr
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
      className="border-b border-zinc-800 hover:bg-zinc-900/50"
    >
      <td className="w-10 px-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab text-zinc-500 hover:text-zinc-200"
          aria-label="Réordonner"
        >
          ⋮⋮
        </button>
      </td>
      <td className="w-16 px-2 py-3">
        <div className="relative h-12 w-12 overflow-hidden rounded-md bg-zinc-900">
          {car.mainImage && (
            <Image src={car.mainImage} alt="" fill className="object-cover" unoptimized />
          )}
        </div>
      </td>
      <td className="px-3 py-3">
        <div className="font-medium text-zinc-100">
          {car.brand} {car.model}
          {car.trim ? ` — ${car.trim}` : ""}
        </div>
        <div className="text-xs text-zinc-500">{car.slug}</div>
      </td>
      <td className="px-3 py-3 text-xs uppercase tracking-wide text-zinc-400">
        {car.category}
      </td>
      <td className="px-3 py-3">
        <span className="inline-flex items-center gap-1.5 text-xs text-zinc-300">
          <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
          {statusStyle.label}
        </span>
      </td>
      <td className="px-3 py-3 text-right tabular-nums text-zinc-200">
        {Number(car.pricePerDay).toFixed(2)} €
      </td>
      <td className="px-3 py-3 text-right tabular-nums text-zinc-200">
        {car.weekendPackagePrice ? `${Number(car.weekendPackagePrice).toFixed(0)} €` : "—"}
      </td>
      <td className="px-3 py-3 text-center">
        <ToggleFeaturedSwitch carId={car.id} initial={car.isFeatured} />
      </td>
      <td className="px-3 py-3">
        <div className="flex justify-end gap-1">
          <Link href={`/admin/cars/${car.id}/edit`}>
            <Button variant="secondary" size="sm">
              Éditer
            </Button>
          </Link>
          <DeleteCarButton
            carId={car.id}
            carLabel={`${car.brand} ${car.model}`}
            hasBookings={bookingCount > 0}
          />
        </div>
      </td>
    </tr>
  );
}
```

- [ ] **Step 3: Créer `cars-list.tsx`**

```tsx
"use client";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { toast } from "@/components/admin/ui/toast";
import { reorderCars } from "@/server/admin/cars.actions";
import { Car } from "@prisma/client";
import { useState, useTransition } from "react";
import { CarsListRow } from "./cars-list-row";

interface CarsListProps {
  cars: (Car & { _bookingCount: number })[];
}

export function CarsList({ cars }: CarsListProps) {
  const [items, setItems] = useState(cars);
  const [, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((c) => c.id === active.id);
    const newIndex = items.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const next = arrayMove(items, oldIndex, newIndex);
    const previous = items;
    setItems(next);
    startTransition(async () => {
      try {
        await reorderCars(next.map((c) => c.id));
        toast.success("Ordre mis à jour.");
      } catch (err) {
        setItems(previous);
        const msg = err instanceof Error ? err.message : "Erreur.";
        toast.error(msg);
      }
    });
  }

  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 p-10 text-center text-sm text-zinc-400">
        Aucune voiture ne correspond à ces filtres.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="w-full text-sm">
        <thead className="bg-zinc-950 text-left text-xs uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="w-10 px-2 py-3"></th>
            <th className="w-16 px-2 py-3"></th>
            <th className="px-3 py-3">Véhicule</th>
            <th className="px-3 py-3">Catégorie</th>
            <th className="px-3 py-3">Statut</th>
            <th className="px-3 py-3 text-right">Prix/jour</th>
            <th className="px-3 py-3 text-right">Week-end</th>
            <th className="px-3 py-3 text-center">Featured</th>
            <th className="px-3 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              {items.map((car) => (
                <CarsListRow key={car.id} car={car} bookingCount={car._bookingCount} />
              ))}
            </SortableContext>
          </DndContext>
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: Vérifier le type-check**

```bash
npx tsc --noEmit
```

Expected: aucune erreur.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/cars/cars-filters.tsx src/components/admin/cars/cars-list-row.tsx src/components/admin/cars/cars-list.tsx
git commit -m "feat(admin-cars): add list, row and filters components"
```

---

### Task 20: Page liste `/admin/cars`

**Files:**
- Create: `src/app/(admin)/cars/page.tsx`

- [ ] **Step 1: Créer la page**

```tsx
import { Button } from "@/components/admin/ui/button";
import { CarsFilters } from "@/components/admin/cars/cars-filters";
import { CarsList } from "@/components/admin/cars/cars-list";
import { prisma } from "@/lib/prisma";
import { CarStatus, Prisma } from "@prisma/client";
import Link from "next/link";

interface SearchParams {
  q?: string;
  status?: string;
  featured?: string;
}

export default async function AdminCarsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const where: Prisma.CarWhereInput = {};
  if (sp.q) {
    where.OR = [
      { brand: { contains: sp.q, mode: "insensitive" } },
      { model: { contains: sp.q, mode: "insensitive" } },
      { slug: { contains: sp.q, mode: "insensitive" } },
    ];
  }
  if (sp.status && ["AVAILABLE", "MAINTENANCE", "DISABLED"].includes(sp.status)) {
    where.status = sp.status as CarStatus;
  }
  if (sp.featured === "yes") where.isFeatured = true;
  if (sp.featured === "no") where.isFeatured = false;

  const cars = await prisma.car.findMany({
    where,
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { bookings: true } } },
  });

  const withBookingCount = cars.map((c) => ({
    ...c,
    _bookingCount: c._count.bookings,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Voitures</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Gérez votre flotte : ajoutez, modifiez, réordonnez.
          </p>
        </div>
        <Link href="/admin/cars/new">
          <Button>+ Nouveau véhicule</Button>
        </Link>
      </div>
      <CarsFilters />
      <CarsList cars={withBookingCount} />
    </div>
  );
}
```

- [ ] **Step 2: Vérifier le type-check**

```bash
npx tsc --noEmit
```

Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(admin\)/cars/page.tsx
git commit -m "feat(admin-cars): add list page with filters and reorder"
```

---

### Task 21: CarForm partagé

**Files:**
- Create: `src/components/admin/cars/car-form.tsx`

- [ ] **Step 1: Créer le composant**

```tsx
"use client";

import { Button } from "@/components/admin/ui/button";
import { FeaturesEditor } from "@/components/admin/ui/features-editor";
import { Field } from "@/components/admin/ui/field";
import { ImagePicker } from "@/components/admin/ui/image-picker";
import { Input } from "@/components/admin/ui/input";
import { MediaGallery } from "@/components/admin/ui/media-gallery";
import { NumberInput } from "@/components/admin/ui/number-input";
import { Select } from "@/components/admin/ui/select";
import { Switch } from "@/components/admin/ui/switch";
import { TagsInput } from "@/components/admin/ui/tags-input";
import { Textarea } from "@/components/admin/ui/textarea";
import { toast } from "@/components/admin/ui/toast";
import { buildCarSlug } from "@/lib/slugify";
import { createCar, updateCar } from "@/server/admin/cars.actions";
import { carFormSchema, type CarInput } from "@/server/admin/cars.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CarCategory, CarStatus, FuelType, Transmission } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";

const CATEGORY_OPTIONS = Object.values(CarCategory).map((v) => ({ value: v, label: v }));
const TRANSMISSION_OPTIONS = Object.values(Transmission).map((v) => ({ value: v, label: v }));
const FUEL_OPTIONS = Object.values(FuelType).map((v) => ({ value: v, label: v }));
const STATUS_OPTIONS = Object.values(CarStatus).map((v) => ({ value: v, label: v }));

interface CarFormProps {
  mode: "create" | "edit";
  carId?: string;
  initial: CarInput;
  uploadFolder: string;
}

export function CarForm({ mode, carId, initial, uploadFolder }: CarFormProps) {
  const router = useRouter();
  const form = useForm<CarInput>({
    resolver: zodResolver(carFormSchema),
    defaultValues: initial,
  });
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const brand = watch("brand");
  const model = watch("model");
  const trim = watch("trim");

  async function onSubmit(values: CarInput) {
    try {
      if (mode === "create") {
        await createCar(values);
        toast.success("Véhicule ajouté.");
        router.replace("/admin/cars");
      } else if (carId) {
        await updateCar(carId, values);
        toast.success("Modifications enregistrées.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur.";
      toast.error(msg);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-10">
      <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Identité</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Marque" required error={errors.brand?.message}>
            <Input {...register("brand")} error={!!errors.brand} />
          </Field>
          <Field label="Modèle" required error={errors.model?.message}>
            <Input {...register("model")} error={!!errors.model} />
          </Field>
          <Field label="Finition" error={errors.trim?.message}>
            <Input {...register("trim")} error={!!errors.trim} />
          </Field>
          <Field label="Année" required error={errors.year?.message}>
            <NumberInput
              {...register("year", { valueAsNumber: true })}
              error={!!errors.year}
              min={1990}
              max={2030}
            />
          </Field>
          <Field label="Slug" required error={errors.slug?.message} hint="lettres, chiffres, tirets">
            <div className="flex gap-2">
              <Input {...register("slug")} error={!!errors.slug} />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setValue("slug", buildCarSlug(brand, model, trim))}
              >
                Auto
              </Button>
            </div>
          </Field>
          <Field label="Catégorie" required error={errors.category?.message}>
            <Select
              {...register("category")}
              options={CATEGORY_OPTIONS}
              error={!!errors.category}
            />
          </Field>
          <Field label="Accroche courte" error={errors.shortTagline?.message}>
            <Input {...register("shortTagline")} error={!!errors.shortTagline} />
          </Field>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Spécifications</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Puissance" required error={errors.power?.message}>
            <NumberInput {...register("power", { valueAsNumber: true })} unit="ch" error={!!errors.power} />
          </Field>
          <Field label="Transmission" required error={errors.transmission?.message}>
            <Select {...register("transmission")} options={TRANSMISSION_OPTIONS} error={!!errors.transmission} />
          </Field>
          <Field label="Carburant" required error={errors.fuelType?.message}>
            <Select {...register("fuelType")} options={FUEL_OPTIONS} error={!!errors.fuelType} />
          </Field>
          <Field label="Sièges" required error={errors.seats?.message}>
            <NumberInput {...register("seats", { valueAsNumber: true })} error={!!errors.seats} min={2} max={9} />
          </Field>
          <Field label="Portes" required error={errors.doors?.message}>
            <NumberInput {...register("doors", { valueAsNumber: true })} error={!!errors.doors} min={2} max={5} />
          </Field>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Tarifs</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Prix / jour" required error={errors.pricePerDay?.message}>
            <NumberInput
              {...register("pricePerDay", { valueAsNumber: true })}
              unit="€"
              step="0.01"
              error={!!errors.pricePerDay}
            />
          </Field>
          <Field label="Prix / km" error={errors.pricePerKm?.message}>
            <Controller
              control={control}
              name="pricePerKm"
              render={({ field }) => (
                <NumberInput
                  unit="€/km"
                  step="0.01"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value === "" ? null : Number(e.target.value))
                  }
                  error={!!errors.pricePerKm}
                />
              )}
            />
          </Field>
          <Field label="Km inclus / jour" error={errors.includedKmPerDay?.message}>
            <Controller
              control={control}
              name="includedKmPerDay"
              render={({ field }) => (
                <NumberInput
                  unit="km"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value === "" ? null : Number(e.target.value))
                  }
                  error={!!errors.includedKmPerDay}
                />
              )}
            />
          </Field>
          <Field label="Forfait week-end 72h" error={errors.weekendPackagePrice?.message}>
            <Controller
              control={control}
              name="weekendPackagePrice"
              render={({ field }) => (
                <NumberInput
                  unit="€"
                  step="0.01"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value === "" ? null : Number(e.target.value))
                  }
                  error={!!errors.weekendPackagePrice}
                />
              )}
            />
          </Field>
          <Field label="Km inclus week-end" error={errors.weekendPackageIncludedKm?.message}>
            <Controller
              control={control}
              name="weekendPackageIncludedKm"
              render={({ field }) => (
                <NumberInput
                  unit="km"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value === "" ? null : Number(e.target.value))
                  }
                  error={!!errors.weekendPackageIncludedKm}
                />
              )}
            />
          </Field>
          <Field label="Caution" required error={errors.depositAmount?.message}>
            <NumberInput
              {...register("depositAmount", { valueAsNumber: true })}
              unit="€"
              step="0.01"
              error={!!errors.depositAmount}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Conditions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Âge min du conducteur" required error={errors.minDriverAge?.message}>
            <NumberInput
              {...register("minDriverAge", { valueAsNumber: true })}
              unit="ans"
              error={!!errors.minDriverAge}
            />
          </Field>
          <Field label="Années de permis min" required error={errors.minLicenseYears?.message}>
            <NumberInput
              {...register("minLicenseYears", { valueAsNumber: true })}
              unit="ans"
              error={!!errors.minLicenseYears}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Présentation</h2>
        <Field label="Description" required error={errors.description?.message}>
          <Textarea {...register("description")} error={!!errors.description} rows={6} />
        </Field>
        <Field label="Points forts" hint="8 max, appuyer Entrée pour ajouter">
          <Controller
            control={control}
            name="highlights"
            render={({ field }) => (
              <TagsInput value={field.value} onChange={field.onChange} maxItems={8} />
            )}
          />
        </Field>
        <Field label="Équipements détaillés" hint="10 max">
          <Controller
            control={control}
            name="features"
            render={({ field }) => (
              <FeaturesEditor value={field.value} onChange={field.onChange} maxItems={10} />
            )}
          />
        </Field>
      </section>

      <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Médias</h2>
        <Field label="Image principale" required error={errors.mainImage?.message}>
          <Controller
            control={control}
            name="mainImage"
            render={({ field }) => (
              <ImagePicker value={field.value} onChange={field.onChange} folder={uploadFolder} />
            )}
          />
        </Field>
        <Field label="Galerie" hint="12 max, glisser pour réordonner">
          <Controller
            control={control}
            name="galleryImages"
            render={({ field }) => (
              <MediaGallery value={field.value} onChange={field.onChange} folder={uploadFolder} />
            )}
          />
        </Field>
        <Field label="URL vidéo" error={errors.videoUrl?.message}>
          <Controller
            control={control}
            name="videoUrl"
            render={({ field }) => (
              <Input
                type="url"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
                error={!!errors.videoUrl}
                placeholder="https://..."
              />
            )}
          />
        </Field>
      </section>

      <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Visibilité</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Statut" required error={errors.status?.message}>
            <Select {...register("status")} options={STATUS_OPTIONS} error={!!errors.status} />
          </Field>
          <Field label="Mise en avant">
            <Controller
              control={control}
              name="isFeatured"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-label="Mise en avant"
                />
              )}
            />
          </Field>
          <Field
            label="Ordre d'affichage"
            error={errors.displayOrder?.message}
            hint={mode === "create" ? "Réglable depuis la liste" : undefined}
          >
            <NumberInput
              {...register("displayOrder", { valueAsNumber: true })}
              error={!!errors.displayOrder}
              disabled={mode === "create"}
            />
          </Field>
        </div>
      </section>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Annuler
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {mode === "create" ? "Créer le véhicule" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Vérifier le type-check**

```bash
npx tsc --noEmit
```

Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/cars/car-form.tsx
git commit -m "feat(admin-cars): add shared CarForm for create and edit"
```

---

### Task 22: Pages new + edit + suppression API admin cars legacy

**Files:**
- Create: `src/app/(admin)/cars/new/page.tsx`
- Create: `src/app/(admin)/cars/[id]/edit/page.tsx`
- Delete: `src/app/api/admin/cars/route.ts`
- Delete: `src/app/api/admin/cars/[id]/route.ts`

- [ ] **Step 1: Créer `new/page.tsx`**

```tsx
import { CarForm } from "@/components/admin/cars/car-form";
import { type CarInput } from "@/server/admin/cars.schema";
import { CarCategory, CarStatus, FuelType, Transmission } from "@prisma/client";

const DEFAULT_CAR: CarInput = {
  brand: "",
  model: "",
  trim: null,
  year: 2025,
  slug: "",
  category: CarCategory.CITADINE,
  shortTagline: null,
  power: 100,
  transmission: Transmission.AUTOMATIC,
  fuelType: FuelType.PETROL,
  seats: 5,
  doors: 5,
  pricePerDay: 0,
  pricePerKm: null,
  includedKmPerDay: null,
  weekendPackagePrice: null,
  weekendPackageIncludedKm: null,
  depositAmount: 0,
  minDriverAge: 21,
  minLicenseYears: 2,
  description: "",
  highlights: [],
  features: [],
  mainImage: "",
  galleryImages: [],
  videoUrl: null,
  status: CarStatus.AVAILABLE,
  isFeatured: false,
  displayOrder: 0,
};

export default function NewCarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Nouveau véhicule</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Renseignez les informations. Les champs marqués d&apos;un astérisque sont obligatoires.
        </p>
      </div>
      <CarForm mode="create" initial={DEFAULT_CAR} uploadFolder="new" />
    </div>
  );
}
```

- [ ] **Step 2: Créer `[id]/edit/page.tsx`**

```tsx
import { CarForm } from "@/components/admin/cars/car-form";
import { getCarForAdmin } from "@/server/admin/cars.queries";
import { type CarInput, featureSchema } from "@/server/admin/cars.schema";
import { notFound } from "next/navigation";
import { z } from "zod";

function toFormValues(car: Awaited<ReturnType<typeof getCarForAdmin>>): CarInput {
  if (!car) throw new Error("no car");
  const featuresParsed = z.array(featureSchema).safeParse(car.features);
  return {
    brand: car.brand,
    model: car.model,
    trim: car.trim,
    year: car.year,
    slug: car.slug,
    category: car.category,
    shortTagline: car.shortTagline,
    power: car.power,
    transmission: car.transmission,
    fuelType: car.fuelType,
    seats: car.seats,
    doors: car.doors,
    pricePerDay: Number(car.pricePerDay),
    pricePerKm: car.pricePerKm !== null ? Number(car.pricePerKm) : null,
    includedKmPerDay: car.includedKmPerDay,
    weekendPackagePrice:
      car.weekendPackagePrice !== null ? Number(car.weekendPackagePrice) : null,
    weekendPackageIncludedKm: car.weekendPackageIncludedKm,
    depositAmount: Number(car.depositAmount),
    minDriverAge: car.minDriverAge,
    minLicenseYears: car.minLicenseYears,
    description: car.description,
    highlights: car.highlights,
    features: featuresParsed.success ? featuresParsed.data : [],
    mainImage: car.mainImage,
    galleryImages: car.galleryImages,
    videoUrl: car.videoUrl,
    status: car.status,
    isFeatured: car.isFeatured,
    displayOrder: car.displayOrder,
  };
}

export default async function EditCarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await getCarForAdmin(id);
  if (!car) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">
          Éditer : {car.brand} {car.model}
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Les modifications sont visibles immédiatement sur le site public.
        </p>
      </div>
      <CarForm mode="edit" carId={car.id} initial={toFormValues(car)} uploadFolder={car.id} />
    </div>
  );
}
```

- [ ] **Step 3: Supprimer les API routes admin cars legacy**

```bash
rm src/app/api/admin/cars/route.ts
rm src/app/api/admin/cars/\[id\]/route.ts
```

Puis retirer le dossier si vide :

```bash
rmdir src/app/api/admin/cars/\[id\] 2>/dev/null || true
rmdir src/app/api/admin/cars 2>/dev/null || true
```

- [ ] **Step 4: Vérifier qu'aucun consommateur ne référence les routes supprimées**

```bash
grep -r "api/admin/cars" src/
```

Attendu : aucun résultat. Si résultats, les corriger (pas attendu, mais défense en profondeur).

- [ ] **Step 5: Vérifier le type-check**

```bash
npx tsc --noEmit
```

Expected: aucune erreur.

- [ ] **Step 6: Commit**

```bash
git add -A src/app/\(admin\)/cars/ src/app/api/admin/cars/
git commit -m "feat(admin-cars): add new and edit pages, drop legacy API routes"
```

---

## Self-review du plan

**Spec coverage check:**

| Spec section | Tâche(s) |
|---|---|
| §3 Route group & file structure | 11, 20, 22 |
| §4 Auth gate layout | 3, 11, 12 |
| §4 Upload direct Blob | 5, 14, 15 |
| §5 Primitives UI | 7, 8, 9, 15, 16 |
| §6 Shell (sidebar/topbar/user-menu) | 10, 11 |
| §7 Page liste (tableau, filtres, reorder, toggle, delete) | 18, 19, 20 |
| §8 Page new + edit (form, validation) | 21, 22 |
| §9 Upload Vercel Blob | 14, 15 |
| §10 Server Actions | 17 |
| §11 Schéma zod | 6 |
| §12 Gestion erreurs | 17 (Prisma P2002), 9 (toast), 11 (error.tsx) |
| §13 Cleanup ancien code | 13, 22 |
| §14 Deps npm | 1 |
| §15 Env var | 2 |

**Placeholder scan:** Aucun "TBD/TODO/fill in later". Chaque tâche a son code complet.

**Type consistency:** `CarInput` défini Task 6, utilisé Tasks 17, 21, 22 ✓. `toPrismaData` défini Task 17 (local), consistent. Exports schema (`carFormSchema`, `featureSchema`, `uploadTokenInputSchema`) cohérents. Noms Server Actions (`createCar`, `updateCar`, `deleteCar`, `toggleCarFeatured`, `reorderCars`) cohérents Task 17↔18↔19↔21. `buildCarSlug` défini Task 4, utilisé Task 21. Composants `<Button>`, `<Field>`, etc. cohérents.

**Acceptance criteria coverage:** Les 12 critères sont couverts par les tâches 1→22 et seront testés manuellement après Task 22.

---

## Vérifications manuelles post-Task 22

- [ ] `npm run dev` puis login admin → `/admin/cars` se charge avec les 3 voitures du seed
- [ ] Toggle featured sur Clio 6 → page `/` (homepage) reflète le changement après refresh
- [ ] Drag Clio 5 au-dessus de Clio 6 → `/cars` public affiche le nouvel ordre
- [ ] Édition Clio 6 : changer `pricePerDay` de 34.99 à 35 → `/cars/[id]` public affiche 35 €
- [ ] Créer une 4e voiture test (Peugeot 308 par ex) avec mainImage + 2 images galerie + description remplie → apparaît sur `/admin/cars` et `/cars`
- [ ] Tenter upload `.pdf` → toast erreur immédiat
- [ ] Tenter upload image > 5 Mo → toast erreur
- [ ] Supprimer la voiture test créée (sans booking) → hard delete, disparaît
- [ ] Tenter supprimer Clio 6 (avec bookings éventuels) → dialog "désactivée", clic confirme → passe en DISABLED
- [ ] Déconnexion admin → accès `/admin/cars` → redirect `/admin/login`
- [ ] Submit form sans description → scroll auto + erreur sous le champ
- [ ] Créer 2e voiture avec slug identique → toast "Ce slug est déjà utilisé."

---

## Fin

Plan terminé : 22 tâches, toutes codées en détail, ordre linéaire sans dépendance cachée. Après exécution complète + vérifs manuelles, dispatcher un final code-reviewer sur l'ensemble.
