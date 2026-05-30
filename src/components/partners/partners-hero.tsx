export function PartnersHero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-[var(--ink-line)] bg-[var(--ink-onyx)] pb-14 pt-16 md:pb-20 md:pt-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.05]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence baseFrequency='1.4'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.45'/></svg>\")",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[320px] w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.04),transparent_70%)] blur-2xl"
      />

      <div className="lux-container relative z-10">
        <h1 className="contact-hero-title max-w-[18ch] font-[family:var(--font-fraunces)] text-[clamp(44px,7vw,92px)] font-light leading-[0.95] tracking-[-0.035em] text-[var(--ink-ivory)]">
          Construisons{" "}
          <em className="italic font-normal">ensemble.</em>
        </h1>
        <span aria-hidden className="contact-heading-rule mt-7 block" />
        <p className="contact-hero-lede mt-8 max-w-[460px] font-[family:var(--font-dm-sans)] text-[15px] leading-[1.7] text-[var(--ink-text-soft)]">
          Créateurs, hôteliers, agences, apporteurs d&apos;affaires. Nous
          cherchons en permanence des collaborations qui élèvent les deux
          marques.
        </p>
      </div>
    </section>
  );
}
