import type { Metadata } from "next";
import { ContactHero } from "@/components/contact/contact-hero";
import { ContactCoordinates } from "@/components/contact/contact-coordinates";
import { ContactMap } from "@/components/contact/contact-map";

export const metadata: Metadata = {
  title: "Contact — Prestige Avenue",
  description:
    "Contactez l'équipe Prestige Avenue. Adresse, téléphone, email et horaires d'ouverture.",
};

const ADDRESS_LINE_1 = "72 Rue de Lessard";
const ADDRESS_LINE_2 = "76100 Rouen";
const PHONES = ["06 21 18 94 82", "07 68 27 93 88"];
const EMAIL = "prestigeavenuee@gmail.com";
const HOURS = "Lundi → Samedi · 9h — 19h";
const CITY = "Rouen";

const MAPS_EMBED_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2594.8133274479756!2d1.089591840903581!3d49.43134309198297!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e0de700503fa9f%3A0x965b275cbbb186db!2s72%20Rue%20de%20Lessard%2C%2076100%20Rouen!5e0!3m2!1sfr!2sfr!4v1779665989455!5m2!1sfr!2sfr";

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <ContactCoordinates
        address={{ line1: ADDRESS_LINE_1, line2: ADDRESS_LINE_2 }}
        phones={PHONES}
        email={EMAIL}
        hours={HOURS}
      />
      <ContactMap embedSrc={MAPS_EMBED_SRC} city={CITY} />
    </>
  );
}
