interface GoldRuleProps {
  /** Tailwind width utility, e.g. "w-16" or "w-full". Defaults to a short signature segment. */
  className?: string;
}

/**
 * GoldRule — a hairline divider in brushed gold with a reflet that drifts
 * slowly across it. A signature "effet bijou" accent meant to sit under a
 * section title or between blocks. Decorative only (aria-hidden).
 *
 * The visual work lives in `.gold-rule` (globals.css); this wrapper just sets
 * a sensible default width and forwards layout classes.
 */
export function GoldRule({ className = "w-16" }: GoldRuleProps) {
  return <span aria-hidden className={`gold-rule ${className}`} />;
}
