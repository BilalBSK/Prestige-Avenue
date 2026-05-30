import type { Metadata } from "next";
import { ContactHero } from "@/components/contact/contact-hero";
import { ContactCoordinates } from "@/components/contact/contact-coordinates";
import { ContactMap } from "@/components/contact/contact-map";

export const metadata: Metadata = {
  title: "Contact — Prestige Avenue",
  description:
    "Contactez l'équipe Prestige Avenue. Adresse, téléphone, email et horaires d'ouverture.",
};

const ADDRESS_LINE_1 = "191 route des Docks";
const ADDRESS_LINE_2 = "76120 Le Grand-Quevilly";
const PHONES = ["06 21 18 94 82", "07 68 27 93 88"];
const EMAIL = "prestigeavenuee@gmail.com";
const HOURS = "Lundi → Samedi · 9h — 19h";
const CITY = "Le Grand-Quevilly";

const MAPS_EMBED_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2596.3549034876683!2d1.0186195768703075!3d49.402193762283346!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e0e0f87b237587%3A0x5c4bdadfb8e9908a!2s191%20Rte%20des%20Docks%2C%2076120%20Le%20Grand-Quevilly!5e0!3m2!1sen!2sfr!4v1780104234524!5m2!1sen!2sfr";

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
