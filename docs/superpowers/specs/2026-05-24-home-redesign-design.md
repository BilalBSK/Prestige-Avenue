# Refonte de la page d'accueil — Prestige Avenue

**Date** : 2026-05-24
**Scope** : `src/app/page.tsx` et tous les composants impactés (`hero`, `cars/car-card`, `ui/info-card`, `layout/site-header`, `layout/site-footer`, `app/globals.css`)
**Hors scope** : pages `/cars`, `/cars/[id]`, admin, booking flow

---

## 1. Direction visuelle

**Monochrome pur, noir profond, contraste comme seul outil.** Aucune couleur d'accent. Aucun élément décoratif gratuit. La modernité naît de la typographie, du rythme, de l'espace et des animations — pas de gimmicks.

Références mentales : Apple (highlight progressif, respiration), Aesop (rigueur typographique), Linear (smoothness des animations), Patek Philippe (densité technique discrète).

### Palette (5 tons, zéro couleur)

| Token              | Hex       | Usage                                                           |
| ------------------ | --------- | --------------------------------------------------------------- |
| `--ink-onyx`       | `#050505` | Fond principal, body                                            |
| `--ink-surface`    | `#0a0a0c` | Cards, panneaux                                                 |
| `--ink-elevated`   | `#101013` | Hover des cards, états élevés                                   |
| `--ink-line`       | `#18181b` | Bordures par défaut                                             |
| `--ink-line-soft`  | `#27272a` | Hairlines structurelles, dividers de tableau                    |
| `--ink-muted`      | `#52525b` | Markers, micro-text                                             |
| `--ink-soft`       | `#71717a` | Labels, secondary                                               |
| `--ink-text-soft`  | `#a1a1aa` | Texte courant secondaire (ledes courts)                         |
| `--ink-text`       | `#e4e4e7` | Texte courant primaire (ledes serif)                            |
| `--ink-ivory`      | `#fafafa` | Texte titres, CTA primaire fond, accents                        |
| `--ink-dim`        | `#3f3f46` | État "off" du highlight progressif (manifeste)                  |

Aucune couleur d'accent (pas de doré, pas de safran, pas de bleu). Les hover et états actifs jouent uniquement sur opacity, contraste et fines lignes blanches.

### Typographie

Deux familles, déjà installées dans `layout.tsx` :

- **Fraunces** (display + lede serif + italiques organiques)
  - Axes utilisés : `opsz` (optical sizing) — important pour que les italiques larges aient leur dessin propre
  - Poids 300 + 400 (italique)
- **Inter** (texte courant + labels + boutons + nav)
  - Poids 400 + 500

Hiérarchie :

| Voix              | Police   | Taille          | Poids | Letter-spacing | Usage                              |
| ----------------- | -------- | --------------- | ----- | -------------- | ---------------------------------- |
| Display XXL       | Fraunces | clamp(50, 7.5vw, 96)px | 300   | -0.035em       | Hero h1, CTA final                  |
| Display XL        | Fraunces | clamp(40, 5vw, 64)px   | 300   | -0.03em        | Manifeste                           |
| Display L         | Fraunces | 44px (md: 56px)        | 300   | -0.025em       | Titres section (flotte, processus)  |
| Display M         | Fraunces | 36px                   | 300   | -0.02em        | Titre "À savoir"                    |
| Card title        | Fraunces | 28px                   | 300   | -0.015em       | Brand sur car-card                  |
| Card heading      | Fraunces | 19px                   | 400   | -0.005em       | Titres info-card                    |
| Lede serif        | Fraunces | 22px                   | 300   | normal         | Sous-titre hero                     |
| Body              | Inter    | 14-15px                | 400   | normal         | Texte courant                       |
| Label / micro     | Inter    | 11px                   | 500   | 0.28em uppercase | Compteurs, "À partir de", labels  |
| Button            | Inter    | 13px                   | 500   | 0.02em         | Boutons                             |

Italique = signature visuelle. À utiliser uniquement sur le **mot-clé** d'un titre (ex. "Prestige *Avenue.*", "La flotte, *en silence.*", "Choisissez le *vôtre.*"). Jamais en bloc, jamais sur du texte courant.

