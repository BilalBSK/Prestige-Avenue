"use client";

import { memo } from "react";

interface InfoCardProps {
  title: string;
  content: string | React.ReactNode;
  icon?: React.ReactNode;
  variant?: "default" | "wide";
}

function InfoCardComponent({ title, content, icon, variant = "default" }: InfoCardProps) {
  return (
    <article className="info-card group relative overflow-hidden">
      {/* Animated light sweep effect on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
        <div className="info-card-sweep absolute inset-0" />
      </div>

      {/* Border glow effect */}
      <div className="info-card-glow absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

      {/* Top accent line */}
      <div className="absolute left-0 top-0 h-[1px] w-0 bg-gradient-to-r from-white via-zinc-400 to-transparent transition-all duration-700 group-hover:w-full" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col p-6">
        {/* Icon & Title */}
        <div className="flex items-start gap-4">
          {icon && (
            <div className="info-card-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/10 transition-all duration-500 group-hover:border-white/20 group-hover:bg-white/15">
              {icon}
            </div>
          )}
          <div className="flex-1">
            <h4 className="text-lg font-semibold tracking-tight text-white transition-colors duration-500 group-hover:text-white">
              {title}
            </h4>
          </div>
        </div>

        {/* Content */}
        <div className="mt-4 flex-1">
          {typeof content === "string" ? (
            <p className="text-sm leading-relaxed text-zinc-400 transition-colors duration-500 group-hover:text-zinc-300">
              {content}
            </p>
          ) : (
            content
          )}
        </div>

        {/* Bottom corner accent */}
        <div className="absolute bottom-0 right-0 h-12 w-12 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
          <div className="absolute bottom-0 right-0 h-[1px] w-8 bg-gradient-to-l from-white/40 to-transparent" />
          <div className="absolute bottom-0 right-0 h-8 w-[1px] bg-gradient-to-t from-white/40 to-transparent" />
        </div>
      </div>
    </article>
  );
}

// Memoize to prevent unnecessary re-renders
export const InfoCard = memo(InfoCardComponent);
