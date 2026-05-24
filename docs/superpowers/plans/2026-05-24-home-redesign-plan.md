# Home Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refonte complète et "luxe-monochrome" de la page d'accueil de Prestige Avenue avec un système d'animations en 4 couches (entrée hero, smooth scroll, reveal-on-scroll, signatures par section).

**Architecture:** Découpage en server components par section sous `src/components/home/*`. Animations CSS via classes utilitaires + un seul hook client `useRevealOnScroll`. Smooth scroll global via Lenis. Cleanup massif de `globals.css` (suppression de toutes les classes décoratives obsolètes). Composants présentationnels (`CarCard`, `InfoCard`) réécrits complètement.

**Tech Stack:** Next.js 15 App Router · React 19 · Tailwind CSS v4 (theme CSS-first) · TypeScript · `lenis` (~3.6 kB) pour smooth scroll · Fraunces + Inter (déjà chargés via `next/font/google`).

**Spec source:** `docs/superpowers/specs/2026-05-24-home-redesign-design.md`

**Testing approach:** Le projet n'a pas de framework de tests automatisés (confirmé dans `CLAUDE.md`). Chaque tâche se termine par un **checkpoint visuel** : on lance `npm run dev` et on vérifie le rendu dans le navigateur sur `http://localhost:3000`. Les commits sont fréquents pour pouvoir revenir en arrière section par section.

**Branch strategy:** Travailler sur la branche courante. Commits par tâche pour permettre `git revert` ciblé en cas de régression visuelle.

---

## File Structure

### Nouveaux fichiers
| Path | Responsabilité |
|------|---------------|
| `src/hooks/use-reveal-on-scroll.ts` | Hook client : observer une ref, ajouter `.is-visible` au croisement |
| `src/components/layout/smooth-scroll.tsx` | Init Lenis, désactivé en reduced-motion / mobile |
| `src/components/home/section-counter.tsx` | Compteur `— XX / 07` réutilisable (server component) |
| `src/components/home/cta-arrow.tsx` | Flèche "ticker" réutilisable (CSS-only, server component) |
| `src/components/home/word-highlight.tsx` | Texte avec highlight mot-par-mot au scroll (client component) |
| `src/components/home/hero-section.tsx` | Section 01 — hero plein écran |
| `src/components/home/manifesto-section.tsx` | Section 02 — phrase qui s'éclaire |
| `src/components/home/fleet-section.tsx` | Section 03 — 3 car-cards |
| `src/components/home/process-section.tsx` | Section 04 — 3 étapes avec hairline |
| `src/components/home/info-section.tsx` | Section 05 — grille 2x2 |
| `src/components/home/cta-section.tsx` | Section 06 — CTA final |

