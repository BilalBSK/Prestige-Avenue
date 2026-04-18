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
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px] bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-white/10 via-white to-white/10 transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
