# Mise en ligne — fiche du jour J (à suivre dans l'ordre)

Ce document rassemble **tout ce qu'il reste à faire** pour basculer le site de
l'adresse de test vers le vrai domaine `prestige-avenue.fr`. Écrit pour être suivi
**sans connaissances techniques**, étape par étape.

> 🟢 **Aujourd'hui, rien n'est cassé et rien n'est urgent.** Le site fonctionne
> déjà sur l'adresse de test. Cette fiche se déroule **le jour où tu décides de
> mettre en ligne le vrai domaine** — tout d'un coup, en ~30-45 min.

---

## 0. L'état actuel (déjà fait ✅)

| Brique | Où | État |
|---|---|---|
| Code | GitHub | ✅ |
| Site | Vercel (`prestige-avenue-staging.vercel.app`) | ✅ en ligne, plan **gratuit** |
| Base de données | Neon (cloud, EU) | ✅ branchée + remplie (les voitures s'affichent) |
| Médias (photos/vidéos) | Cloudflare R2 | ✅ marche (adresse temporaire `r2.dev`) |
| Domaine | OVH | ✅ possédé — **pas encore pointé vers Vercel** |

**Conclusion : rien à construire. Il reste à "officialiser" (4 étapes ci-dessous).**

---

## ⚠️ À VALIDER AVANT le jour J (humain, pas technique)

Le plan Vercel actuel est **gratuit (Hobby)**. Vercel **interdit le gratuit pour
un site commercial** → il faut passer en **Pro (~19 $/mois ≈ 19 €)**, payé par
l'entreprise (ton ami). **Prévenir ton ami** qu'il y aura ~19 €/mois sur sa carte
(c'est l'hébergement de son site — normal, comme son ancien OVH).

> Neon (base) **reste gratuit** au début. R2 (médias) est **gratuit**. Le domaine
> est **déjà payé**. Donc la **seule** dépense obligatoire = Vercel Pro.

---

## Étape 1 — Mettre le projet dans une « Team » Vercel payée par l'entreprise

**Pourquoi :** une « Team » = un espace séparé qui peut porter une carte bancaire
et passer en Pro. Ton compte perso reste gratuit et intact à côté.

1. Sur Vercel (ton compte) → menu en haut à gauche → **Create Team**. Nom =
   l'entreprise de ton ami.
2. Ouvre le projet actuel → **Settings** → **Transfer** → transfère-le vers la
   nouvelle Team. *(Le site ET le lien GitHub suivent — aucun rebuild, rien ne
   casse.)*
3. **Ton ami** rejoint la Team comme **Owner** (propriétaire) et met **sa** carte
   → bouton **Upgrade to Pro**. Toi tu restes **Owner ou Member** = tu gardes tout
   l'accès technique.

> Après le transfert : va dans **Settings → Environment Variables** et **vérifie
> que les variables sont toujours là** (`DATABASE_URL`, `DIRECT_URL`, les `R2_*`,
> `NEXTAUTH_SECRET`, etc.). Elles suivent normalement, mais on vérifie.

---

## Étape 2 — Pointer le domaine OVH vers Vercel

**Pourquoi :** dire à `prestige-avenue.fr` « le site est chez Vercel maintenant ».

1. Sur Vercel → projet → **Settings → Domains** → **Add** → saisis
   `prestige-avenue.fr` (et `www.prestige-avenue.fr`).
2. Vercel affiche **les enregistrements DNS à créer** (un type `A` pour le domaine
   nu, et/ou un `CNAME` pour le `www`). **Note-les.**
3. Manager OVH → **Noms de domaine** → `prestige-avenue.fr` → onglet **Zone DNS**.
4. Crée **exactement** les entrées demandées par Vercel (copie-colle nom + valeur).
   Si une ancienne entrée `A`/`CNAME` pointe vers l'ancien hébergement, **remplace-la**.
5. Retour sur Vercel : le domaine passe en **Valid / Active** (quelques minutes à
   quelques heures, le temps que le DNS se propage). Vercel fabrique le **HTTPS**
   (cadenas) tout seul.

> ⚠️ C'est le basculement visible : à partir de là, l'ancien site OVH n'est plus
> servi sur ce domaine — c'est le nouveau site Vercel qui répond.

---

## Étape 3 — Mettre à jour les réglages (variables d'environnement, sur VERCEL)

> 📌 **Important :** les anciens docs parlent de mettre les variables « sur OVH ».
> **C'est faux maintenant** — le site tourne sur **Vercel**, donc **toutes** les
> variables se règlent dans **Vercel → Settings → Environment Variables
> (Production)**, puis **redéploie** pour appliquer.

| Variable | Nouvelle valeur | Pourquoi |
|---|---|---|
| `NEXTAUTH_URL` | `https://prestige-avenue.fr` | login admin **+ SEO** : pilote `sitemap.xml` et `robots.txt` lus par Google |
| `R2_PUBLIC_BASE_URL` | `https://media.prestige-avenue.fr` | voir doc R2 (adresse propre des médias) — détail ci-dessous |

- **Médias (R2)** : la procédure complète (brancher l'adresse `media.…` + cache
  CDN) est dans **`docs/r2-production-setup.md`**. À faire à ce moment-là.
- **E-mails (Resend)** : vérifier le domaine + régénérer la clé API, procédure dans
  **`docs/email-production-setup.md`**. ⚠️ Ce doc dit « variables sur OVH » →
  **lire « sur Vercel »**. Les 3 variables `RESEND_API_KEY`, `EMAIL_FROM`,
  `BOOKING_NOTIFICATION_EMAIL` vont dans **Vercel**.

---

## Étape 4 — Vérifier que tout est bon (~5 min)

1. Ouvre **`https://prestige-avenue.fr`** → page d'accueil OK, cadenas HTTPS présent.
2. **Catalogue** `/cars` → les voitures s'affichent (= base Neon OK).
3. Clic droit sur une photo → **Ouvrir l'image** → l'adresse commence par
   `https://media.prestige-avenue.fr/` (et **plus** par `r2.dev`).
4. **Connexion admin** sur `/admin/login` → ça marche (= `NEXTAUTH_URL` OK).
5. **Fausse demande de réservation** avec une adresse à toi → l'agence reçoit
   « nouvelle demande », et après confirmation admin tu reçois « confirmée »
   (= e-mails OK).

---

## Récap express (l'ordre du jour J)

| # | Action | Où |
|---|---|---|
| 0 | Prévenir l'ami : ~19 €/mois (Vercel Pro) sur sa carte | — |
| 1 | Créer une Team + transférer le projet + Upgrade Pro | Vercel |
| 2 | Pointer `prestige-avenue.fr` (entrées DNS) | Vercel + OVH (Zone DNS) |
| 3 | `NEXTAUTH_URL` + médias R2 + e-mails Resend | Vercel (env) + voir docs dédiés |
| 4 | Vérifier site, photos, admin, e-mails | le site en ligne |

> Documents liés : `docs/r2-production-setup.md` (médias),
> `docs/email-production-setup.md` (e-mails).
