export default function CarsLoading() {
  return (
    <>
      <section className="lux-container pb-10 pt-16 md:pb-14 md:pt-20">
        <div className="space-y-5">
          <div className="cars-skel h-3 w-28 rounded-sm" />
          <div className="cars-skel h-12 w-3/4 rounded-sm md:h-16 md:w-1/2" />
          <div className="cars-skel h-3 w-2/3 rounded-sm" />
        </div>
      </section>

      <div className="sticky top-16 z-30 border-y border-[var(--ink-line)] bg-[rgba(5,5,5,0.88)] backdrop-blur-md">
        <div className="lux-container flex h-16 items-center justify-between gap-4">
          <div className="cars-skel h-3 w-24 rounded-sm" />
          <div className="flex items-center gap-2">
            <div className="cars-skel h-7 w-20 rounded-full" />
            <div className="cars-skel h-7 w-28 rounded-full" />
            <div className="cars-skel h-7 w-24 rounded-full" />
            <div className="cars-skel h-7 w-24 rounded-full" />
          </div>
          <div className="cars-skel h-3 w-20 rounded-sm" />
        </div>
      </div>

      <section className="lux-container py-14 md:py-16">
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-lg border border-[var(--ink-line)] bg-[var(--ink-surface)]"
            >
              <div className="cars-skel aspect-[4/3] w-full" />
              <div className="space-y-3 px-[22px] pb-[26px] pt-[22px]">
                <div className="cars-skel h-7 w-3/5 rounded-sm" />
                <div className="cars-skel h-3 w-2/5 rounded-sm" />
                <div className="mt-7 border-t border-[var(--ink-line)] pt-[18px]">
                  <div className="cars-skel h-3 w-16 rounded-sm" />
                  <div className="cars-skel mt-2 h-7 w-32 rounded-sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        .cars-skel {
          position: relative;
          overflow: hidden;
          background: var(--ink-elevated);
        }
        .cars-skel::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.04) 45%,
            rgba(255, 255, 255, 0.07) 50%,
            rgba(255, 255, 255, 0.04) 55%,
            transparent 100%
          );
          transform: translateX(-100%);
          animation: cars-skel-shimmer 1400ms cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes cars-skel-shimmer {
          to { transform: translateX(100%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .cars-skel::after { animation: none; }
        }
      `}</style>
    </>
  );
}
