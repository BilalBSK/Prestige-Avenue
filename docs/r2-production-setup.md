# Stockage des médias (Cloudflare R2) — guide complet

Ce document explique **où sont stockées les photos et vidéos des voitures**, et
**ce qu'il restera à faire le jour du vrai lancement** pour rendre ce stockage
« professionnel ». C'est écrit pour être compris **sans connaissances
techniques**.

> 🟢 **À retenir tout de suite : aujourd'hui, tu n'as RIEN à faire.** Tout
> fonctionne. Les étapes de ce guide sont à faire **uniquement le jour où tu
> mettras le vrai site en ligne** (quand tu remplaceras l'ancien site du client
> sur OVH). Tu peux donc ranger ce document et y revenir à ce moment-là.

---

## 1. C'est quoi, et comment ça marche aujourd'hui ?

### Le principe en une image

Imagine un **entrepôt** où tu ranges toutes les photos et vidéos de tes
voitures. Cet entrepôt, c'est **Cloudflare R2** (un service de stockage en ligne,
gratuit, fiable, utilisé par de vrais sites pros). Ton entrepôt s'appelle
`prestige-avenue` et il existe déjà.

Pour que les visiteurs voient les photos sur le site, l'entrepôt a une **adresse
publique** — comme l'adresse d'une boutique. Aujourd'hui, cette adresse est
celle fournie par défaut :

```
https://pub-9054e8f4....r2.dev   ← l'adresse "temporaire" actuelle
```

Quand un visiteur ouvre une fiche voiture, son navigateur va chercher la photo à
cette adresse. Quand toi tu ajoutes une photo depuis l'admin, elle est rangée
dans l'entrepôt.

### Ce que tu as déjà (vérifié le 2026-06-07)

| Élément | Ta valeur réelle | Ça veut dire quoi |
|---|---|---|
| Ton entrepôt (bucket) | **`prestige-avenue`** | Existe déjà — **on n'en crée pas d'autre, jamais** |
| Ce qu'il contient | 9 fichiers, ~10 Mo | 6 photos de voitures + 3 de collaborations |
| L'adresse publique | `pub-9054e8f4...r2.dev` | L'adresse temporaire « de chantier » |
| Tes accès (clés) | déjà dans `.env` | Tout est branché, les imports marchent |

**Bilan : ça marche.** Tu peux ajouter des photos, elles s'affichent. Rien de
cassé.

---

## 2. Alors c'est quoi le problème, et pourquoi changer ?

Le seul souci, c'est cette **adresse temporaire `r2.dev`**.

C'est une adresse « de chantier » que Cloudflare fournit pour développer et
tester. Elle a **deux limites** qui n'ont aucune importance maintenant, mais qui
deviendront un problème avec du vrai trafic :

1. **Elle est bridée (« rate-limited »).** Cloudflare ralentit volontairement
   cette adresse si trop de monde s'en sert en même temps. Pour ton client qui
   regarde la preview, aucun souci. Pour un vrai site public avec des centaines
   de visiteurs, les photos pourraient se charger lentement ou par à-coups.

2. **Elle n'a pas de « cache mondial ».** (Le cache, c'est expliqué juste après.)
   Résultat : chaque photo est rechargée depuis l'entrepôt à chaque fois, ce qui
   est plus lent pour les visiteurs éloignés.

> **Pourquoi on ne le fait pas déjà ?** Parce que brancher la « vraie » adresse
> nécessite un **nom de domaine** (ex. le `.com` du client), et ce domaine n'est
> pas encore basculé sur le nouveau site. Tant que tu es en preview, l'adresse de
> chantier fait parfaitement le travail. **On changera l'adresse en même temps
> qu'on mettra le vrai site en ligne** — c'est le moment logique.

### Où en est le projet (le contexte qui explique le « plus tard »)

