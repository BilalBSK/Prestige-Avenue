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
