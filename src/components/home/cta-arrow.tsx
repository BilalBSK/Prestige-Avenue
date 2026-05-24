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