### Spacing & rythme

- Container : `max-w-6xl` (1100px) avec `px-6` mobile, `px-9` desktop
- Section padding vertical : `py-32` desktop, `py-20` mobile
- Espace entre sections : aucune marge supplémentaire — chaque section a son propre `py-*`
- Hairlines : 1px `#27272a` pour les dividers structurels, `#18181b` pour les bordures de cards

### Tonalité éditoriale

Compteur "— 02 / 07" à chaque section (sauf hero et footer) en haut, top-left de la section, format `<span class="num-counter">— 02 / 07</span>`. C'est le seul ornement éditorial conservé. Discret, gris #52525b, Inter 11px letter-spacing 0.28em uppercase.

---

## 2. Architecture de la page

7 sections, dans cet ordre :

```
01 — Hero            (100vh, vidéo de fond, texte exact prod)
02 — Manifeste       (~80vh, phrase qui s'éclaire mot à mot)
03 — Flotte          (auto, 3 car-cards redesignées)
04 — Processus       (auto, 3 étapes avec hairline animée)
05 — À savoir        (auto, grille 2x2 d'info-cards)
06 — CTA final       (~70vh, "Choisissez le vôtre." + bouton)
07 — Footer          (auto, logo géant signature)
```

Le `SiteHeader` actuel reste fixé en haut, avec son design simplifié (voir §3.0). Le `SiteFooter` est entièrement remplacé par la section 07.

---

## 3. Composants — détail

### 3.0 `SiteHeader` (modifié)

Fixé top, fond `rgba(5,5,5,0.85)` avec `backdrop-blur(12px)`, bordure-bas `1px #18181b`. Aucun changement de structure — juste alignement avec la nouvelle palette/typo.

- Logo : remplacer l'image PNG par du texte Fraunces "Prestige *Avenue*" (40px desktop, 22px mobile) — plus net, scale parfaitement, retina-safe. Garde l'image en fallback éventuel.
- Liens : `Catalogue`, `Accès admin` (ou `Admin` si session admin) — Inter 13px, color `#a1a1aa`, hover `#fafafa` avec transition 200ms.
- Scroll comportement : à partir de 60px de scroll, le header se réduit en hauteur (de 80px à 64px) avec transition 350ms.

### 3.1 Hero (`src/components/home/hero-section.tsx` — nouveau)

**Structure :**
```tsx
<section className="relative isolate -mt-20 md:-mt-24 min-h-[100svh] overflow-hidden">
  <HeroVideo />
  <div className="hero-vignette absolute inset-0" /> {/* gradient bottom-up */}
  <div className="hero-noise absolute inset-0" />    {/* SVG turbulence très subtil */}
  <div className="lux-container relative z-10 grid min-h-[100svh] items-end pb-20 lg:grid-cols-12">
    <div className="lg:col-span-9">
      <h1 className="hero-h1">{/* Prestige + Avenue. avec stagger */}</h1>
      <p className="hero-lede1">{/* Reservez aujourd'hui... */}</p>
      <p className="hero-lede2">{/* Vehicules controles... */}</p>
      <div className="hero-ctas">
        <Link href="/cars">Voir le catalogue</Link>
        <Link href="#a-savoir">À savoir</Link>
      </div>
    </div>
    <div className="hero-marker">2026</div>
  </div>
</section>
```

- Vidéo : on **conserve** `HeroVideo` existant. Réduire l'opacité finale de la couche active de `0.78` à `0.55` pour creuser le contraste.
- Vignette : `linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.6) 75%, rgba(5,5,5,0.95) 100%)` pour ancrer le texte
- Noise : SVG inline `<filter><feTurbulence baseFrequency="1.4"/></filter>` à 8% d'opacité, mix-blend-mode overlay — donne un grain "film"
- Texte exact :
  - h1 : `Prestige Avenue.` (deux mots sur deux lignes, `Avenue.` en italique)
  - lede1 : `Reservez aujourd'hui le vehicule qui vous ressemble, le prestige devient accessible.`
  - lede2 : `Vehicules controles, assurance incluse et assistance dediee. Profitez de la route, on s'occupe du reste.`
