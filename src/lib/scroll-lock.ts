import type Lenis from "lenis";

let lenisInstance: Lenis | null = null;
let lockCount = 0;

export function registerLenis(instance: Lenis | null) {
  lenisInstance = instance;
}

/**
 * Jump to the very top of the page instantly, covering BOTH scroll engines:
 * Lenis (desktop) keeps its own animated position, so a bare window.scrollTo
 * leaves it out of sync — we reset Lenis directly when present, and always
 * reset the native scroll for touch / reduced-motion. Used when the splash
 * lifts so every load reveals the top, never a restored footer position.
 */
export function scrollToTopImmediate() {
  if (typeof window === "undefined") return;
  if (lenisInstance) {
    lenisInstance.scrollTo(0, { immediate: true, force: true });
  }
  window.scrollTo(0, 0);
}

export function lockScroll() {
  lockCount += 1;
  if (lockCount === 1) {
    lenisInstance?.stop();
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }
}

export function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    lenisInstance?.start();
  }
}

/**
 * Défile en douceur jusqu'à un élément, en laissant la place du header fixe.
 * Utilise Lenis si présent (desktop), sinon le smooth scroll natif (touch /
 * reduced-motion). Centralisé ici pour garder l'instance Lenis encapsulée.
 */
export function smoothScrollTo(target: HTMLElement, headerOffset = 96) {
  if (lenisInstance) {
    lenisInstance.scrollTo(target, { offset: -headerOffset });
    return;
  }
  const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
  window.scrollTo({ top, behavior: "smooth" });
}
