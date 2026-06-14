import type { MetadataRoute } from "next";

// Manifeste d'application web (PWA) — permet l'ajout à l'écran d'accueil et un
// rendu « app-like ». Next.js le sert à /manifest.webmanifest et injecte le
// <link rel="manifest"> automatiquement. Couleurs alignées sur la charte :
// noir signature #000, monogramme champagne. Icônes générées par
// scripts/generate-favicons.mjs.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Prestige Avenue — Location de véhicules de prestige",
    short_name: "Prestige Avenue",
    description:
      "Location de voitures de luxe à Rouen. Demande en ligne, validation sous 24 h, règlement à la remise des clés.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