- Marker bas-droit : `<span className="hero-marker">2026</span>` avec un trait `width:32px;height:1px;background:#3f3f46` avant le mot

### 3.2 Manifeste (`src/components/home/manifesto-section.tsx` — nouveau)

**Structure :**
```tsx
<section className="manifesto py-32 md:py-40">
  <div className="lux-container">
    <span className="num-counter">— 02 / 07</span>
    <p className="manifesto-text" data-words>
      {/* Une flotte choisie une à une. Des vehicules selectionnes pour leur technologie, leur confort et <em>leur prestance.</em> */}
    </p>
  </div>
</section>
```

- Texte (à valider, je propose) : `Une flotte choisie une à une. Des vehicules selectionnes pour leur technologie, leur confort et leur prestance.`
- Le texte est rendu mot par mot via un composant client `WordHighlight` qui :
  1. Split le texte en `<span class="word">`
  2. Utilise `IntersectionObserver` avec un seuil multiple (0.1, 0.2, ... 1.0) pour mesurer la progression
  3. Applique progressivement une classe `.on` à chaque mot selon le scroll
  4. Couleur off : `#3f3f46`, couleur on : `#fafafa`, transition `color 600ms cubic-bezier(0.16, 1, 0.3, 1)`
- Police : Fraunces 300, clamp(32, 4vw, 54px), line-height 1.18, letter-spacing -0.02em
- Le mot-clé final ("prestance") est en italique

### 3.3 Flotte (`src/components/home/fleet-section.tsx` — nouveau, intègre `CarCard` redessiné)

**Structure :**
```tsx
<section className="fleet py-32 md:py-40">
  <div className="lux-container">
    <header className="fleet-head">
      <div>
        <span className="num-counter">— 03 / 07</span>
        <h2 className="fleet-title">La flotte, <em>en silence.</em></h2>
      </div>
      <Link href="/cars" className="fleet-link">Voir le catalogue →</Link>
    </header>
    <div className="fleet-grid">
      {featuredCars.map(car => <CarCard car={car} key={car.id} />)}
    </div>
  </div>
</section>
```

**`CarCard` redesigné** (`src/components/cars/car-card.tsx` — réécrit) :
- Background `#0a0a0c`, bordure 1px `#18181b`, radius 8px, overflow hidden
- Image en aspect-ratio 4/3 (au lieu de h-72 fixe), couvre toute la largeur
- Padding intérieur 22px
- **Brand** Fraunces 28px 300, modèle italique : `Audi A3` → `Audi <em>A3</em>`
- Sous-titre : modèle complet + power, Inter 13px `#a1a1aa`
- Bottom : prix Fraunces 30px 300 + "/jour" en small Inter, à gauche ; flèche `→` Fraunces italique 18px à droite
- Border-top 1px `#18181b` au-dessus du bottom
- Suppression de tous les éléments parasites :
  - Year badge → supprimé
  - Accent-line bottom (light sweep) → supprimé
  - Divider "Prestige" → supprimé
  - "Disponible" indicator → supprimé
  - CTA arrow circle → remplacé par simple flèche typographique
  - Hover glow → supprimé
- Garde : Image, brand, modèle, prix

### 3.4 Processus (`src/components/home/process-section.tsx` — nouveau)

**Structure :**
```tsx
<section className="process py-32 md:py-40">
  <div className="lux-container">
    <span className="num-counter">— 04 / 07</span>
    <h2 className="process-title">Trois gestes, <em>une seule clé.</em></h2>
    <div className="process-grid">
      <div className="process-step">
        <div className="process-num">01</div>
        <div className="process-name">Choisir</div>
        <p className="process-desc">Parcourez la flotte. Chaque vehicule est decrit, photographie, controle.</p>
      </div>
      {/* 02 — Reserver, 03 — Prendre la route */}
    </div>
  </div>
</section>
```

- Hairline horizontale qui traverse les 3 colonnes en haut (1px `#27272a`), animée
- 3 colonnes égales avec `border-left: 1px #18181b` entre elles
- `process-num` : Fraunces italique 300, 56px, color `#fafafa`
- `process-name` : Inter 11px, letter-spacing 0.28em, uppercase, `#71717a`
- `process-desc` : Inter 14px, line-height 1.6, `#a1a1aa`, max-width 280px

