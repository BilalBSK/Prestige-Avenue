// Route-transition indicator shown during client-side navigation (the modern
// "top progress bar" pattern used by GitHub / YouTube / Vercel). It is purely a
// fixed 2px sliver — it reserves no layout height; the empty content area is held
// open by <main className="min-h-screen"> in public-chrome.tsx, so the persistent
// footer never rides up while a route loads (no more "footer first, then jump").
export default function LoadingPage() {
  return (
    <div
      aria-hidden
      className="route-progress-bar pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] overflow-hidden"
    >
      <div className="route-progress h-full" />
      <style>{`
        .route-progress {
          width: 35%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            var(--ink-ivory) 45%,
            #ffffff 60%,
            var(--ink-ivory) 75%,
            transparent 100%
          );
          box-shadow: 0 0 10px 0 rgba(245, 240, 230, 0.55);
          animation: route-progress 1150ms cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }
        @keyframes route-progress {
          0% { transform: translateX(-115%); }
          50% { transform: translateX(60%); }
          100% { transform: translateX(230%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .route-progress {
            width: 100%;
            animation: route-progress-pulse 1200ms ease-in-out infinite;
            transform: none;
          }
          @keyframes route-progress-pulse {
            0%, 100% { opacity: 0.35; }
            50% { opacity: 0.9; }
          }
        }
      `}</style>
    </div>
  );
}
