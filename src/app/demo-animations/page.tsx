import {
  AnimatedText,
  AnimatedUnderlineText,
  GlitchText,
} from "@/components/ui/animated-text";
import Link from "next/link";

export default function AnimationsDemoPage() {
  return (
    <div className="lux-container space-y-20 py-16">
      <div className="space-y-4">
        <h1 className="text-5xl font-[family:var(--font-display)] text-white">
          🎬 Démonstration des Animations Typographiques
        </h1>
        <p className="text-zinc-400">
          Rechargez la page pour revoir les animations d&apos;entrée
        </p>
        <Link href="/" className="lux-btn-secondary inline-block">
          ← Retour
        </Link>
      </div>

      {/* Word Stagger */}
      <section className="space-y-4 border-t border-zinc-800 pt-12">
        <h2 className="text-2xl font-semibold text-white">1. Word Stagger</h2>
        <p className="text-sm text-zinc-500">Révélation mot par mot avec rotation 3D</p>
        <AnimatedText
          text="Prestige Avenue Excellence Automobile"
          as="h3"
          animation="word-stagger"
          delay={100}
          className="text-5xl font-[family:var(--font-display)] text-white"
        />
      </section>

      {/* Blur Reveal */}
      <section className="space-y-4 border-t border-zinc-800 pt-12">
        <h2 className="text-2xl font-semibold text-white">2. Blur Reveal</h2>
        <p className="text-sm text-zinc-500">Flou vers net cinématique</p>
        <AnimatedText
          text="Découvrez notre collection de véhicules d'exception sélectionnés pour vous"
          as="p"
          animation="blur-reveal"
          delay={100}
          className="text-2xl text-zinc-300"
        />
      </section>

      {/* 3D Tilt */}
      <section className="space-y-4 border-t border-zinc-800 pt-12">
        <h2 className="text-2xl font-semibold text-white">3. 3D Tilt</h2>
        <p className="text-sm text-zinc-500">Rotation 3D perspective</p>
        <AnimatedText
          text="Votre luxe sur roues"
          as="h3"
          animation="3d-tilt"
          delay={100}
          className="text-5xl font-[family:var(--font-display)] text-white"
        />
      </section>

      {/* Elastic */}
      <section className="space-y-4 border-t border-zinc-800 pt-12">
        <h2 className="text-2xl font-semibold text-white">4. Elastic Bounce</h2>
        <p className="text-sm text-zinc-500">Rebond élastique dynamique</p>
        <div className="text-elastic inline-block text-4xl font-bold text-white">
          Réserver maintenant 🚗
        </div>
      </section>

      {/* Expand */}
      <section className="space-y-4 border-t border-zinc-800 pt-12">
        <h2 className="text-2xl font-semibold text-white">5. Letter Expand</h2>
        <p className="text-sm text-zinc-500">Espacement progressif des lettres</p>
        <AnimatedText
          text="COLLECTION PRESTIGE 2026"
          as="h3"
          animation="expand"
          delay={100}
          className="text-3xl font-bold tracking-wider text-white"
        />
      </section>

      {/* Fade Slide */}
      <section className="space-y-4 border-t border-zinc-800 pt-12">
        <h2 className="text-2xl font-semibold text-white">6. Fade Slide</h2>
        <p className="text-sm text-zinc-500">Glissement doux classique</p>
        <AnimatedText
          text="Des véhicules contrôlés, une assurance incluse et une assistance dédiée à votre service"
          as="p"
          animation="fade-slide"
          delay={100}
          className="text-xl text-zinc-300"
        />
      </section>

      {/* Scale Reveal */}
      <section className="space-y-4 border-t border-zinc-800 pt-12">
        <h2 className="text-2xl font-semibold text-white">7. Scale Reveal</h2>
        <p className="text-sm text-zinc-500">Zoom avec défloutage</p>
        <AnimatedText
          text="NOUVEAUTÉ 2026"
          as="h3"
          animation="scale-reveal"
          delay={100}
          className="text-4xl font-bold text-white"
        />
      </section>

      {/* Light Sweep */}
      <section className="space-y-4 border-t border-zinc-800 pt-12">
        <h2 className="text-2xl font-semibold text-white">8. Light Sweep</h2>
        <p className="text-sm text-zinc-500">Lumière qui traverse les lettres (infini, rapide)</p>
        <AnimatedText
          text="Prestige Avenue"
          as="h3"
          animation="light-sweep"
          className="text-6xl font-[family:var(--font-display)] font-bold"
        />
      </section>

      {/* Light Sweep Slow */}
      <section className="space-y-4 border-t border-zinc-800 pt-12">
        <h2 className="text-2xl font-semibold text-white">9. Light Sweep Slow</h2>
        <p className="text-sm text-zinc-500">Lumière qui traverse les lettres (infini, lent)</p>
        <AnimatedText
          text="Excellence Automobile"
          as="h3"
          animation="light-sweep-slow"
          className="text-5xl font-bold"
        />
      </section>

      {/* Gradient Mono */}
      <section className="space-y-4 border-t border-zinc-800 pt-12">
        <h2 className="text-2xl font-semibold text-white">10. Gradient Monochrome</h2>
        <p className="text-sm text-zinc-500">Shimmer monochrome animé (infini)</p>
        <AnimatedText
          text="Collection 2026"
          as="h3"
          animation="gradient-mono"
          className="text-5xl font-bold"
        />
      </section>

      {/* Split Reveal */}
      <section className="space-y-4 border-t border-zinc-800 pt-12">
        <h2 className="text-2xl font-semibold text-white">11. Split Reveal</h2>
        <p className="text-sm text-zinc-500">Masque vertical ascendant</p>
        <AnimatedText
          text="Découvrez"
          as="h3"
          animation="split-reveal"
          className="text-6xl font-[family:var(--font-display)] text-white"
        />
      </section>

      {/* Underline Reveal */}
      <section className="space-y-4 border-t border-zinc-800 pt-12">
        <h2 className="text-2xl font-semibold text-white">12. Underline Reveal</h2>
        <p className="text-sm text-zinc-500">Soulignement progressif blanc</p>
        <h3 className="text-5xl font-bold text-white">
          <AnimatedUnderlineText text="Audi A3 Sportback" />
        </h3>
      </section>

      {/* Glitch */}
      <section className="space-y-4 border-t border-zinc-800 pt-12">
        <h2 className="text-2xl font-semibold text-white">13. Glitch Effect (Hover)</h2>
        <p className="text-sm text-zinc-500">Effet glitch monochrome au survol</p>
        <h3 className="text-5xl font-bold text-white">
          <GlitchText text="COLLECTION" /> PREMIUM
        </h3>
      </section>

      {/* Combinaisons */}
      <section className="space-y-4 border-t border-zinc-800 pt-12">
        <h2 className="text-2xl font-semibold text-white">14. Combinaisons</h2>
        <p className="text-sm text-zinc-500">Plusieurs effets ensemble</p>
        <div className="space-y-6">
          <h3 className="text-5xl font-[family:var(--font-display)]">
            <GlitchText text="Collection" className="inline-block text-white" />{" "}
            <AnimatedText
              text="Prestige Avenue"
              as="span"
              animation="light-sweep"
              delay={200}
              className="inline-block"
            />
          </h3>

          <h4 className="text-4xl">
            <AnimatedUnderlineText text="Audi A3 Sportback" className="text-light-sweep" />{" "}
            <AnimatedText
              text="à partir de 40 EUR"
              as="span"
              animation="elastic"
              delay={400}
              className="inline-block text-white"
            />
          </h4>

          <div className="text-elastic inline-flex gap-3">
            <button className="lux-btn-primary">Voir le catalogue</button>
            <button className="lux-btn-secondary">En savoir plus</button>
          </div>
        </div>
      </section>

      {/* Info */}
      <section className="space-y-4 border-t border-zinc-800 pt-12">
        <div className="lux-panel p-8">
          <h2 className="text-xl font-semibold text-white">📚 Documentation</h2>
          <p className="mt-2 text-zinc-400">
            Consultez le fichier <code className="text-white">ANIMATIONS.md</code> pour voir
            comment utiliser chaque animation et leurs propriétés.
          </p>
          <Link href="/" className="lux-btn-primary mt-4 inline-block">
            Retour à l&apos;accueil
          </Link>
        </div>
      </section>
    </div>
  );
}