### 3.5 À savoir (`src/components/home/info-section.tsx` — nouveau, remplace l'usage de `lux-panel`)

**Structure :**
```tsx
<section id="a-savoir" className="info py-32 md:py-40">
  <div className="lux-container">
    <span className="num-counter">— 05 / 07</span>
    <h2 className="info-title">Informations essentielles <em>avant votre location.</em></h2>
    <div className="info-grid">
      <InfoCard title="À savoir" emphasis="savoir">{/* contenu */}</InfoCard>
      <InfoCard title="Où ?" emphasis="Où">{/* adresse */}</InfoCard>
      <InfoCard title="Pré-requis" emphasis="Pré-requis">
        <ul className="info-list"><li>Permis de conduire valide</li>...</ul>
      </InfoCard>
      <InfoCard title="Réservation" emphasis="Réservation">{/* contenu */}</InfoCard>
    </div>
  </div>
</section>
```

**`InfoCard` redesigné** (réécrit) :
- Background `#0a0a0c`, border 1px `#18181b`, radius 8px, padding 28px 26px, min-height 160px
- Titre Fraunces 19px 400, partie emphasis en italique. API : on passe `title` avec un mot-clé qui sera mis en italique (ex. `<em>savoir</em>` ou `<em>Réservation</em>`)
- Plus d'icône (suppression complète)
- Plus d'effets décoratifs (pas de glow, pas de sweep, pas de corner accent)
- Hover : bordure passe à `#3f3f46`, fond passe à `#101013`, et une hairline 1px de fond apparaît en haut, en se traçant de gauche à droite (300ms ease-out)
- `info-list` : `<ul>` sans puces, chaque `<li>` préfixé par `— ` (em-dash + espace) en couleur `#52525b`, padding 7px 0, border-top 1px `#18181b` (sauf premier)

### 3.6 CTA final (`src/components/home/cta-section.tsx` — nouveau)

**Structure :**
```tsx
<section className="cta-final py-40 md:py-48 text-center">
  <div className="lux-container">
    <span className="num-counter">— 06 / 07</span>
    <h2 className="cta-title">Choisissez<br/>le <em>vôtre.</em></h2>
    <Link href="/cars" className="cta-button">
      <span>Voir le catalogue</span>
      <span className="cta-arrow"><span>→</span><span>→</span></span>
    </Link>
  </div>
</section>
```

- Fraunces 300, clamp(54, 7vw, 86)px, letter-spacing -0.035em, line-height 1
- Bouton : padding 18px 32px, background `#fafafa`, color `#050505`, radius 999px
- `cta-arrow` : conteneur `overflow:hidden` `width:18px` qui contient deux flèches `→` empilées via `flex-direction:column`. Au hover : `transform:translateY(-100%)` sur le wrap, transition 450ms cubic-bezier(0.65, 0, 0.35, 1) — la première flèche sort par le haut, la deuxième entre par le bas (effet "ticker" type Linear/Vercel).

### 3.7 Footer (`src/components/layout/site-footer.tsx` — réécrit)

**Structure :**
```tsx
<footer className="site-footer pt-32 pb-9">
  <div className="lux-container">
    <div className="footer-logo-wrap">
      <h2 className="footer-logo">Prestige <em>Avenue.</em></h2>
    </div>
    <div className="footer-bottom">
      <span>© {year} Prestige Avenue. Tous droits reserves.</span>
      <nav className="footer-links">
        <Link href="/cars">Catalogue</Link>
        <Link href="/admin/login">Accès admin</Link>
      </nav>
    </div>
  </div>
</footer>
```

- Border-top 1px `#18181b`
- `footer-logo` : Fraunces 300, clamp(72, 12vw, 156)px, letter-spacing -0.04em, line-height 0.9, centré
- `footer-bottom` : flex justify-between, padding-top 28px, border-top 1px `#18181b`, Inter 12px `#71717a`
- Liens hover : color `#fafafa`, transition 200ms

