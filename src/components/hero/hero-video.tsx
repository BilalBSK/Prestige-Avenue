"use client";

import { useEffect, useRef, useState } from "react";

type HeroLayer = "intro" | "a" | "b" | "c";

const CROSSFADE_MS = 1900;

export function HeroVideo() {
  const firstVideoRef = useRef<HTMLVideoElement>(null);
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  const background2VideoRef = useRef<HTMLVideoElement>(null);
  const background3VideoRef = useRef<HTMLVideoElement>(null);
  const [playbackError, setPlaybackError] = useState(false);
  const [activeLayer, setActiveLayer] = useState<HeroLayer>("intro");
  const activeLayerRef = useRef<HeroLayer>("intro");
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    activeLayerRef.current = activeLayer;
  }, [activeLayer]);

  useEffect(() => {
    const firstVideo = firstVideoRef.current;
    const backgroundVideo = backgroundVideoRef.current;
    const background2Video = background2VideoRef.current;
    const background3Video = background3VideoRef.current;

    if (!firstVideo || !backgroundVideo || !background2Video || !background3Video) {
      return;
    }

    const tryPlay = async (video: HTMLVideoElement) => {
      try {
        await video.play();
      } catch {
        setPlaybackError(true);
      }
    };

    const getVideoByLayer = (layer: HeroLayer) => {
      if (layer === "intro") return firstVideo;
      if (layer === "a") return backgroundVideo;
      if (layer === "b") return background2Video;
      return background3Video;
    };

    // Loop order: intro → a → b → c → a → … Knowing the successor lets us buffer
    // it one step ahead so each crossfade starts from an already-decoded frame.
    const nextOf = (layer: HeroLayer): Exclude<HeroLayer, "intro"> => {
      if (layer === "intro" || layer === "c") return "a";
      if (layer === "a") return "b";
      return "c";
    };

    // Promote a layer to eager buffering. Guarded so the second pass through the
    // loop (everything already "auto") never re-issues a redundant load().
    const warmUp = (video: HTMLVideoElement) => {
      if (video.preload !== "auto") {
        video.preload = "auto";
        video.load();
      }
    };

    const switchTo = async (nextLayer: Exclude<HeroLayer, "intro">) => {
      if (isTransitioningRef.current) return;

      const currentLayer = activeLayerRef.current;
      const currentVideo = getVideoByLayer(currentLayer);
      const nextVideo = getVideoByLayer(nextLayer);

      isTransitioningRef.current = true;
      warmUp(nextVideo); // usually a no-op — pre-warmed during the previous layer
      nextVideo.currentTime = 0;
      await tryPlay(nextVideo);
      setActiveLayer(nextLayer);
      // Start buffering the layer after this one while the current clip plays out.
      warmUp(getVideoByLayer(nextOf(nextLayer)));

      window.setTimeout(() => {
        if (currentVideo !== nextVideo) {
          currentVideo.pause();
          currentVideo.currentTime = 0;
        }
        isTransitioningRef.current = false;
      }, CROSSFADE_MS + 120);
    };

    firstVideo.currentTime = 0;
    backgroundVideo.currentTime = 0;
    background2Video.currentTime = 0;
    background3Video.currentTime = 0;
    backgroundVideo.pause();
    background2Video.pause();
    background3Video.pause();
    void tryPlay(firstVideo);
    // Buffer the first background while the intro plays, so the opening
    // crossfade is as smooth as every subsequent one.
    warmUp(backgroundVideo);

    const onFirstEnded = () => {
      void switchTo("a");
    };

    const onBackgroundEnded = () => {
      if (activeLayerRef.current === "a") {
        void switchTo("b");
      }
    };

    const onBackground2Ended = () => {
      if (activeLayerRef.current === "b") {
        void switchTo("c");
      }
    };

    const onBackground3Ended = () => {
      if (activeLayerRef.current === "c") {
        void switchTo("a");
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        firstVideo.pause();
        backgroundVideo.pause();
        background2Video.pause();
        background3Video.pause();
        return;
      }
      void tryPlay(getVideoByLayer(activeLayerRef.current));
    };

    firstVideo.addEventListener("ended", onFirstEnded);
    backgroundVideo.addEventListener("ended", onBackgroundEnded);
    background2Video.addEventListener("ended", onBackground2Ended);
    background3Video.addEventListener("ended", onBackground3Ended);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      firstVideo.removeEventListener("ended", onFirstEnded);
      backgroundVideo.removeEventListener("ended", onBackgroundEnded);
      background2Video.removeEventListener("ended", onBackground2Ended);
      background3Video.removeEventListener("ended", onBackground3Ended);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  if (playbackError) {
    return (
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.15),transparent_40%),linear-gradient(180deg,#0c0c0f_0%,#050505_70%)]" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <video
        ref={firstVideoRef}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${activeLayer === "intro" ? "opacity-55" : "opacity-0"}`}
        autoPlay
        muted
        playsInline
        preload="auto"
        onError={() => setPlaybackError(true)}
      >
        <source src="/video/first.mp4" type="video/mp4" />
      </video>
      <video
        ref={backgroundVideoRef}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${activeLayer === "a" ? "opacity-55" : "opacity-0"}`}
        muted
        playsInline
        preload="metadata"
        onError={() => setPlaybackError(true)}
      >
        <source src="/video/background.mp4" type="video/mp4" />
      </video>
      <video
        ref={background2VideoRef}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${activeLayer === "b" ? "opacity-55" : "opacity-0"}`}
        muted
        playsInline
        preload="metadata"
        onError={() => setPlaybackError(true)}
      >
        <source src="/video/background2.mp4" type="video/mp4" />
      </video>
      <video
        ref={background3VideoRef}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${activeLayer === "c" ? "opacity-55" : "opacity-0"}`}
        muted
        playsInline
        preload="metadata"
        onError={() => setPlaybackError(true)}
      >
        <source src="/video/background3.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/24" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_15%,rgba(255,255,255,0.14),transparent_40%)]" />
    </div>
  );
}
