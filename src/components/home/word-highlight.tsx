"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface WordHighlightProps {
  text: string;
  /** Word index (0-based) where italic emphasis starts. Marks all words from this index to end. */
  italicFromIndex?: number;
  className?: string;
  /** Rendered element. Defaults to "p"; pass a heading tag to preserve semantics. */
  as?: "p" | "h2" | "h3";
}

export function WordHighlight({ text, italicFromIndex, className = "", as = "p" }: WordHighlightProps) {
  const Tag = as;
  const containerRef = useRef<HTMLElement | null>(null);
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
    <Tag
      ref={containerRef as React.Ref<HTMLHeadingElement & HTMLParagraphElement>}
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
    </Tag>
  );
}
