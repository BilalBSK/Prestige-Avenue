export default function LoadingPage() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px overflow-hidden bg-transparent"
    >
      <div className="route-progress h-full bg-[var(--ink-ivory)]" />
      <style>{`
        .route-progress {
          width: 30%;
          animation: route-progress 1100ms cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }
        @keyframes route-progress {
          0% { transform: translateX(-110%); }
          50% { transform: translateX(40%); }
          100% { transform: translateX(220%); }
        }
      `}</style>
    </div>
  );
}
