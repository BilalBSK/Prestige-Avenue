"use client";

export default function AdminErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-500/40 bg-red-950/20 p-4">
      <p className="text-red-300">Erreur admin: {error.message}</p>
      <button type="button" onClick={reset} className="mt-3 rounded bg-red-500 px-3 py-1 text-sm">
        Reessayer
      </button>
    </div>
  );
}
