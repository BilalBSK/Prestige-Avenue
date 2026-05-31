import { SectionCounter } from "./section-counter";
import { WordHighlight } from "./word-highlight";

export function ManifestoSection() {
  const text =
    "Une flotte choisie une à une. Des véhicules sélectionnés pour leur technologie, leur confort et leur prestance.";

  return (
    <section id="manifeste" className="manifesto py-32 md:py-40">
      <div className="lux-container">
        <SectionCounter index={2} className="mb-9" />
        <WordHighlight
          text={text}
          italicFromIndex={15}
          className="text-[clamp(32px,4vw,54px)] max-w-[920px]"
        />
      </div>
    </section>
  );
}