### Fichiers réécrits
| Path | Nature du changement |
|------|---------------------|
| `src/app/page.tsx` | Orchestrateur de sections (n'importe que les `<*Section />`) |
| `src/app/layout.tsx` | Monte `<SmoothScroll />` |
| `src/app/globals.css` | Cleanup massif + ajout des nouveaux tokens `--ink-*` et utilitaires `.reveal-*` |
| `src/components/cars/car-card.tsx` | Redesign complet — épuration |
| `src/components/ui/info-card.tsx` | API simplifiée (plus d'icon), redesign complet |
| `src/components/layout/site-header.tsx` | Logo en texte Fraunces, scroll behavior |
| `src/components/layout/site-footer.tsx` | Logo géant signature |
| `src/components/hero/hero-video.tsx` | Ajustement opacité (0.78 → 0.55) |
| `src/components/layout/scroll-progress.tsx` | Affinage cosmétique (1px, blanc pur) |

### Fichiers supprimés
| Path | Raison |
|------|--------|
| `src/components/ui/animated-text.tsx` | Toutes ses animations sont remplacées par les classes `.reveal-*` |

### Dépendances ajoutées
- `lenis` (^1.1.x)

---

## Phase 1 — Fondations (tokens, hooks, smooth scroll)

### Task 1: Ajouter les tokens CSS monochrome dans `globals.css`

**Files:**
- Modify: `src/app/globals.css` (lignes 1-27 environ — la zone `:root` et `@theme inline`)

- [ ] **Step 1: Lire le fichier pour repérer la zone exacte des tokens**

Run: ouvre `src/app/globals.css`, repère le bloc `:root { --background: ... }` et le bloc `@theme inline { ... }`.

- [ ] **Step 2: Remplacer le bloc `:root` du haut par les nouveaux tokens monochrome**

Remplacer :
```css
:root {
  --background: #050505;
  --foreground: #f5f5f5;
  --muted: #a1a1aa;
  --panel: #0b0b0d;
  --line: #222327;
  --line-soft: #2e2f35;
  --accent: #f7f7f7;
}
```

Par :
```css
:root {
  --ink-onyx: #050505;
  --ink-surface: #0a0a0c;
  --ink-elevated: #101013;
  --ink-line: #18181b;
  --ink-line-soft: #27272a;
  --ink-dim: #3f3f46;
  --ink-muted: #52525b;
  --ink-soft: #71717a;
  --ink-text-soft: #a1a1aa;
  --ink-text: #e4e4e7;
  --ink-ivory: #fafafa;

  /* Compatibilité — gardés pour ne pas casser l'admin et autres */
  --background: var(--ink-onyx);
  --foreground: var(--ink-ivory);
  --muted: var(--ink-text-soft);
  --panel: var(--ink-surface);
  --line: var(--ink-line);
  --line-soft: var(--ink-line-soft);
  --accent: var(--ink-ivory);
}
```

- [ ] **Step 3: Étendre le bloc `@theme inline` avec les nouveaux tokens**

Dans `@theme inline { ... }`, juste après `--color-accent`, ajouter :
```css
  --color-ink-onyx: var(--ink-onyx);
  --color-ink-surface: var(--ink-surface);
  --color-ink-elevated: var(--ink-elevated);
  --color-ink-line: var(--ink-line);
  --color-ink-line-soft: var(--ink-line-soft);
  --color-ink-dim: var(--ink-dim);
  --color-ink-muted: var(--ink-muted);
  --color-ink-soft: var(--ink-soft);
  --color-ink-text-soft: var(--ink-text-soft);
  --color-ink-text: var(--ink-text);
  --color-ink-ivory: var(--ink-ivory);
```

- [ ] **Step 4: Vérifier que le projet build encore**

Run: `npm run dev` puis ouvrir `http://localhost:3000` dans le navigateur.
Expected: la page d'accueil charge encore (le rendu n'a pas encore changé — on a juste ajouté des tokens). Aucune erreur en console.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(home): introduce ink-* monochrome tokens"
```

---

### Task 2: Cleanup massif de `globals.css` — suppression des animations obsolètes

**Files:**
- Modify: `src/app/globals.css`

Le fichier contient ~960 lignes dont une grosse partie ne sera plus utilisée. On nettoie.

- [ ] **Step 1: Supprimer les classes `.text-*` obsolètes (sauf celles du body global)**

Dans `@layer utilities { ... }`, supprimer entièrement les blocs suivants :
- `.text-light-sweep` et `.text-light-sweep::before`
- `.text-light-sweep-slow` et `.text-light-sweep-slow::before`
- `.text-gradient-mono`
- `.text-blur-reveal`
- `.text-split-reveal` et `.text-split-reveal > *`
- `.text-elastic`
- `.text-3d-perspective`, `.text-3d-tilt`
- `.text-expand`
- `.text-glitch-accent` et ses pseudo-éléments
- `.text-fade-slide`
- `.text-scale-reveal`
- `.text-word-stagger` et tous ses `.word:nth-child(n)` (1 à 6)
- `.text-underline-reveal` et son `::after`

Et supprimer les `@keyframes` correspondants à ces classes :
- `@keyframes text-shimmer`
- `@keyframes light-sweep`
- `@keyframes light-sweep-slow`
- `@keyframes text-blur-reveal`
- `@keyframes text-split-up`
- `@keyframes text-elastic`
- `@keyframes text-3d-reveal`
- `@keyframes text-expand`
- `@keyframes text-glitch-1` et `text-glitch-2`
- `@keyframes text-fade-slide`
- `@keyframes text-scale-reveal`
- `@keyframes text-word-reveal`
- `@keyframes text-underline-expand`

- [ ] **Step 2: Supprimer les utilitaires `.lux-*` qui ne seront plus utilisés**

Supprimer dans `@layer utilities` :
- `.lux-reveal` et `@keyframes lux-reveal`
- `.lux-reveal-x` et `@keyframes lux-reveal-x`
- `.lux-reveal-delay-1` à `.lux-reveal-delay-4`
- `.lux-stagger > *` et ses `:nth-child(n)` (1 à 6)
- `@keyframes lux-stagger-reveal`
- `.lux-float-soft` et `@keyframes lux-float-soft`
- `.lux-card-soft` et `.lux-card-soft:hover`

**Conserver** : `.lux-container`, `.lux-panel`, `.lux-input`, `.lux-btn-primary`, `.lux-btn-secondary`, `.lux-title`, `.lux-subtle` (utilisés ailleurs dans le site).

- [ ] **Step 3: Supprimer les classes du car-card luxury et info-card actuelles**

Supprimer dans `@layer utilities` :
- `.car-card-luxury` et son `:hover`
- `.car-image-wrapper` et `.car-card-luxury:hover .car-image-wrapper`
- `.car-image` et `.car-card-luxury:hover .car-image`
- `.car-year-badge`
- `.car-badge-glass` et `.car-card-luxury:hover .car-badge-glass`
- `.car-title`, `.car-model`, `.car-divider-container`, `.car-price-section`, `.car-availability`
- `.car-cta-arrow` et `.car-card-luxury:hover .car-cta-arrow`
- `.car-price-amount`
- `.car-hover-glow`
- `.info-card`, `.info-card:hover`
- `.info-card-glow`
- `.info-card-icon`
- `.info-card-sweep`
- `.hero-layer`, `.hero-layer-a`, `.hero-layer-b`

Et les `@keyframes` correspondants :
- `@keyframes car-badge-float-in`
- `@keyframes car-content-reveal`
- `@keyframes info-icon-float`
- `@keyframes info-card-sweep`
- `@keyframes hero-crossfade`

- [ ] **Step 4: Vérifier que le bloc `prefers-reduced-motion` ne référence plus les classes supprimées**

Le bloc `@media (prefers-reduced-motion: reduce)` référence des classes (`.text-gradient-gold`, `.text-gradient-silver`, `.car-image-wrapper`, `.text-blur-reveal`, etc.). Remplacer tout son contenu par juste :

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

(Les nouvelles classes `.reveal-*` géreront leur propre fallback dans la Task 3.)

- [ ] **Step 5: Vérifier visuellement l'impact**

Run: `npm run dev`, ouvrir `http://localhost:3000`.
Expected: la page CASSE visuellement (les classes utilisées par `page.tsx` sont supprimées — les ledes vont apparaître sans animation, les cards sans hover, etc.). C'est attendu — on les remplacera dans les phases suivantes.
Vérifier : aucune erreur de compilation dans la console du dev server, juste un rendu dégradé.

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css
git commit -m "chore(home): remove obsolete decorative CSS classes"
```

---

### Task 3: Ajouter les utilitaires `.reveal-*` dans `globals.css`

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Ajouter le bloc des utilitaires reveal dans `@layer utilities`**

À la fin du `@layer utilities { ... }` (juste avant la fermeture `}` du layer), ajouter :

```css
  /* ============================================
     Reveal-on-scroll utilities
     Initial state hidden, .is-visible flips to visible.
     ============================================ */

  .reveal-fade-up {
    opacity: 0;
    transform: translateY(32px);
    transition:
      opacity 1000ms cubic-bezier(0.16, 1, 0.3, 1),
      transform 1000ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  .reveal-fade-up.is-visible {
    opacity: 1;
    transform: translateY(0);
  }

  .reveal-blur {
    opacity: 0;
    filter: blur(4px);
    transform: translateY(20px);
    transition:
      opacity 1100ms cubic-bezier(0.19, 1, 0.22, 1),
      filter 1100ms cubic-bezier(0.19, 1, 0.22, 1),
      transform 1100ms cubic-bezier(0.19, 1, 0.22, 1);
  }
  .reveal-blur.is-visible {
    opacity: 1;
    filter: blur(0);
    transform: translateY(0);
  }

  .reveal-clip {
    clip-path: inset(100% 0 0 0);
    transform: translateY(0);
    transition: clip-path 1100ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  .reveal-clip.is-visible {
    clip-path: inset(0 0 0 0);
  }

  .reveal-stagger > * {
    opacity: 0;
    transform: translateY(24px);
    transition:
      opacity 900ms cubic-bezier(0.16, 1, 0.3, 1),
      transform 900ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  .reveal-stagger.is-visible > *:nth-child(1) { transition-delay: 0ms; opacity: 1; transform: translateY(0); }
  .reveal-stagger.is-visible > *:nth-child(2) { transition-delay: 120ms; opacity: 1; transform: translateY(0); }
  .reveal-stagger.is-visible > *:nth-child(3) { transition-delay: 240ms; opacity: 1; transform: translateY(0); }
  .reveal-stagger.is-visible > *:nth-child(4) { transition-delay: 360ms; opacity: 1; transform: translateY(0); }
  .reveal-stagger.is-visible > *:nth-child(5) { transition-delay: 480ms; opacity: 1; transform: translateY(0); }
  .reveal-stagger.is-visible > *:nth-child(6) { transition-delay: 600ms; opacity: 1; transform: translateY(0); }

  .reveal-line {
    transform: scaleX(0);
    transform-origin: left center;
    transition: transform 1400ms cubic-bezier(0.65, 0, 0.35, 1);
  }
  .reveal-line.is-visible {
    transform: scaleX(1);
  }
```

- [ ] **Step 2: Ajouter le fallback reduced-motion juste après le bloc `@media (prefers-reduced-motion)` existant**

Ajouter, en dehors de `@layer utilities`, après le `@media (prefers-reduced-motion: reduce)` qu'on a simplifié à la Task 2 :

```css
@media (prefers-reduced-motion: reduce) {
  .reveal-fade-up,
  .reveal-blur,
  .reveal-clip,
  .reveal-stagger > *,
  .reveal-line {
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
    clip-path: none !important;
    transition: none !important;
  }
}
```

- [ ] **Step 3: Vérifier syntaxe CSS**

Run: `npm run dev`.
Expected: pas d'erreur de compilation Tailwind/PostCSS dans le terminal.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(home): add reveal-on-scroll CSS utilities"
```

---

### Task 4: Créer le hook `useRevealOnScroll`

**Files:**
- Create: `src/hooks/use-reveal-on-scroll.ts`

- [ ] **Step 1: Créer le hook**

Contenu de `src/hooks/use-reveal-on-scroll.ts` :

```ts
"use client";

import { useEffect, useRef } from "react";

interface RevealOptions {
  threshold?: number;
  rootMargin?: string;
  /** When true (default), the class is added once and never removed. */
  once?: boolean;
  /** CSS class added when the element enters the viewport. */
  className?: string;
}

/**
 * Watches an element and adds a class when it crosses the viewport.
 * Designed to pair with the `.reveal-*` CSS utilities.
 */
export function useRevealOnScroll<T extends HTMLElement = HTMLDivElement>(
  options: RevealOptions = {},
) {
  const ref = useRef<T | null>(null);
  const {
    threshold = 0.15,
    rootMargin = "0px 0px -50px 0px",
    once = true,
    className = "is-visible",
  } = options;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      node.classList.add(className);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.classList.add(className);
            if (once) observer.unobserve(node);
          } else if (!once) {
            node.classList.remove(className);
          }
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once, className]);

  return ref;
}
```

- [ ] **Step 2: Vérifier la compilation TypeScript**

Run: `npm run dev`.
Expected: aucune erreur TS dans le terminal.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-reveal-on-scroll.ts
git commit -m "feat(home): add useRevealOnScroll hook"
```

---

### Task 5: Installer Lenis et créer le composant `<SmoothScroll />`

**Files:**
- Modify: `package.json` (via `npm install`)
- Create: `src/components/layout/smooth-scroll.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Installer la dépendance Lenis**

Run: `npm install lenis`
Expected: installation sans erreur, `lenis` apparaît dans `package.json` dans `dependencies`.

- [ ] **Step 2: Créer le composant SmoothScroll**

Contenu de `src/components/layout/smooth-scroll.tsx` :

```tsx
"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const isTouch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}
```

- [ ] **Step 3: Monter `<SmoothScroll />` dans le layout root**

Modifier `src/app/layout.tsx` :

Importer en haut, après les imports de fonts et de `SiteFooter` :
```tsx
import { SmoothScroll } from "@/components/layout/smooth-scroll";
```

Dans le JSX, remplacer :
```tsx
{isAdmin ? (
  children
) : (
  <>
    <ScrollProgress />
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 pt-20 md:pt-24">{children}</main>
      <SiteFooter />
    </div>
  </>
)}
```

Par :
```tsx
{isAdmin ? (
  children
) : (
  <>
    <SmoothScroll />
    <ScrollProgress />
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 pt-20 md:pt-24">{children}</main>
      <SiteFooter />
    </div>
  </>
)}
```

- [ ] **Step 4: Checkpoint visuel**

Run: `npm run dev`, ouvrir `http://localhost:3000`.
Expected: le scroll a un momentum doux, plus inertiel qu'avant. Aucune erreur en console.
Tester aussi `localStorage` ne doit pas causer d'hydration mismatch.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/components/layout/smooth-scroll.tsx src/app/layout.tsx
git commit -m "feat(home): add Lenis smooth scroll, respect reduced-motion and touch"
```

---

### Task 6: Affiner le `ScrollProgress` (1px, blanc pur)

**Files:**
- Modify: `src/components/layout/scroll-progress.tsx`

- [ ] **Step 1: Remplacer le contenu du composant**

Contenu complet de `src/components/layout/scroll-progress.tsx` :

```tsx
"use client";

import { useEffect, useState } from "react";

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (documentHeight <= 0) {
        setProgress(0);
        return;
      }
      const nextProgress = Math.min(100, Math.max(0, (window.scrollY / documentHeight) * 100));
      setProgress(nextProgress);
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px bg-transparent">
      <div
        className="h-full bg-[var(--ink-ivory)] transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Checkpoint visuel**

Run: `npm run dev`, scroll sur la page.
Expected: barre de progression en haut, 1px, blanche pure (plus de gradient).

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/scroll-progress.tsx
git commit -m "refactor(home): scroll progress as 1px ivory bar"
```

---

## Phase 2 — Layout structurel (header, footer)

### Task 7: Redesign du `SiteHeader`

**Files:**
- Modify: `src/components/layout/site-header.tsx`

- [ ] **Step 1: Réécrire le composant**

Contenu complet de `src/components/layout/site-header.tsx` :

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SiteHeaderProps {
  isAdmin: boolean;
}

function SiteHeaderClient({ isAdmin }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b backdrop-blur-md transition-[height,background-color,border-color] duration-[350ms] ease-out ${
        scrolled
          ? "h-16 border-[var(--ink-line)] bg-[rgba(5,5,5,0.85)]"
          : "h-20 border-transparent bg-[rgba(5,5,5,0.4)]"
      }`}
    >
      <div className="lux-container flex h-full items-center justify-between">
        <Link
          href="/"
          className="font-[family:var(--font-fraunces)] text-[22px] font-light leading-none tracking-[-0.01em] text-[var(--ink-ivory)] transition-opacity duration-200 hover:opacity-80 md:text-[26px]"
        >
          Prestige <em className="font-normal italic">Avenue</em>
        </Link>
        <nav className="flex items-center gap-7 font-[family:var(--font-inter)] text-[13px] text-[var(--ink-text-soft)]">
          <Link
            href="/cars"
            className="transition-colors duration-200 hover:text-[var(--ink-ivory)]"
          >
            Catalogue
          </Link>
          {isAdmin ? (
            <Link
              href="/admin/dashboard"
              className="transition-colors duration-200 hover:text-[var(--ink-ivory)]"
            >
              Admin
            </Link>
          ) : (
            <Link
              href="/admin/login"
              className="transition-colors duration-200 hover:text-[var(--ink-ivory)]"
            >
              Accès admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function SiteHeader() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user.role === "ADMIN";
  return <SiteHeaderClient isAdmin={isAdmin} />;
}
```

Note importante : on a besoin de **séparer** le client du server. Restructurer en deux fichiers est plus propre — voir Step 2.

- [ ] **Step 2: Séparer en deux fichiers (client + server)**

Créer `src/components/layout/site-header-client.tsx` :

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export interface SiteHeaderClientProps {
  isAdmin: boolean;
}

export function SiteHeaderClient({ isAdmin }: SiteHeaderClientProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b backdrop-blur-md transition-[height,background-color,border-color] duration-[350ms] ease-out ${
        scrolled
          ? "h-16 border-[var(--ink-line)] bg-[rgba(5,5,5,0.85)]"
          : "h-20 border-transparent bg-[rgba(5,5,5,0.4)]"
      }`}
    >
      <div className="lux-container flex h-full items-center justify-between">
        <Link
          href="/"
          className="font-[family:var(--font-fraunces)] text-[22px] font-light leading-none tracking-[-0.01em] text-[var(--ink-ivory)] transition-opacity duration-200 hover:opacity-80 md:text-[26px]"
        >
          Prestige <em className="font-normal italic">Avenue</em>
        </Link>
        <nav className="flex items-center gap-7 font-[family:var(--font-dm-sans)] text-[13px] text-[var(--ink-text-soft)]">
          <Link
            href="/cars"
            className="transition-colors duration-200 hover:text-[var(--ink-ivory)]"
          >
            Catalogue
          </Link>
          {isAdmin ? (
            <Link
              href="/admin/dashboard"
              className="transition-colors duration-200 hover:text-[var(--ink-ivory)]"
            >
              Admin
            </Link>
          ) : (
            <Link
              href="/admin/login"
              className="transition-colors duration-200 hover:text-[var(--ink-ivory)]"
            >
              Accès admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
```

Et réécrire `src/components/layout/site-header.tsx` :

```tsx
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { SiteHeaderClient } from "./site-header-client";

export async function SiteHeader() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user.role === "ADMIN";
  return <SiteHeaderClient isAdmin={isAdmin} />;
}
```

- [ ] **Step 3: Checkpoint visuel**

Run: `npm run dev`, ouvrir `http://localhost:3000`.
Expected:
- Header transparent au top, devient sombre + bordure visible au scroll après 60px
- Logo "Prestige *Avenue*" en Fraunces (le PNG est remplacé par du texte)
- Liens "Catalogue" et "Accès admin" à droite, hover blanc

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/site-header.tsx src/components/layout/site-header-client.tsx
git commit -m "feat(home): redesign header with Fraunces text logo and scroll-aware shrink"
```

---

### Task 8: Redesign du `SiteFooter` (logo signature géant)

**Files:**
- Modify: `src/components/layout/site-footer.tsx`

- [ ] **Step 1: Réécrire complètement le composant**

Contenu complet de `src/components/layout/site-footer.tsx` :

```tsx
import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-32 border-t border-[var(--ink-line)] pb-9 pt-24 md:pt-32">
      <div className="lux-container">
        <h2 className="reveal-blur text-center font-[family:var(--font-fraunces)] text-[clamp(72px,12vw,156px)] font-light leading-[0.9] tracking-[-0.04em] text-[var(--ink-ivory)]">
          Prestige <em className="font-normal italic">Avenue.</em>
        </h2>
        <div className="mt-16 flex flex-col items-center justify-between gap-3 border-t border-[var(--ink-line)] pt-8 font-[family:var(--font-dm-sans)] text-[12px] text-[var(--ink-soft)] md:flex-row md:gap-0">
          <span>© {year} Prestige Avenue. Tous droits reserves.</span>
          <nav className="flex gap-7">
            <Link
              href="/cars"
              className="transition-colors duration-200 hover:text-[var(--ink-ivory)]"
            >
              Catalogue
            </Link>
            <Link
              href="/admin/login"
              className="transition-colors duration-200 hover:text-[var(--ink-ivory)]"
            >
              Accès admin
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
```

Note : le logo a la classe `reveal-blur` mais aucun observer ne lui ajoute `.is-visible` pour l'instant. C'est intentionnel — pour qu'il anime, on ajoutera le wrapper client à la Task 17 ou on appliquera l'observer ici (voir Step 2).

- [ ] **Step 2: Wrapper le logo dans un client component pour l'animation**

Créer `src/components/layout/site-footer-logo.tsx` :

```tsx
"use client";

import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";

export function SiteFooterLogo() {
  const ref = useRevealOnScroll<HTMLHeadingElement>({ threshold: 0.3 });

  return (
    <h2
      ref={ref}
      className="reveal-blur text-center font-[family:var(--font-fraunces)] text-[clamp(72px,12vw,156px)] font-light leading-[0.9] tracking-[-0.04em] text-[var(--ink-ivory)]"
    >
      Prestige <em className="font-normal italic">Avenue.</em>
    </h2>
  );
}
```

Modifier `src/components/layout/site-footer.tsx` pour utiliser ce composant :

```tsx
import Link from "next/link";
import { SiteFooterLogo } from "./site-footer-logo";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-32 border-t border-[var(--ink-line)] pb-9 pt-24 md:pt-32">
      <div className="lux-container">
        <SiteFooterLogo />
        <div className="mt-16 flex flex-col items-center justify-between gap-3 border-t border-[var(--ink-line)] pt-8 font-[family:var(--font-dm-sans)] text-[12px] text-[var(--ink-soft)] md:flex-row md:gap-0">
          <span>© {year} Prestige Avenue. Tous droits reserves.</span>
          <nav className="flex gap-7">
            <Link
              href="/cars"
              className="transition-colors duration-200 hover:text-[var(--ink-ivory)]"
            >
              Catalogue
            </Link>
            <Link
              href="/admin/login"
              className="transition-colors duration-200 hover:text-[var(--ink-ivory)]"
            >
              Accès admin
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Checkpoint visuel**

Run: `npm run dev`, scroller jusqu'en bas de la home.
Expected: logo géant en bas qui blur-reveal à l'entrée du viewport. Copyright et liens en bas, alignés horizontalement.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/site-footer.tsx src/components/layout/site-footer-logo.tsx
git commit -m "feat(home): redesign footer with giant Fraunces signature logo"
```

---

## Phase 3 — Composants présentationnels (cards)

### Task 9: Redesign de `CarCard`

**Files:**
- Modify: `src/components/cars/car-card.tsx`

- [ ] **Step 1: Réécrire complètement le composant**

Contenu complet de `src/components/cars/car-card.tsx` :

```tsx
import { Car } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";

interface CarCardProps {
  car: Car;
}

function CarCardComponent({ car }: CarCardProps) {
  const modelParts = car.model.split(" ");
  const modelHead = modelParts[0] ?? car.model;
  const modelRest = modelParts.slice(1).join(" ");

  return (
    <Link
      href={`/cars/${car.id}`}
      className="car-card group block overflow-hidden rounded-lg border border-[var(--ink-line)] bg-[var(--ink-surface)] transition-[border-color] duration-[350ms] ease-out hover:border-[var(--ink-dim)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--ink-elevated)]">
        <Image
          src={car.mainImage}
          alt={`${car.brand} ${car.model}`}
          fill
          className="car-card-image object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-[1.04]"
          sizes="(max-width: 768px) 100vw, 33vw"
          loading="lazy"
          quality={85}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </div>

      <div className="px-[22px] pb-[26px] pt-[22px]">
        <h3 className="font-[family:var(--font-fraunces)] text-[28px] font-light leading-none tracking-[-0.015em] text-[var(--ink-ivory)] transition-transform duration-[350ms] ease-out group-hover:translate-x-[2px]">
          {car.brand}
          {modelRest ? (
            <>
              {" "}
              <em className="font-normal italic">{modelHead}</em>
            </>
          ) : null}
        </h3>
        <p className="mt-[6px] font-[family:var(--font-dm-sans)] text-[13px] text-[var(--ink-text-soft)]">
          {modelRest ? `${modelRest} · ` : ""}
          {car.power} ch
        </p>

        <div className="mt-7 flex items-end justify-between border-t border-[var(--ink-line)] pt-[18px]">
          <div>
            <p className="font-[family:var(--font-dm-sans)] text-[11px] uppercase tracking-[0.06em] text-[var(--ink-soft)]">
              À partir de
            </p>
            <p className="mt-1 font-[family:var(--font-fraunces)] text-[30px] font-light leading-none tracking-[-0.015em] text-[var(--ink-ivory)]">
              {Number(car.pricePerDay).toFixed(0)}
              <span className="ml-1 font-[family:var(--font-dm-sans)] text-[12px] font-normal text-[var(--ink-soft)]">
                €/jour
              </span>
            </p>
          </div>
          <span
            aria-hidden
            className="font-[family:var(--font-fraunces)] text-[18px] italic text-[var(--ink-ivory)] transition-transform duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[4px]"
          >
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

export const CarCard = memo(CarCardComponent);
```

- [ ] **Step 2: Checkpoint visuel**

Run: `npm run dev`, ouvrir `http://localhost:3000`.
Expected: les 3 cards de la section flotte ont l'apparence nouvelle (image 4:3, brand en Fraunces avec premier mot du modèle en italique, prix sobre, flèche →). Au hover : image zoom 1.04, brand qui slide légèrement, flèche qui slide.
Plus de year-badge, plus d'accent line, plus de "Disponible" indicator.

- [ ] **Step 3: Commit**

```bash
git add src/components/cars/car-card.tsx
git commit -m "feat(home): redesign CarCard, monochrome and refined"
```

---

### Task 10: Redesign de `InfoCard` (API simplifiée)

**Files:**
- Modify: `src/components/ui/info-card.tsx`

- [ ] **Step 1: Réécrire complètement le composant**

Contenu complet de `src/components/ui/info-card.tsx` :

```tsx
"use client";

import { memo } from "react";

interface InfoCardProps {
  title: React.ReactNode;
  children: React.ReactNode;
}

function InfoCardComponent({ title, children }: InfoCardProps) {
  return (
    <article className="info-card group relative overflow-hidden rounded-lg border border-[var(--ink-line)] bg-[var(--ink-surface)] p-7 transition-[border-color,background-color] duration-[350ms] ease-out hover:border-[var(--ink-dim)] hover:bg-[var(--ink-elevated)]">
      <span
        aria-hidden
        className="info-card-line absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-[var(--ink-ivory)] transition-transform duration-[600ms] ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:scale-x-100"
      />
      <h4 className="font-[family:var(--font-fraunces)] text-[19px] font-normal leading-tight tracking-[-0.005em] text-[var(--ink-ivory)]">
        {title}
      </h4>
      <div className="mt-3 font-[family:var(--font-dm-sans)] text-[13.5px] leading-relaxed text-[var(--ink-text-soft)]">
        {children}
      </div>
    </article>
  );
}

export const InfoCard = memo(InfoCardComponent);
```

Note l'API a changé :
- Ancien : `<InfoCard title="..." content="..." icon={...} />`
- Nouveau : `<InfoCard title={<>...</>}>contenu</InfoCard>` — `title` accepte un `ReactNode` pour permettre l'italique sur un mot, `children` pour le contenu (string, ul, etc.)

L'usage actuel dans `page.tsx` cassera, mais ce sera réécrit à la Task 14.

- [ ] **Step 2: Checkpoint visuel partiel**

Run: `npm run dev`. La page peut afficher des erreurs car `page.tsx` utilise encore l'ancienne API d'InfoCard. C'est attendu.
Expected: erreur de compile sur `page.tsx` (props inconnues `content`, `icon`). Pas grave — on corrige à la Task 14.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/info-card.tsx
git commit -m "feat(home): redesign InfoCard, drop icons, add hover hairline"
```

---

## Phase 4 — Sections de la home

### Task 11: Créer le composant `SectionCounter`

**Files:**
- Create: `src/components/home/section-counter.tsx`

- [ ] **Step 1: Créer le composant**

Contenu de `src/components/home/section-counter.tsx` :

```tsx
interface SectionCounterProps {
  index: number;
  total?: number;
  className?: string;
}

export function SectionCounter({ index, total = 7, className = "" }: SectionCounterProps) {
  const padded = String(index).padStart(2, "0");
  const totalPadded = String(total).padStart(2, "0");

  return (
    <span
      className={`inline-block font-[family:var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--ink-muted)] ${className}`}
    >
      — {padded} / {totalPadded}
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/home/section-counter.tsx
git commit -m "feat(home): add SectionCounter component"
```

---

### Task 12: Créer le composant `CtaArrow` (ticker arrow)

**Files:**
- Create: `src/components/home/cta-arrow.tsx`

- [ ] **Step 1: Créer le composant**

Contenu de `src/components/home/cta-arrow.tsx` :

```tsx
export function CtaArrow() {
  return (
    <span
      aria-hidden
      className="cta-arrow relative inline-block h-[18px] w-[18px] overflow-hidden align-middle"
    >
      <span className="cta-arrow-track flex flex-col leading-none transition-transform duration-[450ms] ease-[cubic-bezier(0.65,0,0.35,1)]">
        <span className="block h-[18px] font-[family:var(--font-fraunces)] text-[18px] italic">
          →
        </span>
        <span className="block h-[18px] font-[family:var(--font-fraunces)] text-[18px] italic">
          →
        </span>
      </span>
    </span>
  );
}
```

Et ajouter dans `src/app/globals.css` (à la fin du `@layer utilities`) :

```css
  /* CTA ticker arrow */
  .group:hover .cta-arrow-track {
    transform: translateY(-18px);
  }
```

- [ ] **Step 2: Commit**

```bash
git add src/components/home/cta-arrow.tsx src/app/globals.css
git commit -m "feat(home): add ticker CtaArrow component"
```

---

### Task 13: Créer le composant `WordHighlight`

**Files:**
- Create: `src/components/home/word-highlight.tsx`

- [ ] **Step 1: Créer le composant**

Contenu de `src/components/home/word-highlight.tsx` :

```tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface WordHighlightProps {
  text: string;
  /** Word index (0-based) where italic emphasis starts. Marks all words from this index to end. */
  italicFromIndex?: number;
  className?: string;
}

export function WordHighlight({ text, italicFromIndex, className = "" }: WordHighlightProps) {
  const containerRef = useRef<HTMLParagraphElement | null>(null);
  const [progress, setProgress] = useState(0);

  const words = useMemo(() => text.split(/(\s+)/), [text]);
  const wordIndexes = useMemo(
    () =>
      words
        .map((token, i) => ({ token, i, isWord: !/^\s+$/.test(token) }))
        .filter((w) => w.isWord),
    [words],
  );

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    if (typeof window !== "undefined") {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) {
        setProgress(1);
        return;
      }
    }

    const compute = () => {
      const rect = node.getBoundingClientRect();
      const viewport = window.innerHeight;
      const start = viewport * 0.85;
      const end = viewport * 0.15;
      const span = start - end;
      const traveled = start - rect.top;
      const ratio = Math.min(1, Math.max(0, traveled / span));
      setProgress(ratio);
    };

    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, []);

  const wordsLit = Math.floor(progress * wordIndexes.length);

  let wordCounter = -1;

  return (
    <p
      ref={containerRef}
      className={`font-[family:var(--font-fraunces)] font-light leading-[1.18] tracking-[-0.02em] ${className}`}
    >
      {words.map((token, i) => {
        if (/^\s+$/.test(token)) {
          return <span key={i}>{token}</span>;
        }
        wordCounter += 1;
        const lit = wordCounter < wordsLit;
        const italic =
          italicFromIndex !== undefined && wordCounter >= italicFromIndex;
        return (
          <span
            key={i}
            className={`transition-colors duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              lit ? "text-[var(--ink-ivory)]" : "text-[var(--ink-dim)]"
            } ${italic ? "italic" : ""}`}
          >
            {token}
          </span>
        );
      })}
    </p>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/home/word-highlight.tsx
git commit -m "feat(home): add WordHighlight scroll-driven highlight component"
```

---

### Task 14: Créer la section Hero

**Files:**
- Create: `src/components/home/hero-section.tsx`
- Modify: `src/components/hero/hero-video.tsx`

- [ ] **Step 1: Ajuster l'opacité dans `hero-video.tsx`**

Dans `src/components/hero/hero-video.tsx`, remplacer toutes les occurrences de `opacity-78` par `opacity-55` (4 occurrences, sur les 4 video tags). Cela passe l'opacité finale de la couche active de 0.78 à 0.55.

- [ ] **Step 2: Créer `hero-section.tsx`**

Contenu de `src/components/home/hero-section.tsx` :

```tsx
import Link from "next/link";
import { HeroVideo } from "@/components/hero/hero-video";

export function HeroSection() {
  return (
    <section className="relative isolate -mt-20 min-h-[100svh] overflow-hidden md:-mt-24">
      <HeroVideo />

      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgba(0,0,0,0.6)_75%,rgba(5,5,5,0.95)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 mix-blend-overlay opacity-[0.08]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence baseFrequency='1.4'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.45'/></svg>\")",
        }}
      />

      <div className="lux-container relative z-10 grid min-h-[100svh] items-end pb-[80px] pt-[120px] md:pb-[100px]">
        <div className="max-w-[920px]">
          <h1 className="hero-title font-[family:var(--font-fraunces)] text-[clamp(50px,7.5vw,96px)] font-light leading-[0.94] tracking-[-0.035em] text-[var(--ink-ivory)]">
            <span className="hero-word block overflow-hidden">
              <span className="hero-word-inner block">Prestige</span>
            </span>
            <span className="hero-word block overflow-hidden">
              <span className="hero-word-inner hero-word-2 block italic font-normal">Avenue.</span>
            </span>
          </h1>

          <p className="hero-lede1 mt-7 max-w-[600px] font-[family:var(--font-fraunces)] text-[22px] font-light leading-[1.45] text-[var(--ink-text)]">
            Reservez aujourd&apos;hui le vehicule qui vous ressemble, le prestige devient accessible.
          </p>
          <p className="hero-lede2 mt-3 max-w-[540px] font-[family:var(--font-dm-sans)] text-[14px] leading-[1.55] text-[var(--ink-text-soft)]">
            Vehicules controles, assurance incluse et assistance dediee. Profitez de la route, on s&apos;occupe du reste.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/cars"
              className="hero-cta-1 inline-flex items-center justify-center rounded-full border border-[var(--ink-ivory)] bg-[var(--ink-ivory)] px-7 py-[13px] font-[family:var(--font-dm-sans)] text-[13px] font-medium text-[var(--ink-onyx)] transition-[background-color,color] duration-[350ms] ease-out hover:bg-transparent hover:text-[var(--ink-ivory)]"
            >
              Voir le catalogue
            </Link>
            <Link
              href="#a-savoir"
              className="hero-cta-2 inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-[13px] font-[family:var(--font-dm-sans)] text-[13px] font-medium text-[var(--ink-ivory)] transition-[border-color] duration-[350ms] ease-out hover:border-[var(--ink-ivory)]"
            >
              À savoir
            </Link>
          </div>
        </div>

        <span
          aria-hidden
          className="hero-marker pointer-events-none absolute bottom-[80px] right-6 inline-flex items-center gap-[10px] font-[family:var(--font-dm-sans)] text-[11px] uppercase tracking-[0.28em] text-[var(--ink-muted)] md:bottom-[100px] md:right-9"
        >
          <span className="inline-block h-px w-8 bg-[var(--ink-dim)]" />
          2026
        </span>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Ajouter les animations d'entrée hero dans `globals.css`**

Dans `@layer utilities` à la fin, ajouter :

```css
  /* Hero entry sequence */
  .hero-word-inner {
    transform: translateY(110%);
    animation: hero-word-up 1100ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
    will-change: transform;
  }
  .hero-word-2 { animation-delay: 180ms; }
  @keyframes hero-word-up {
    to { transform: translateY(0); }
  }

  .hero-lede1 {
    opacity: 0;
    filter: blur(4px);
    transform: translateY(16px);
    animation: hero-fade-blur 1000ms cubic-bezier(0.19, 1, 0.22, 1) 900ms forwards;
  }
  @keyframes hero-fade-blur {
    to { opacity: 1; filter: blur(0); transform: translateY(0); }
  }

  .hero-lede2 {
    opacity: 0;
    transform: translateY(16px);
    animation: hero-fade-up 800ms cubic-bezier(0.19, 1, 0.22, 1) 1100ms forwards;
  }
  .hero-cta-1 {
    opacity: 0;
    transform: translateY(12px);
    animation: hero-fade-up 700ms cubic-bezier(0.19, 1, 0.22, 1) 1300ms forwards;
  }
  .hero-cta-2 {
    opacity: 0;
    transform: translateY(12px);
    animation: hero-fade-up 700ms cubic-bezier(0.19, 1, 0.22, 1) 1380ms forwards;
  }
  .hero-marker {
    opacity: 0;
    animation: hero-fade-in 800ms ease-out 1600ms forwards;
  }
  @keyframes hero-fade-up {
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes hero-fade-in {
    to { opacity: 1; }
  }
```

Et étendre le bloc reduced-motion :

```css
@media (prefers-reduced-motion: reduce) {
  .hero-word-inner,
  .hero-lede1,
  .hero-lede2,
  .hero-cta-1,
  .hero-cta-2,
  .hero-marker {
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
    animation: none !important;
  }
}
```

- [ ] **Step 4: Commit (avant d'utiliser dans `page.tsx`)**

```bash
git add src/components/home/hero-section.tsx src/components/hero/hero-video.tsx src/app/globals.css
git commit -m "feat(home): create HeroSection with staged entry animations"
```

---

### Task 15: Créer la section Manifesto

**Files:**
- Create: `src/components/home/manifesto-section.tsx`

- [ ] **Step 1: Créer le composant**

Contenu de `src/components/home/manifesto-section.tsx` :

```tsx
import { SectionCounter } from "./section-counter";
import { WordHighlight } from "./word-highlight";

export function ManifestoSection() {
  // Mots indexés (0-based) :
  // 0=Une 1=flotte 2=choisie 3=une 4=à 5=une. 6=Des 7=vehicules 8=selectionnes 9=pour
  // 10=leur 11=technologie, 12=leur 13=confort 14=et 15=leur 16=prestance.
  const text =
    "Une flotte choisie une à une. Des vehicules selectionnes pour leur technologie, leur confort et leur prestance.";

  return (
    <section className="manifesto py-32 md:py-40">
      <div className="lux-container">
        <SectionCounter index={2} className="mb-9" />
        <WordHighlight
          text={text}
          italicFromIndex={15}
          className="text-[clamp(32px,4vw,54px)] max-w-[920px]"
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/home/manifesto-section.tsx
git commit -m "feat(home): create ManifestoSection with scroll-driven highlight"
```

---

### Task 16: Créer la section Flotte

**Files:**
- Create: `src/components/home/fleet-section.tsx`

- [ ] **Step 1: Créer le composant**

Contenu de `src/components/home/fleet-section.tsx` :

```tsx
import Link from "next/link";
import { Car } from "@prisma/client";
import { CarCard } from "@/components/cars/car-card";
import { SectionCounter } from "./section-counter";
import { FleetReveal } from "./fleet-reveal";

interface FleetSectionProps {
  cars: Car[];
}

export function FleetSection({ cars }: FleetSectionProps) {
  return (
    <section className="fleet py-32 md:py-40">
      <div className="lux-container">
        <header className="mb-12 flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
          <div>
            <SectionCounter index={3} className="mb-5" />
            <h2 className="font-[family:var(--font-fraunces)] text-[clamp(40px,5vw,56px)] font-light leading-none tracking-[-0.025em] text-[var(--ink-ivory)]">
              La flotte, <em className="italic font-normal">en silence.</em>
            </h2>
          </div>
          <Link
            href="/cars"
            className="inline-flex items-center gap-2 border-b border-[var(--ink-ivory)] pb-1 font-[family:var(--font-dm-sans)] text-[13px] text-[var(--ink-ivory)] transition-opacity duration-200 hover:opacity-80"
          >
            Voir le catalogue <span className="font-[family:var(--font-fraunces)] italic">→</span>
          </Link>
        </header>

        <FleetReveal>
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3 reveal-stagger">
            {cars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </FleetReveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Créer le wrapper client `FleetReveal`**

Contenu de `src/components/home/fleet-reveal.tsx` :

```tsx
"use client";

import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";

export function FleetReveal({ children }: { children: React.ReactNode }) {
  const ref = useRevealOnScroll<HTMLDivElement>({ threshold: 0.15 });
  return (
    <div ref={ref} className="contents">
      {/* contents = no DOM box, mais l'observer doit s'attacher à un node concret */}
    </div>
  );
}
```

Note : `display: contents` ne donne pas de bounding box au observer. Solution propre : on observe un ancêtre concret. Réécriture :

```tsx
"use client";

import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";

export function FleetReveal({ children }: { children: React.ReactNode }) {
  const ref = useRevealOnScroll<HTMLDivElement>({ threshold: 0.15 });
  return <div ref={ref}>{children}</div>;
}
```

L'enfant porte `reveal-stagger` ; quand `.is-visible` est ajouté à `FleetReveal`, il faut adapter le sélecteur. Plus simple : faire que le wrapper porte directement `reveal-stagger` :

Réécriture finale de `src/components/home/fleet-reveal.tsx` :

```tsx
"use client";

import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";

export function FleetReveal({ children }: { children: React.ReactNode }) {
  const ref = useRevealOnScroll<HTMLDivElement>({ threshold: 0.15 });
  return (
    <div
      ref={ref}
      className="reveal-stagger grid grid-cols-1 gap-3.5 md:grid-cols-3"
    >
      {children}
    </div>
  );
}
```

Et adapter `fleet-section.tsx` pour ne plus dupliquer la grille :

```tsx
import Link from "next/link";
import { Car } from "@prisma/client";
import { CarCard } from "@/components/cars/car-card";
import { SectionCounter } from "./section-counter";
import { FleetReveal } from "./fleet-reveal";

interface FleetSectionProps {
  cars: Car[];
}

export function FleetSection({ cars }: FleetSectionProps) {
  return (
    <section className="fleet py-32 md:py-40">
      <div className="lux-container">
        <header className="mb-12 flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
          <div>
            <SectionCounter index={3} className="mb-5" />
            <h2 className="font-[family:var(--font-fraunces)] text-[clamp(40px,5vw,56px)] font-light leading-none tracking-[-0.025em] text-[var(--ink-ivory)]">
              La flotte, <em className="italic font-normal">en silence.</em>
            </h2>
          </div>
          <Link
            href="/cars"
            className="inline-flex items-center gap-2 border-b border-[var(--ink-ivory)] pb-1 font-[family:var(--font-dm-sans)] text-[13px] text-[var(--ink-ivory)] transition-opacity duration-200 hover:opacity-80"
          >
            Voir le catalogue <span className="font-[family:var(--font-fraunces)] italic">→</span>
          </Link>
        </header>

        <FleetReveal>
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </FleetReveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/home/fleet-section.tsx src/components/home/fleet-reveal.tsx
git commit -m "feat(home): create FleetSection with staggered reveal"
```

---

### Task 17: Créer la section Processus

**Files:**
- Create: `src/components/home/process-section.tsx`

- [ ] **Step 1: Créer le composant**

Contenu de `src/components/home/process-section.tsx` :

```tsx
import { SectionCounter } from "./section-counter";
import { ProcessReveal } from "./process-reveal";

const STEPS = [
  {
    num: "01",
    name: "Choisir",
    desc: "Parcourez la flotte. Chaque vehicule est decrit, photographie, controle.",
  },
  {
    num: "02",
    name: "Reserver",
    desc: "40% d'acompte securise, paiement en ligne. Le solde reste libre jusqu'a la prise.",
  },
  {
    num: "03",
    name: "Prendre la route",
    desc: "Remise des cles a Rouen. Assurance, assistance, et tout le reste — inclus.",
  },
];

export function ProcessSection() {
  return (
    <section className="process py-32 md:py-40">
      <div className="lux-container">
        <SectionCounter index={4} className="mb-5" />
        <h2 className="mb-14 max-w-[680px] font-[family:var(--font-fraunces)] text-[clamp(40px,5vw,56px)] font-light leading-none tracking-[-0.025em] text-[var(--ink-ivory)]">
          Trois gestes, <em className="italic font-normal">une seule clé.</em>
        </h2>

        <ProcessReveal>
          <div className="relative grid grid-cols-1 md:grid-cols-3">
            <span
              aria-hidden
              className="reveal-line absolute inset-x-0 top-0 hidden h-px bg-[var(--ink-line-soft)] md:block"
            />
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className={`process-step pt-7 md:pt-9 ${
                  i > 0 ? "border-t border-[var(--ink-line)] md:border-l md:border-t-0" : "md:pl-0"
                } ${i > 0 ? "md:pl-7" : ""} pr-7`}
                style={{ transitionDelay: `${i * 280}ms` }}
              >
                <div className="font-[family:var(--font-fraunces)] text-[56px] font-light italic leading-none tracking-[-0.02em] text-[var(--ink-ivory)]">
                  {step.num}
                </div>
                <div className="mt-5 font-[family:var(--font-dm-sans)] text-[11px] uppercase tracking-[0.28em] text-[var(--ink-soft)]">
                  {step.name}
                </div>
                <p className="mt-3.5 max-w-[280px] font-[family:var(--font-dm-sans)] text-[14px] leading-[1.6] text-[var(--ink-text-soft)]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </ProcessReveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Créer `ProcessReveal`**

Contenu de `src/components/home/process-reveal.tsx` :

```tsx
"use client";

import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";

export function ProcessReveal({ children }: { children: React.ReactNode }) {
  const ref = useRevealOnScroll<HTMLDivElement>({ threshold: 0.2 });
  return (
    <div ref={ref} className="reveal-stagger">
      {children}
    </div>
  );
}
```

Le wrapper porte `reveal-stagger` mais l'enfant est unique (la grille). Du coup le stagger ne s'appliquera qu'à un seul enfant. Solution : on déplace `reveal-stagger` au niveau de la grille interne — mais on a besoin que le observer soit sur un ancêtre. Simplification : on met `reveal-fade-up` sur chaque `process-step` individuellement, et on les déclenche via le data-attribute du wrapper.

Réécriture cleanup. Modifier `process-section.tsx` :

```tsx
import { SectionCounter } from "./section-counter";
import { ProcessReveal } from "./process-reveal";

const STEPS = [
  {
    num: "01",
    name: "Choisir",
    desc: "Parcourez la flotte. Chaque vehicule est decrit, photographie, controle.",
  },
  {
    num: "02",
    name: "Reserver",
    desc: "40% d'acompte securise, paiement en ligne. Le solde reste libre jusqu'a la prise.",
  },
  {
    num: "03",
    name: "Prendre la route",
    desc: "Remise des cles a Rouen. Assurance, assistance, et tout le reste — inclus.",
  },
];

export function ProcessSection() {
  return (
    <section className="process py-32 md:py-40">
      <div className="lux-container">
        <SectionCounter index={4} className="mb-5" />
        <h2 className="mb-14 max-w-[680px] font-[family:var(--font-fraunces)] text-[clamp(40px,5vw,56px)] font-light leading-none tracking-[-0.025em] text-[var(--ink-ivory)]">
          Trois gestes, <em className="italic font-normal">une seule clé.</em>
        </h2>

        <ProcessReveal>
          <span
            aria-hidden
            className="reveal-line absolute inset-x-0 top-0 hidden h-px bg-[var(--ink-line-soft)] md:block"
          />
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className={`process-step relative pr-7 pt-7 md:pt-9 ${
                i > 0
                  ? "border-t border-[var(--ink-line)] md:border-l md:border-t-0 md:pl-7"
                  : "md:pr-7"
              }`}
            >
              <div className="font-[family:var(--font-fraunces)] text-[56px] font-light italic leading-none tracking-[-0.02em] text-[var(--ink-ivory)]">
                {step.num}
              </div>
              <div className="mt-5 font-[family:var(--font-dm-sans)] text-[11px] uppercase tracking-[0.28em] text-[var(--ink-soft)]">
                {step.name}
              </div>
              <p className="mt-3.5 max-w-[280px] font-[family:var(--font-dm-sans)] text-[14px] leading-[1.6] text-[var(--ink-text-soft)]">
                {step.desc}
              </p>
            </div>
          ))}
        </ProcessReveal>
      </div>
    </section>
  );
}
```

Et `process-reveal.tsx` qui rend la grille avec `reveal-stagger` :

```tsx
"use client";

import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";

export function ProcessReveal({ children }: { children: React.ReactNode }) {
  const ref = useRevealOnScroll<HTMLDivElement>({ threshold: 0.2 });
  return (
    <div ref={ref} className="reveal-stagger relative grid grid-cols-1 md:grid-cols-3">
      {children}
    </div>
  );
}
```

Note : la `reveal-line` (la hairline) est un enfant `*:nth-child(1)` de la grille `reveal-stagger`. Comme elle utilise `transform: scaleX` et non `translateY`, le `reveal-stagger > *` (qui force `translateY(24px)` au départ) va casser la transformation de scaleX. Il faut traiter la hairline comme un cas à part.

Solution : la hairline a la classe `reveal-line` mais on lui ajoute `data-no-stagger` et on adapte le CSS pour exclure `[data-no-stagger]` du sélecteur `reveal-stagger > *`. Simpler : on applique l'animation hairline via le state du parent `.is-visible`, indépendamment du stagger.

Modifier `globals.css`, dans le bloc reveal utilities, remplacer :
```css
  .reveal-stagger > * {
    opacity: 0;
    transform: translateY(24px);
    transition:
      opacity 900ms cubic-bezier(0.16, 1, 0.3, 1),
      transform 900ms cubic-bezier(0.16, 1, 0.3, 1);
  }
```
Par :
```css
  .reveal-stagger > *:not(.reveal-line) {
    opacity: 0;
    transform: translateY(24px);
    transition:
      opacity 900ms cubic-bezier(0.16, 1, 0.3, 1),
      transform 900ms cubic-bezier(0.16, 1, 0.3, 1);
  }
```

Et :
```css
  .reveal-stagger.is-visible > *:nth-child(1) { transition-delay: 0ms; opacity: 1; transform: translateY(0); }
```
Devient :
```css
  .reveal-stagger.is-visible > *:not(.reveal-line):nth-child(1) { transition-delay: 0ms; opacity: 1; transform: translateY(0); }
  .reveal-stagger.is-visible > *:not(.reveal-line):nth-child(2) { transition-delay: 120ms; opacity: 1; transform: translateY(0); }
  .reveal-stagger.is-visible > *:not(.reveal-line):nth-child(3) { transition-delay: 240ms; opacity: 1; transform: translateY(0); }
  .reveal-stagger.is-visible > *:not(.reveal-line):nth-child(4) { transition-delay: 360ms; opacity: 1; transform: translateY(0); }
  .reveal-stagger.is-visible > *:not(.reveal-line):nth-child(5) { transition-delay: 480ms; opacity: 1; transform: translateY(0); }
  .reveal-stagger.is-visible > *:not(.reveal-line):nth-child(6) { transition-delay: 600ms; opacity: 1; transform: translateY(0); }
```

Et le fallback reduced-motion étend déjà `.reveal-stagger > *` — il marchera aussi avec `:not(.reveal-line)` car ce sont des sélecteurs équivalents pour reduced-motion.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/process-section.tsx src/components/home/process-reveal.tsx src/app/globals.css
git commit -m "feat(home): create ProcessSection with traced hairline and stagger"
```

---

### Task 18: Créer la section À savoir (info)

**Files:**
- Create: `src/components/home/info-section.tsx`

- [ ] **Step 1: Créer le composant**

Contenu de `src/components/home/info-section.tsx` :

```tsx
import { InfoCard } from "@/components/ui/info-card";
import { SectionCounter } from "./section-counter";
import { InfoReveal } from "./info-reveal";

export function InfoSection() {
  return (
    <section id="a-savoir" className="info py-32 md:py-40">
      <div className="lux-container">
        <SectionCounter index={5} className="mb-5" />
        <h2 className="mb-12 max-w-[720px] font-[family:var(--font-fraunces)] text-[clamp(34px,4.4vw,48px)] font-light leading-[1.05] tracking-[-0.02em] text-[var(--ink-ivory)]">
          Informations essentielles <em className="italic font-normal">avant votre location.</em>
        </h2>

        <InfoReveal>
          <InfoCard title={<>À <em className="italic font-normal">savoir</em></>}>
            Retrouvez ici les informations essentielles concernant la location. Notre equipe reste disponible pour toute question complementaire.
          </InfoCard>
          <InfoCard title={<><em className="italic font-normal">Où</em> ?</>}>
            72 Rue de Lessard
            <br />
            76100, Rouen
          </InfoCard>
          <InfoCard title={<><em className="italic font-normal">Pré-requis</em></>}>
            <ul className="m-0 list-none p-0">
              <li className="border-t border-[var(--ink-line)] py-[7px] first:border-t-0 first:pt-0">
                <span className="text-[var(--ink-muted)]">— </span>Permis de conduire valide
              </li>
              <li className="border-t border-[var(--ink-line)] py-[7px]">
                <span className="text-[var(--ink-muted)]">— </span>Piece d&apos;identite valide
              </li>
              <li className="border-t border-[var(--ink-line)] py-[7px]">
                <span className="text-[var(--ink-muted)]">— </span>Justificatif de domicile -3 mois
              </li>
            </ul>
          </InfoCard>
          <InfoCard title={<><em className="italic font-normal">Réservation</em></>}>
            Pour toutes reservations un acompte vous sera demande (40% du total).
          </InfoCard>
        </InfoReveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Créer `InfoReveal`**

Contenu de `src/components/home/info-reveal.tsx` :

```tsx
"use client";

import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";

export function InfoReveal({ children }: { children: React.ReactNode }) {
  const ref = useRevealOnScroll<HTMLDivElement>({ threshold: 0.15 });
  return (
    <div ref={ref} className="reveal-stagger grid grid-cols-1 gap-3.5 md:grid-cols-2">
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/home/info-section.tsx src/components/home/info-reveal.tsx
git commit -m "feat(home): create InfoSection with refined cards"
```

---

### Task 19: Créer la section CTA finale

**Files:**
- Create: `src/components/home/cta-section.tsx`

- [ ] **Step 1: Créer le composant**

Contenu de `src/components/home/cta-section.tsx` :

```tsx
import Link from "next/link";
import { SectionCounter } from "./section-counter";
import { CtaArrow } from "./cta-arrow";
import { CtaReveal } from "./cta-reveal";

export function CtaSection() {
  return (
    <section className="cta-final py-40 text-center md:py-48">
      <div className="lux-container">
        <CtaReveal>
          <div className="mb-7 flex justify-center">
            <SectionCounter index={6} />
          </div>
          <h2 className="mx-auto max-w-[920px] font-[family:var(--font-fraunces)] text-[clamp(54px,7vw,86px)] font-light leading-none tracking-[-0.035em] text-[var(--ink-ivory)]">
            Choisissez
            <br />
            le <em className="italic font-normal">vôtre.</em>
          </h2>
          <Link
            href="/cars"
            className="group mt-10 inline-flex items-center gap-3 rounded-full bg-[var(--ink-ivory)] px-8 py-[18px] font-[family:var(--font-dm-sans)] text-[14px] font-medium text-[var(--ink-onyx)] transition-colors duration-[250ms] hover:bg-[var(--ink-text)]"
          >
            <span>Voir le catalogue</span>
            <CtaArrow />
          </Link>
        </CtaReveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Créer `CtaReveal`**

Contenu de `src/components/home/cta-reveal.tsx` :

```tsx
"use client";

import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";

export function CtaReveal({ children }: { children: React.ReactNode }) {
  const ref = useRevealOnScroll<HTMLDivElement>({ threshold: 0.3 });
  return (
    <div ref={ref} className="reveal-fade-up">
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/home/cta-section.tsx src/components/home/cta-reveal.tsx
git commit -m "feat(home): create CtaSection with ticker arrow"
```

---

## Phase 5 — Page orchestration

### Task 20: Réécrire `src/app/page.tsx`

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Réécrire complètement la page**

Contenu complet de `src/app/page.tsx` :

```tsx
import { getFeaturedCars } from "@/services/car.service";
import { HeroSection } from "@/components/home/hero-section";
import { ManifestoSection } from "@/components/home/manifesto-section";
import { FleetSection } from "@/components/home/fleet-section";
import { ProcessSection } from "@/components/home/process-section";
import { InfoSection } from "@/components/home/info-section";
import { CtaSection } from "@/components/home/cta-section";

export default async function Home() {
  const featuredCars = await getFeaturedCars(3);

  return (
    <>
      <HeroSection />
      <ManifestoSection />
      <FleetSection cars={featuredCars} />
      <ProcessSection />
      <InfoSection />
      <CtaSection />
    </>
  );
}
```

- [ ] **Step 2: Checkpoint visuel complet**

Run: `npm run dev`, ouvrir `http://localhost:3000`, scroller la page entièrement.
Expected:
- Hero plein écran avec entrée animée des 2 mots, lede, CTAs, marker "2026"
- Section 02 manifesto avec mots qui s'allument au scroll
- Section 03 flotte avec 3 cards qui apparaissent en stagger
- Section 04 processus avec hairline qui se trace + 3 numéros
- Section 05 info avec 4 cards en grille 2x2
- Section 06 CTA "Choisissez le vôtre." avec bouton et flèche ticker au hover
- Footer avec logo géant
- Aucune erreur en console

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(home): orchestrate sections in homepage"
```

---

## Phase 6 — Cleanup et polish

### Task 21: Supprimer `animated-text.tsx` (plus utilisé)

**Files:**
- Delete: `src/components/ui/animated-text.tsx`

- [ ] **Step 1: Vérifier qu'aucune autre page n'utilise `AnimatedText`**

Run: rechercher dans le codebase :
```bash
grep -rn "AnimatedText\|AnimatedUnderlineText\|GlitchText" src --include="*.tsx" --include="*.ts"
```

Expected: aucune occurrence (le seul usage était dans `page.tsx` qu'on vient de réécrire).

Si d'autres usages existent : NE PAS supprimer le fichier ; revoir cette tâche en équipe (probablement remplacer chaque usage par les classes `.reveal-*` ou par un composant équivalent).

- [ ] **Step 2: Supprimer le fichier**

Run: `rm src/components/ui/animated-text.tsx`

- [ ] **Step 3: Vérifier le build**

Run: `npm run dev`.
Expected: aucune erreur TS/import.

- [ ] **Step 4: Commit**

```bash
git add -u src/components/ui/animated-text.tsx
git commit -m "chore(home): remove obsolete AnimatedText component"
```

---

### Task 22: Audit final de `globals.css` (suppression d'orphelins)

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Lister les classes restantes dans le fichier**

Run: `grep -E '^\s*\.[a-z]' src/app/globals.css | head -60`

Vérifier mentalement chaque classe : est-ce qu'elle est encore utilisée quelque part ?

- [ ] **Step 2: Supprimer les classes définitivement orphelines**

Si une classe n'apparaît dans aucun fichier `.tsx` ou `.ts`, la supprimer. À vérifier en particulier :
- `.lux-title` — utilisé ? `grep -rn "lux-title" src --include="*.tsx"` ; supprimer si vide
- `.lux-subtle` — idem
- `.lux-input` — utilisé par les formulaires de booking ? si oui, garder
- `.lux-btn-primary` / `.lux-btn-secondary` — utilisés par les pages cars/booking ? si oui, garder
- `.lux-panel` — utilisé sur d'autres pages ? si oui, garder
- `.lux-container` — utilisé partout, garder

NE supprimer une classe que si `grep -rn '<class>' src --include="*.tsx" --include="*.ts"` ne retourne rien d'autre que sa définition CSS.

- [ ] **Step 3: Checkpoint visuel**

Run: `npm run dev`, naviguer sur `/`, `/cars`, `/cars/[any-id]` (n'importe quelle voiture en base), `/admin/login`.
Expected: pages OK partout. Aucune régression visuelle hors home (qui elle a été redessinée).

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "chore(home): remove orphan CSS classes after redesign"
```

---

### Task 23: Vérifier le respect de `prefers-reduced-motion` et l'accessibilité

**Files:**
- (lecture seule pour vérification)

- [ ] **Step 1: Activer reduced-motion dans le navigateur**

Dans Chrome DevTools : `F12` → menu trois points → More tools → Rendering → cocher "Emulate CSS media feature prefers-reduced-motion: reduce".

- [ ] **Step 2: Vérifier la home avec reduced-motion actif**

Run: `npm run dev`, recharger la page.
Expected:
- Le hero affiche directement le titre, lede, CTAs (pas d'animation d'entrée)
- Le manifesto affiche tout le texte en blanc immédiatement
- Les sections suivantes s'affichent directement sans fade
- Le smooth scroll Lenis n'est PAS actif (scroll natif)
- Les hover restent (les transitions CSS sont écrasées à `0.01ms` par le block global)

- [ ] **Step 3: Vérifier le focus clavier**

Avec la souris : appuyer sur `Tab` plusieurs fois pour parcourir tous les liens (Catalogue, À savoir, cards, footer links).
Expected: focus ring visible sur chaque élément focusable.

- [ ] **Step 4: Vérifier les attributs aria**

Inspecter dans DevTools : la vignette du hero, le noise SVG, la hairline du processus, la flèche `→` du CTA.
Expected: chacun a `aria-hidden="true"`.

- [ ] **Step 5: Pas de commit nécessaire si rien à corriger**

Si une régression d'accessibilité est trouvée, créer un commit de correction. Sinon passer à la tâche suivante.

---

### Task 24: Vérifier la performance (Lighthouse local)

**Files:**
- (lecture seule)

- [ ] **Step 1: Build de production**

Run: `npm run build && npm start`
Expected: build réussit sans warning bloquant.

- [ ] **Step 2: Lancer Lighthouse**

Dans Chrome DevTools (page `/`) : onglet Lighthouse → Mobile / Performance, Accessibility, Best Practices → Analyse.
Expected:
- Performance ≥ 80 (objectif idéal 90+)
- Accessibility ≥ 95
- Best Practices ≥ 95

Si Performance < 80 :
- Vérifier le poids des vidéos hero (`/public/video/*.mp4`) — si > 5 Mo chacune, marquer comme TODO pour compression future
- Vérifier les images `mainImage` des cars — si non-WebP, c'est attendu (le Cloudflare R2 sert directement, mais Next/Image les optimise au runtime)

- [ ] **Step 3: Commit du rapport si problèmes critiques**

Si des régressions de performance sont détectées (ex. classes CSS orphelines pesant > 10 KB), corriger inline et commit. Sinon, passer.

---

### Task 25: Vérifier que l'admin n'a pas régressé

**Files:**
- (lecture seule)

- [ ] **Step 1: Tester les pages admin**

Run: `npm run dev`, se connecter à `/admin/login` avec un compte admin (voir seed `npm run seed`), naviguer sur :
- `/admin/dashboard`
- `/admin/cars`
- `/admin/bookings`
- `/admin/clients`
- `/admin/blocked-dates`

Expected: tout fonctionne comme avant. Le thème admin est isolé (`.admin-theme` dans globals.css), les modifications du redesign home ne doivent pas l'affecter.

- [ ] **Step 2: Si régression, créer un commit ciblé**

Si une page admin casse à cause d'une suppression dans `globals.css`, restaurer la classe nécessaire et committer :
```bash
git add src/app/globals.css
git commit -m "fix(admin): restore <class> for admin layouts"
```

---

### Task 26: Mettre à jour `CLAUDE.md` avec le nouveau découpage de la home

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Ajouter une section "Home composition"**

Dans `CLAUDE.md`, après la section "Architecture", ajouter :

```markdown
### Homepage composition

The homepage (`src/app/page.tsx`) is composed of section components under `src/components/home/`:

1. `HeroSection` — full-bleed video hero with staged entry animations
2. `ManifestoSection` — scroll-driven word-by-word highlight (`WordHighlight`)
3. `FleetSection` — 3 featured `CarCard`s with staggered reveal
4. `ProcessSection` — 3-step process with traced hairline
5. `InfoSection` — 2x2 grid of `InfoCard`s
6. `CtaSection` — final CTA with ticker-arrow button

Animations are layered:
- Entry animations (hero only) via CSS `@keyframes`, no JS
- `useRevealOnScroll` hook for scroll-triggered reveal classes (`reveal-fade-up`, `reveal-blur`, `reveal-clip`, `reveal-stagger`, `reveal-line`)
- Lenis smooth scroll mounted in root layout (disabled on touch + reduced-motion)
- `WordHighlight` component computes scroll progress to animate word colors
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: document homepage composition and animation layers"
```

---

## Self-Review Checklist (déjà passé)

**Spec coverage:**
- [x] §1 Direction visuelle (palette, typo, spacing) → Task 1, 3
- [x] §2 Architecture (7 sections) → Task 14-19, 20
- [x] §3.0 Header → Task 7
- [x] §3.1 Hero → Task 14
- [x] §3.2 Manifesto → Task 13, 15
- [x] §3.3 Flotte → Task 16
- [x] §3.4 Processus → Task 17
- [x] §3.5 À savoir → Task 18
- [x] §3.6 CTA final → Task 12, 19
- [x] §3.7 Footer → Task 8
- [x] §4 Système d'animations (4 couches) → Task 3, 4, 5, 13, 14
- [x] §5 Mise en œuvre (fichiers impactés) → Toutes les tâches
- [x] §6 Performance → Task 24
- [x] §7 Accessibilité → Task 23
- [x] §9 Critères de succès → Task 22-26

**Placeholder scan:** aucun "TODO", "TBD", code vague. Tous les blocs de code sont complets.

**Type consistency:** `useRevealOnScroll<T>` est typé `T extends HTMLElement` ; les composants utilisent `<HTMLDivElement>` ou `<HTMLHeadingElement>` cohéremment. `InfoCard` change d'API (de `{title, content, icon}` à `{title, children}`) — l'usage à la Task 18 utilise bien la nouvelle API.

---

## Plan complete

**Total tasks:** 26
**Estimated commits:** ~25
**Files created:** 14 nouveaux composants + 1 hook
**Files modified:** ~8 (page, layout, header, footer, hero-video, scroll-progress, car-card, info-card, globals.css, CLAUDE.md)
**Files deleted:** 1 (`animated-text.tsx`)
**New dependencies:** 1 (`lenis`)