- **Le nouveau site** (celui qu'on construit) : en **preview sur Vercel**, juste
  pour que le client valide. Adresse temporaire = OK.
- **L'ancien site du client** : encore en ligne sur **OVH**, sur le vrai domaine,
  pas encore touché.
- **Le jour J** = quand tu basculeras le vrai domaine vers le nouveau site. **Ce
  jour-là**, et seulement ce jour-là, on fait les étapes ci-dessous.

---

## 3. Les étapes du jour du lancement

> Ces 4 étapes prennent ~15-20 minutes. Elles ne touchent **ni à l'entrepôt, ni
> aux photos déjà dedans** : on change juste l'adresse et on ajoute le cache.

### Étape 1 — Donner une « vraie » adresse à l'entrepôt

**Ce que ça change :** on remplace l'adresse de chantier `pub-...r2.dev` par une
adresse à toi, propre et pro, par exemple `media.le-domaine-du-client.com`.

**Ce que ça permet :** plus de bridage (les photos se chargent à pleine vitesse
même avec beaucoup de visiteurs), et ça débloque le cache mondial de l'étape 2.

**Comment faire :**

1. **Prérequis — le domaine doit être « géré par Cloudflare ».**
   En clair : Cloudflare doit être l'aiguilleur qui dit « telle adresse →
   tel endroit ». Si le domaine du client est chez OVH, il faut le « déléguer »
   à Cloudflare une seule fois :
   - Sur Cloudflare → bouton **Add a site** → entrer le domaine du client.
   - Cloudflare donne 2 adresses de serveurs DNS à recopier chez OVH (dans la
     gestion du domaine OVH). C'est gratuit.
   - ⚠️ **Ton site, lui, reste hébergé où tu veux** (Vercel, OVH…). On ne déplace
     que « l'aiguillage », pas le site. Et on n'utilise qu'un **sous-domaine
     dédié aux médias** (`media.…`), donc ça ne perturbe pas le site principal.
2. Sur Cloudflare → menu **R2** → clique sur ton entrepôt **`prestige-avenue`**
   → onglet **Settings**.
3. Section **Public access** → **Custom Domains** → bouton **Connect Domain**.
4. Saisis le sous-domaine voulu, ex. `media.le-domaine-du-client.com`
   → **Connect**.
5. Attends que le statut passe à **Active** (quelques minutes : Cloudflare
   fabrique le certificat de sécurité HTTPS — le petit cadenas du navigateur).

### Étape 2 — Activer le « cache mondial » (fortement recommandé)

**C'est quoi le cache ?** Une copie temporaire de tes photos stockée dans des
serveurs partout dans le monde (Paris, New York, etc.). Sans cache, chaque photo
fait l'aller-retour jusqu'à ton entrepôt à chaque visite. Avec le cache, le
visiteur reçoit la copie la plus proche de lui = **site beaucoup plus rapide**.

**Ce que ça change :** tes photos sont copiées sur le réseau mondial de
Cloudflare et servies depuis le point le plus proche du visiteur.

**Ce que ça permet :** un site rapide partout, et **moins de sollicitations de
ton entrepôt** (donc on reste tranquillement dans le gratuit, même si le trafic
grimpe).

**Comment faire :**

1. Sur Cloudflare → menu **Caching** → **Cache Rules** → **Create rule**.
2. Donne un nom (ex. « Cache médias »). Condition :
   `Hostname` **equals** `media.le-domaine-du-client.com`.
3. Action : choisis **Eligible for cache**, puis règle **Edge TTL** et
   **Browser TTL** sur **1 an**.
4. Clique **Deploy**.

> **Est-ce risqué de cacher 1 an ?** Non. Chaque photo a un nom unique généré
> automatiquement (un code du type `2f2794c5-...jpg`). Si tu remplaces une photo,
> elle reçoit un **nouveau** nom — donc le cache ne sert jamais une vieille
> version par erreur. C'est 100 % sûr.

### Étape 3 — Dire à l'application d'utiliser la nouvelle adresse

**Ce que ça change :** le site arrête de pointer vers l'adresse de chantier et
utilise ta nouvelle adresse propre.

**Ce que ça permet :** les fiches voitures afficheront les photos via
`media.le-domaine-du-client.com` au lieu de `r2.dev`.

**Comment faire :**

1. Sur **Vercel** → ton projet → **Settings** → **Environment Variables**.
2. Pour l'environnement **Production**, modifie **une seule** ligne :

   | Variable | Nouvelle valeur |
   |---|---|
   | `R2_PUBLIC_BASE_URL` | `https://media.le-domaine-du-client.com` |

3. **Redéploie** le site (Vercel applique la nouvelle valeur au prochain
   déploiement).

> Les autres réglages (`R2_BUCKET`, les clés, l'identifiant de compte) **ne
> changent pas**. Et il n'y a **aucune ligne de code à modifier** : l'application
> est déjà prévue pour lire cette adresse et l'utiliser automatiquement partout.

### Étape 4 — Vérifier que tout est bon

**Ce que ça prouve :** que le changement d'adresse a bien pris, et que les
visiteurs voient les photos depuis la nouvelle adresse.

**Comment faire :**

1. Ouvre le site en ligne → une fiche voiture : les photos et la vidéo
   s'affichent normalement.
2. Clic droit sur une photo → **Ouvrir l'image dans un nouvel onglet** :
   l'adresse en haut doit commencer par `https://media.le-domaine-du-client.com/`
   (et **plus** par `r2.dev`).

✅ **Si c'est le cas : ton stockage est en configuration professionnelle.**

---

## 4. Bon à savoir (argent, qualité, sécurité)

- **Ça coûte combien ?** Rien, dans ton cas. Cloudflare R2 ne facture **jamais**
  le trafic des visiteurs (c'est ce qui ruine la facture chez les concurrents).
  Le seul coût possible serait de dépasser **10 Go** de stockage (~0,015 $/Go
  au-delà). Tu es à **10 Mo**, soit 1000 fois moins. **Zéro risque de facture
  surprise.**
- **Poids des fichiers** (déjà imposé par l'application) : photos ≤ 5 Mo,
  vidéos ≤ 50 Mo (clips courts de 10-30 s). Conseil : exporte des vidéos MP4
  1080p déjà compressées — R2 stocke, mais ne compresse pas les vidéos à ta place.
- **Ne touche pas à la « classe de stockage »** dans Cloudflare : laisse
  **Standard** (le réglage par défaut). L'autre option (« Infrequent Access »)
  ajouterait des frais à chaque lecture de photo. Standard = parfait ici.

---

## 5. Note technique (pour un développeur, plus tard)

Le code applicatif est **volontairement minimal** : au moment d'envoyer un
fichier vers R2, il ne « signe » que les en-têtes `Content-Type` et
`Content-Length`. On a délibérément **retiré** l'ajout d'un en-tête
`Cache-Control` par fichier, car le CORS actuel du bucket ne l'autorise pas —
le tester a renvoyé une erreur `403` qui **cassait les imports de photos**. Le
cache est donc géré **au niveau du CDN** (étape 2), ce qui est plus simple et
tout aussi efficace.

Si un jour on veut vraiment poser le cache fichier-par-fichier à l'upload, il
faudra **d'abord** ajouter `Cache-Control` à `AllowedHeaders` dans la politique
CORS du bucket Cloudflare, **puis seulement** re-signer cet en-tête côté code
(`src/server/admin/upload.actions.ts`). Jamais l'inverse, sous peine de bloquer
tous les imports.