---

## 4. Système d'animations — par couche

C'est le cœur du redesign. Quatre couches qui se composent.

### 4.1 Couche 1 — Animations d'entrée (au load de page)

Uniquement sur la première section visible (hero). Toutes les autres sections utilisent l'`IntersectionObserver` (couche 3).

| Élément              | Type                              | Délai | Durée  | Easing                          |
| -------------------- | --------------------------------- | ----- | ------ | ------------------------------- |
| Logo header          | fade-in opacity                   | 0     | 600ms  | ease-out                        |
| Nav links            | fade-in + slide-down 6px          | 200ms | 600ms  | ease-out                        |
| h1 mot 1 "Prestige"  | clip-path bottom-up               | 300ms | 1100ms | cubic-bezier(0.16, 1, 0.3, 1)    |
| h1 mot 2 "Avenue."   | clip-path bottom-up               | 480ms | 1100ms | cubic-bezier(0.16, 1, 0.3, 1)    |
| Lede1                | blur-reveal (4px → 0) + fade      | 900ms | 1000ms | cubic-bezier(0.19, 1, 0.22, 1)  |
| Lede2                | fade-up 16px                      | 1100ms| 800ms  | cubic-bezier(0.19, 1, 0.22, 1)  |
| CTA primary          | fade-up 12px                      | 1300ms| 700ms  | cubic-bezier(0.19, 1, 0.22, 1)  |
| CTA ghost            | fade-up 12px                      | 1380ms| 700ms  | cubic-bezier(0.19, 1, 0.22, 1)  |
| Marker "2026"        | fade-in + line draw               | 1600ms| 800ms  | ease-out                        |
| Vidéo bg             | fade-in opacity 0 → 0.55          | 0     | 1800ms | ease-out                        |

**Note clip-path** : on utilise `clip-path: inset(100% 0 0 0)` → `inset(0 0 0 0)` plutôt que `translateY(100%)` car ça masque proprement les jambages des italiques (g, p, j, y). C'est subtil mais c'est la différence entre "joli" et "pro".

### 4.2 Couche 2 — Smooth scroll global

Implémentation **Lenis** (lib `lenis` v1.1+, ~3.6 kB gzip) pour le momentum doux. Initialisée dans un client component `<SmoothScroll />` monté dans le layout root, juste sous `<body>`.

```ts
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  smoothTouch: false, // tactile = scroll natif (sinon UX confuse)
});
function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
```

- Désactivé sur mobile (touch) — les natives mobiles sont meilleures
- Désactivé si `prefers-reduced-motion: reduce`
- La `ScrollProgress` existante reste compatible

### 4.3 Couche 3 — Reveal on scroll (IntersectionObserver)

Hook custom `useRevealOnScroll<T>(options)` qui :
1. Crée un `IntersectionObserver` avec threshold 0.15 et `rootMargin: -50px 0px`
2. Au premier croisement (`once: true`), ajoute la classe `.is-visible` à l'élément
3. Les animations CSS associées partent de l'état initial (opacity 0, transform...) vers visible

Classes CSS associées :
- `.reveal-fade-up` → `translateY(32px)` + `opacity 0` → 0/1, 1000ms cubic-bezier(0.16, 1, 0.3, 1)
- `.reveal-blur` → `blur(4px)` + `translateY(20px)` + `opacity 0` → tous nuls, 1100ms cubic-bezier(0.19, 1, 0.22, 1)
- `.reveal-clip` → `clip-path: inset(100% 0 0 0)` → `inset(0)`, 1100ms cubic-bezier(0.16, 1, 0.3, 1)
- `.reveal-stagger > *` → fade-up avec délais incrémentaux 100ms (utilisé sur la grille flotte et infos)

Appliquées via `data-reveal="fade-up"` ou directement la classe sur l'élément.

### 4.4 Couche 4 — Hero animations spécifiques

#### 4.4.1 Manifeste — Highlight progressif

