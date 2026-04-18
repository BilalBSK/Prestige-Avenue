"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="lux-container flex min-h-[50vh] max-w-3xl items-center justify-center py-10">
      <div className="lux-panel w-full space-y-4 p-8 text-center">
        <h2 className="text-4xl font-[family:var(--font-display)] text-white">
          Une erreur est survenue
        </h2>
        <p className="text-zinc-400">{error.message}</p>
        <button type="button" onClick={reset} className="lux-btn-primary">
          Reessayer
        </button>
      </div>
    </div>
  );
}
