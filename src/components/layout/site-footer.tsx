export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-zinc-800/80 bg-black/80 py-10">
      <div className="lux-container flex flex-col justify-between gap-4 text-sm text-zinc-400 md:flex-row">
        <p>© {new Date().getFullYear()} Prestige Avenue. Tous droits reserves.</p>
        <p>Mobilite de prestige - Paris, Monaco, Geneve.</p>
      </div>
    </footer>
  );
}