Composant `<WordHighlight text="..." />` :
1. Au mount, split le texte en `<span class="word">` (espaces préservés)
2. `IntersectionObserver` avec threshold incrémental `[0, 0.1, 0.2, ..., 1.0]` (11 paliers)
3. Au scroll, calcule la progression (`entry.intersectionRatio` corrigé par la position de la section dans le viewport)
4. Applique `.on` aux N premiers mots où `N = Math.floor(progress * totalWords)`
5. `.word` initial : `color: #3f3f46`, transition `color 600ms cubic-bezier(0.16, 1, 0.3, 1)`
6. `.word.on` : `color: #fafafa`

C'est l'animation signature. Doit être impeccable. Le texte commence sombre, s'éclaire au passage, reste éclairé en sortie.

#### 4.4.2 Processus — Hairline qui se trace

Sur la div `.process-grid::before` (la hairline en haut) :
- Initial : `transform: scaleX(0); transform-origin: left center`
- Avec `.is-visible` (via reveal hook) : `transform: scaleX(1)`, transition `transform 1400ms cubic-bezier(0.65, 0, 0.35, 1)`

Les 3 `process-step` sont stagger avec un délai croissant (0ms, 280ms, 560ms) pour que les numéros 01/02/03 apparaissent comme si la ligne les "réveillait" en passant.

#### 4.4.3 Car cards — Hover refiné

Au hover (groupe link) :
- Image : `transform: scale(1.04)` (700ms cubic-bezier(0.19, 1, 0.22, 1))
- Card border : `#18181b` → `#3f3f46` (350ms ease)
- Card brand : `transform: translateX(2px)` (350ms cubic-bezier(0.16, 1, 0.3, 1))
- Card flèche `→` : `transform: translateX(4px)` (450ms cubic-bezier(0.16, 1, 0.3, 1))
- Tout le reste reste stable. Pas de glow, pas de light-sweep.

#### 4.4.4 Info cards — Hover discret

- Border `#18181b` → `#3f3f46` (350ms ease)
- Background `#0a0a0c` → `#101013` (350ms ease)
- Une hairline 1px `#fafafa` de width 0 → 100% en haut de la card, transition 600ms cubic-bezier(0.65, 0, 0.35, 1)

#### 4.4.5 CTA final — Bouton ticker arrow

Bouton avec `<span class="cta-arrow">` qui contient un wrapper `flex-direction:column` avec 2 `<span>→</span>` empilés. Wrapper hauteur fixée à la hauteur d'une flèche. Au hover :
- Wrapper : `transform: translateY(-100%)` (450ms cubic-bezier(0.65, 0, 0.35, 1))
- Effet : la flèche actuelle sort par le haut, la nouvelle arrive par le bas en même temps

Bonus : background bouton passe de `#fafafa` à `#e4e4e7` (250ms).

#### 4.4.6 Footer — Logo blur reveal

Au reveal (entrée du footer dans le viewport) :
- Initial : `filter: blur(4px); opacity: 0`
- `.is-visible` : `filter: blur(0); opacity: 1`, transition `filter 1400ms cubic-bezier(0.16, 1, 0.3, 1), opacity 1400ms ease-out`

### 4.5 Reduced motion

Toutes les animations doivent respecter `@media (prefers-reduced-motion: reduce)`. Pour ce faire :
- Les classes `.reveal-*` ont leur état "visible" appliqué par défaut sous cette media query
- `Lenis` n'est pas instancié si la préférence est détectée (`window.matchMedia('(prefers-reduced-motion: reduce)').matches`)
- Le composant `<WordHighlight />` retourne directement le texte en blanc (toutes classes `.on`)
- Les animations CSS infinies (light-sweep existant) — supprimées du redesign de toute façon

---

## 5. Mise en œuvre — fichiers impactés

### Nouveaux fichiers
- `src/components/home/hero-section.tsx`
- `src/components/home/manifesto-section.tsx`
- `src/components/home/fleet-section.tsx`
- `src/components/home/process-section.tsx`
- `src/components/home/info-section.tsx`
- `src/components/home/cta-section.tsx`
- `src/components/home/word-highlight.tsx` (client, pour le manifesto)
- `src/components/home/section-counter.tsx` (`— XX / 07`)
- `src/components/home/cta-arrow.tsx` (le ticker arrow réutilisable)
- `src/components/layout/smooth-scroll.tsx` (Lenis init)
- `src/hooks/use-reveal-on-scroll.ts`

