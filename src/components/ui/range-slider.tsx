"use client";

import { useId, useMemo } from "react";

interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  formatLabel?: (value: number) => string;
}

export function RangeSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  formatLabel = (v) => String(v),
}: RangeSliderProps) {
  const id = useId();
  const [low, high] = value;

  const leftPct = useMemo(
    () => ((low - min) / (max - min)) * 100,
    [low, min, max],
  );
  const rightPct = useMemo(
    () => ((high - min) / (max - min)) * 100,
    [high, min, max],
  );

  function setLow(next: number) {
    const clamped = Math.min(next, high - step);
    onChange([Math.max(min, clamped), high]);
  }

  function setHigh(next: number) {
    const clamped = Math.max(next, low + step);
    onChange([low, Math.min(max, clamped)]);
  }

  return (
    <div className="select-none">
      <div className="mb-3 flex items-center justify-between font-[family:var(--font-dm-sans)] text-[12px] text-[var(--ink-text-soft)]">
        <span>{formatLabel(low)}</span>
        <span>{formatLabel(high)}</span>
      </div>
      <div className="relative h-[28px]">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[var(--ink-line-soft)]" />
        <div
          className="absolute top-1/2 h-px -translate-y-1/2 bg-[var(--ink-ivory)]"
          style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
        />
        <input
          id={`${id}-low`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={low}
          onChange={(e) => setLow(Number(e.target.value))}
          aria-label="Prix minimum"
          className="range-thumb pointer-events-auto absolute inset-0 z-10 h-full w-full appearance-none bg-transparent"
        />
        <input
          id={`${id}-high`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={high}
          onChange={(e) => setHigh(Number(e.target.value))}
          aria-label="Prix maximum"
          className="range-thumb pointer-events-auto absolute inset-0 z-20 h-full w-full appearance-none bg-transparent"
        />
      </div>
      <style>{`
        .range-thumb { pointer-events: none; }
        .range-thumb::-webkit-slider-thumb {
          pointer-events: auto;
          appearance: none;
          width: 14px;
          height: 14px;
          background: var(--ink-ivory);
          border-radius: 50%;
          border: none;
          cursor: grab;
          transition: transform 200ms ease;
        }
        .range-thumb::-webkit-slider-thumb:active { cursor: grabbing; transform: scale(1.15); }
        .range-thumb::-moz-range-thumb {
          pointer-events: auto;
          width: 14px;
          height: 14px;
          background: var(--ink-ivory);
          border-radius: 50%;
          border: none;
          cursor: grab;
          transition: transform 200ms ease;
        }
        .range-thumb::-moz-range-thumb:active { cursor: grabbing; transform: scale(1.15); }
        .range-thumb::-webkit-slider-runnable-track { background: transparent; height: 100%; }
        .range-thumb::-moz-range-track { background: transparent; height: 100%; }
        .range-thumb:focus-visible::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.18);
        }
        .range-thumb:focus-visible::-moz-range-thumb {
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.18);
        }
      `}</style>
    </div>
  );
}
