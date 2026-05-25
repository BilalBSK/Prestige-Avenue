"use client";

interface BookingProgressProps {
  currentStep: 1 | 2 | 3;
  labels: [string, string, string];
}

export function BookingProgress({ currentStep, labels }: BookingProgressProps) {
  return (
    <div className="flex items-center">
      {labels.map((label, idx) => {
        const step = (idx + 1) as 1 | 2 | 3;
        const status =
          step < currentStep ? "done" : step === currentStep ? "active" : "idle";
        const isLast = step === 3;
        return (
          <div
            key={label}
            className={`flex items-center ${isLast ? "" : "flex-1"} gap-2.5 sm:gap-3`}
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div
                className={`flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center border text-[10px] font-[family:var(--font-fraunces)] transition-[border-color,background-color,color] duration-300 ${
                  status === "done"
                    ? "border-[var(--ink-ivory)] bg-[var(--ink-ivory)] text-[var(--ink-onyx)]"
                    : status === "active"
                      ? "border-[var(--ink-ivory)] bg-transparent text-[var(--ink-ivory)]"
                      : "border-[var(--ink-line-soft)] text-[var(--ink-muted)]"
                }`}
                aria-current={status === "active" ? "step" : undefined}
              >
                {status === "done" ? (
                  <span className="text-[11px] leading-none">✓</span>
                ) : (
                  <span className="italic leading-none">{step}</span>
                )}
              </div>
              <p
                className={`whitespace-nowrap font-[family:var(--font-dm-sans)] text-[9px] uppercase tracking-[0.22em] transition-colors duration-300 sm:text-[10px] sm:tracking-[0.24em] ${
                  status === "active"
                    ? "text-[var(--ink-ivory)]"
                    : status === "done"
                      ? "text-[var(--ink-text-soft)]"
                      : "text-[var(--ink-muted)]"
                }`}
              >
                {label}
              </p>
            </div>
            {!isLast && (
              <span
                aria-hidden
                className={`h-px min-w-[12px] flex-1 transition-colors duration-300 ${
                  status === "done"
                    ? "bg-[var(--ink-text-soft)]"
                    : "bg-[var(--ink-line)]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
