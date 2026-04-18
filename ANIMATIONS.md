# 🎬 Guide des Animations Typographiques - Prestige Avenue

Ce guide présente tous les effets d'animation disponibles pour la typographie.

## 📦 Import

```tsx
import { AnimatedText, AnimatedUnderlineText, GlitchText } from "@/components/ui/animated-text";
```

## 🎨 Animations Disponibles

### 1. **Word Stagger** - Révélation mot par mot
```tsx
<AnimatedText
  text="Prestige Avenue Excellence"
  as="h1"
  animation="word-stagger"
  delay={100}
  className="text-5xl font-bold"
/>
```
**Effet** : Chaque mot apparaît séquentiellement avec une rotation 3D subtile
**Usage** : Titres principaux, phrases d'accroche impactantes

---

### 2. **Blur Reveal** - Flou vers net
```tsx
<AnimatedText
  text="Découvrez notre collection exclusive"
  as="p"
  animation="blur-reveal"
  delay={200}
  className="text-xl"
/>
```
**Effet** : Le texte passe du flou au net avec un fade-in cinématique
**Usage** : Sous-titres, descriptions importantes

---

### 3. **3D Tilt** - Perspective 3D
```tsx
<AnimatedText
  text="Votre luxe sur roues"
  as="h2"
  animation="3d-tilt"
  delay={0}
  className="text-4xl"
/>
```
**Effet** : Rotation 3D sur l'axe X pour un effet de profondeur
**Usage** : Titres de section, call-to-actions

---

### 4. **Elastic** - Rebond élastique
```tsx
<AnimatedText
  text="Réserver maintenant"
  as="span"
  animation="elastic"
  className="text-2xl"
/>
```
**Effet** : Animation avec overshoot élastique (bounce)
**Usage** : Boutons, éléments interactifs, prix

---

### 5. **Expand** - Espacement des lettres
```tsx
<AnimatedText
  text="COLLECTION PRESTIGE"
  as="h3"
  animation="expand"
  delay={100}
  className="text-xl tracking-wide"
/>
```
**Effet** : Les lettres s'espacent progressivement
**Usage** : Titres en majuscules, labels premium

---

### 6. **Fade Slide** - Glissement doux
```tsx
<AnimatedText
  text="Des véhicules d'exception"
  as="p"
  animation="fade-slide"
  delay={200}
  className="text-base"
/>
```
**Effet** : Slide up classique avec courbe d'easing sophistiquée
**Usage** : Paragraphes, descriptions, listes

---

### 7. **Scale Reveal** - Zoom avec flou
```tsx
<AnimatedText
  text="Nouveauté 2026"
  as="h4"
  animation="scale-reveal"
  className="text-3xl"
/>
```
**Effet** : Le texte se réduit depuis un scale 1.1 avec défloutage
**Usage** : Annonces, badges, highlights

---

### 8. **Gradient Gold** - Shimmer doré
```tsx
<AnimatedText
  text="Prestige Avenue"
  as="span"
  animation="gradient-gold"
  className="text-5xl font-display"
/>
```
**Effet** : Gradient animé or champagne avec shimmer infini
**Usage** : Logo, marque, éléments premium

---

### 9. **Gradient Silver** - Shimmer argenté
```tsx
<AnimatedText
  text="Excellence"
  as="span"
  animation="gradient-silver"
  className="text-4xl"
/>
```
**Effet** : Gradient animé argenté avec shimmer infini
**Usage** : Sous-marque, éléments secondaires premium

---

### 10. **Split Reveal** - Masque vertical
```tsx
<AnimatedText
  text="Découvrez"
  as="h2"
  animation="split-reveal"
  className="text-6xl"
/>
```
**Effet** : Le texte remonte depuis le bas avec masque
**Usage** : Grands titres, hero sections

---

## 🎯 Composants Spécialisés

### Underline Reveal - Soulignement progressif
```tsx
<h2 className="text-4xl">
  <AnimatedUnderlineText 
    text="Audi A3 Sportback" 
    className="text-gradient-gold"
    delay={0}
  />
</h2>
```
**Effet** : Ligne dorée qui se dessine sous le texte

---

### Glitch Text - Effet glitch au hover
```tsx
<h1 className="text-5xl">
  <GlitchText text="Collection" className="inline-block" />
</h1>
```
**Effet** : Effet glitch RGB au survol (très subtil)
**Usage** : Mots clés, call-to-actions interactifs

---

## ⚙️ Propriétés

### AnimatedText Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `text` | `string` | Required | Le texte à animer |
| `as` | `"h1"\|"h2"\|"h3"\|"h4"\|"p"\|"span"` | `"p"` | Élément HTML à rendre |
| `animation` | Voir liste ci-dessus | `"fade-slide"` | Type d'animation |
| `delay` | `number` | `0` | Délai avant animation (ms) |
| `className` | `string` | `""` | Classes Tailwind additionnelles |

---

## 🎭 Classes CSS Directes

Si vous préférez utiliser les classes directement :

```tsx
<h1 className="text-blur-reveal text-5xl">Mon Titre</h1>
<p className="text-fade-slide text-base">Ma description</p>
<span className="text-gradient-gold text-3xl">Premium</span>
```

**Delays personnalisés** :
```tsx
<div className="text-elastic" style={{ animationDelay: "500ms" }}>
  Contenu
</div>
```

---

## 🎨 Combinaisons Recommandées

### Hero Section
```tsx
<AnimatedText 
  text="Prestige Avenue" 
  as="h1" 
  animation="word-stagger"
  className="text-7xl font-display text-gradient-gold"
/>
```

### Section Titles
```tsx
<h2>
  <AnimatedUnderlineText text="Collection" />
  <AnimatedText text="2026" animation="elastic" delay={200} />
</h2>
```

### Descriptions
```tsx
<AnimatedText
  text="Votre description ici"
  animation="blur-reveal"
  delay={300}
  className="text-xl text-zinc-300"
/>
```

### Call-to-Actions
```tsx
<button className="text-elastic hover:text-gradient-gold">
  Réserver maintenant
</button>
```

---

## 🚀 Performance

- ✅ Toutes les animations utilisent CSS pur (pas de JavaScript d'animation)
- ✅ Intersection Observer pour déclencher au scroll
- ✅ `will-change` et `transform` pour optimisation GPU
- ✅ `animation-delay` pour orchestration sans JS

---

## 🎬 Timing & Courbes

Les animations utilisent des courbes d'easing sophistiquées :
- `cubic-bezier(0.22, 1, 0.36, 1)` - Reveal standard
- `cubic-bezier(0.19, 1, 0.22, 1)` - Luxury smooth
- `cubic-bezier(0.68, -0.55, 0.265, 1.55)` - Elastic bounce
- `cubic-bezier(0.16, 1, 0.3, 1)` - Premium ease-out

---

## 💡 Conseils d'Utilisation

1. **Ne pas en abuser** - 2-3 animations par page suffisent
2. **Cohérence** - Utilisez les mêmes animations pour les mêmes types d'éléments
3. **Delays** - Orchestrez avec des delays de 100-200ms entre éléments
4. **Performance** - Évitez d'animer trop d'éléments simultanément
5. **Accessibilité** - Respectez `prefers-reduced-motion` (TODO: à implémenter)

---

Créé pour Prestige Avenue 🏎️✨
