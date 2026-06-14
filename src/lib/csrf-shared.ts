// Constantes CSRF partagées, SANS aucun import — sûres à charger côté serveur,
// edge (middleware) ET client. Le module `csrf.ts` importe `next/headers` et ne
// peut donc pas être importé par du code client ; ces constantes vivent ici pour
// être utilisables des deux côtés sans dupliquer de chaîne magique.
export const CSRF_COOKIE_NAME = "csrf-token";
export const CSRF_HEADER_NAME = "x-csrf-token";

// 1 an. Le cookie CSRF n'a aucune raison d'expirer avec la session du navigateur.
// Le garder persistant évite qu'il disparaisse à la fermeture du navigateur —
// cause de « CSRF invalide » au réveil (le jeton gardé en mémoire par la page
// ne correspondait plus à un cookie absent).
export const CSRF_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