### Fichiers réécrits
- `src/app/page.tsx` (devient un orchestrateur de sections)
- `src/components/cars/car-card.tsx` (redesign complet)
- `src/components/ui/info-card.tsx` (API change : pas d'icon, plus simple)
- `src/components/layout/site-header.tsx` (logo en texte Fraunces, scroll behavior)
- `src/components/layout/site-footer.tsx` (logo géant signature)
- `src/components/hero/hero-video.tsx` (ajustement opacity de 0.78 à 0.55)
- `src/app/globals.css` (nettoyage massif : suppression de toutes les classes décoratives obsolètes — `.text-light-sweep`, `.text-glitch-accent`, `.lux-stagger`, `.car-image-wrapper`, `.info-card-glow`, etc.)
- `src/app/layout.tsx` (montage `<SmoothScroll />`)

### Dépendances ajoutées
- `lenis` v1.1+ (~3.6 kB) pour le smooth scroll global

### Tokens CSS à introduire dans `globals.css`
Les variables `--ink-*` listées en §1, exposées sous `:root` et utilisables via Tailwind v4 grâce au bloc `@theme inline { --color-ink-onyx: var(--ink-onyx); ... }`.

---

## 6. Performance

- Tous les composants présentationnels (sections, cards) sont des Server Components. Seuls les composants interactifs (`SmoothScroll`, `WordHighlight`, `HeroVideo` existant) sont `"use client"`.
- `WordHighlight` utilise un `IntersectionObserver` unique avec threshold incrémental (pas un par mot) — coût mémoire constant.
- Hero video : conserver le `preload="auto"` mais passer la **première vidéo** (`/video/first.mp4`) à `preload="metadata"` si elle est >2 MB. Les autres restent `metadata` jusqu'à ce qu'on les active.
- Toutes les animations CSS utilisent uniquement `transform`, `opacity`, `filter` et `clip-path` — propriétés composeables sur le GPU.
- `will-change` ajouté uniquement pendant la transition (via class `.is-animating` retirée à la fin via `transitionend`), jamais en permanence.
- Les fonts Fraunces et Inter sont déjà chargées (Next/Google fonts avec `display:swap`).

---

## 7. Accessibilité

- Tous les éléments décoratifs (vignette, noise, hairlines) ont `aria-hidden="true"`
- Le compteur "— 02 / 07" est purement décoratif, pas un h2 ou h3 — c'est juste un span
- Les CTAs sont des `<Link>` Next.js avec libellé clair
- Focus visible : outline `2px solid #fafafa` `outline-offset: 3px` `border-radius: 4px` sur tous les liens et boutons
- Le manifesto avec `<WordHighlight />` : le texte complet est dans le DOM dès le départ (lisible par lecteurs d'écran), seule la couleur change

---

## 8. Hors scope (pour cette spec)

- Pages /cars, /cars/[id], booking flow → restent inchangées pour l'instant. Il faudra une spec séparée pour aligner ces pages sur le nouveau design system.
- Admin → totalement séparé (déjà refait récemment).
- Multilingue → la prod est en français uniquement, on conserve.
- Mode clair → pas demandé, pas inclus.

---

## 9. Critères de succès

- [ ] La home charge en < 2.5s sur 4G simulée (LCP)
- [ ] Le hero respecte exactement le texte de la prod actuelle
- [ ] Le manifesto déclenche son highlight progressif au scroll, sans à-coups
- [ ] Les car cards ne contiennent plus aucun élément décoratif gratuit (year badge, divider, CTA arrow circle, etc.)
- [ ] L'info-cards n'ont plus d'icônes ni d'effets de glow
- [ ] Le footer affiche le logo Fraunces géant comme signature
- [ ] Toutes les animations respectent `prefers-reduced-motion`
- [ ] Pas de régression visuelle côté admin (admin theme isolé, doit être inchangé)
- [ ] Pas de classes CSS orphelines dans `globals.css` après refactor (audit : tout ce qui n'est plus utilisé est supprimé)
