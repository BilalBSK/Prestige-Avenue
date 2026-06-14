"use client";

import { CSRF_COOKIE_NAME } from "./csrf-shared";

/**
 * Lit la valeur courante du cookie CSRF. Le cookie est volontairement
 * non-httpOnly, il est donc lisible ici — c'est le principe du « double submit »
 * (le client renvoie dans un en-tête la valeur du cookie, le serveur vérifie
 * qu'elles correspondent).
 */
export function readCsrfCookie(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CSRF_COOKIE_NAME}=`));
  if (!match) return "";
  return decodeURIComponent(match.slice(CSRF_COOKIE_NAME.length + 1));
}

/**
 * Renvoie un jeton CSRF FIABLE au moment précis de l'appel : on lit le cookie
 * vivant (la seule source de vérité partagée avec le serveur). S'il manque
 * (expiré, vidé, première visite), on appelle `/api/csrf` qui (re)pose le cookie
 * et renvoie le jeton correspondant.
 *
 * À utiliser juste avant un envoi protégé (upload, mutation) plutôt qu'un jeton
 * mémorisé à l'ouverture de la page : élimine la classe de bugs
 * « jeton en mémoire périmé ≠ cookie » → « CSRF invalide ».
 */
export async function ensureCsrfToken(): Promise<string> {
  const fromCookie = readCsrfCookie();
  if (fromCookie) return fromCookie;

  const res = await fetch("/api/csrf", { cache: "no-store" });
  const data = (await res.json().catch(() => ({}))) as { csrfToken?: string };
  return data.csrfToken ?? readCsrfCookie();
}
