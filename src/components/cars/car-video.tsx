"use client";

import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";

interface CarVideoProps {
  videoUrl: string;
  title: string;
}

function toEmbedUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return `https://www.youtube-nocookie.com/embed/${url.pathname.slice(1)}`;
    }
    if (host.endsWith("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v) return `https://www.youtube-nocookie.com/embed/${v}`;
      if (url.pathname.startsWith("/embed/")) {
        return `https://www.youtube-nocookie.com${url.pathname}`;
      }
    }
    if (host.endsWith("vimeo.com")) {
      const id = url.pathname.split("/").filter(Boolean)[0];
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    return rawUrl;
  } catch {
    return null;
  }
}

export function CarVideo({ videoUrl, title }: CarVideoProps) {
  const ref = useRevealOnScroll<HTMLDivElement>({ threshold: 0.2 });
  const embedUrl = toEmbedUrl(videoUrl);
  if (!embedUrl) return null;

  return (
    <section className="lux-container py-24 md:py-32">
      <div className="mb-10 max-w-[680px]">
        <p className="mb-4 font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em] text-[var(--ink-muted)]">
          — En mouvement
        </p>
        <h3 className="font-[family:var(--font-fraunces)] text-[clamp(28px,3.5vw,44px)] font-light leading-[1.05] tracking-[-0.02em] text-[var(--ink-ivory)]">
          La voir <em className="italic font-normal">vivre.</em>
        </h3>
      </div>
      <div
        ref={ref}
        className="reveal-blur relative aspect-video w-full overflow-hidden border border-[var(--ink-line)] bg-[var(--ink-elevated)]"
      >
        <iframe
          src={embedUrl}
          title={`Vidéo — ${title}`}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </section>
  );
}
