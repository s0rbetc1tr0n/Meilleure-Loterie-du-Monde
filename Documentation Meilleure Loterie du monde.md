# La Meilleure Loterie du Monde

## Documentation du projet

---

## Contexte

Application web one-pager conçue pour remonter le moral d'une amie. Le principe : une roue de la fortune personnalisée où **tous les lots sont gagnants** — chaque segment correspond à une activité à partager. L'application est pensée pour être partagée par URL, sans compte, sans installation.

---

## Stack technique

- HTML + CSS + JS **vanilla** (aucun framework, aucune dépendance externe)
- Police chargée via Google Fonts : **Playfair Display** (titres) + **Nunito** (corps, boutons)
- Rendu de la roue : `<canvas>` HTML5
- Confettis : second `<canvas>` en `position: fixed`
- Compatible mobile-first (viewport 380px et plus)

---

## Structure des fichiers

Le projet peut tenir en un seul fichier `.html` auto-suffisant :

```
loterie.html
├── <style>        → tout le CSS inline
├── #curtain-screen  → Écran 1 (rideau)
├── #wheel-screen    → Écran 2 (roue + résultat)
├── #confetti-canvas → Canvas confettis (fixed, z-index 999)
└── <script>       → logique JS inline
```

Malgré tout le faire en plusieurs pourrait largement me faciliter la relecture

---

## Flow utilisateur

### Écran 1 — Accueil (rideau fermé)

- Fond sombre (`#1a0a0a`)
- Deux rideaux rouges velours (gauche + droite) recouvrent l'écran
- Franges dorées en haut de chaque rideau
- Titre centré en **Playfair Display italique** doré (`#FFD700`) avec halo lumineux : *"La Meilleure Loterie du Monde"*
- Sous-titre : *"Tous les lots sont gagnants !"*
- Bouton doré **"Tenter ma chance ✨"** (Nunito bold, border-radius 50px)

### Transition

Au clic sur le bouton :

- Les rideaux s'écartent latéralement (gauche → gauche, droite → droite)
- Animation CSS : `transform: translateX(±100%)`, durée **1,2s**, easing `cubic-bezier(0.77, 0, 0.18, 1)`
- Après 1,3s : l'écran rideau est masqué (`display: none`), l'écran roue apparaît (`display: flex`)

### Écran 2 — La roue

- Fond **noir plateau TV** (`#07080f`) avec effets d'ambiance :
  - Arche néon cyan en haut à gauche (`border: 5px solid #00e5ff`, `box-shadow` cyan)
  - 3 spots lumineux colorés (`filter: blur(60px)`) : violet, bleu, turquoise
  - Liseré doré en bas de l'écran
- Titre **"La Meilleure Loterie du Monde"** — Playfair Display italique, couleur `#FFD700`, halo doré
- Sous-titre **"Tous les lots sont gagnants ! 🎉"** — Nunito, couleur `#f0d080`, halo doré subtil
- Roue canvas centrée (max 320px)
- Pointeur triangulaire rouge (`#e74c3c`) en haut de la roue
- Bouton rouge `#c0392b` **"Tourner la roue !"** — Nunito bold, sans effet brillant, `box-shadow` sobre

### Animation de la roue

- Durée : **4 secondes**
- Nombre de tours : **5 à 10 tours aléatoires** + angle final aléatoire
- Easing : `1 - (1 - t)^4` (forte décélération progressive)
- Pendant la rotation : bouton désactivé (`opacity: 0.35`)

### Écran 3 — Résultat

Apparaît sous la roue après l'arrêt, **sans bouton retry** (tirage unique) :

- Card animée (`cardIn` : scale + translateY, `cubic-bezier(0.34, 1.56, 0.64, 1)`)
- Fond sombre avec bordure colorée (couleur du lot gagné)
- Grand emoji du lot
- Nom du lot en `#FFD700`
- Texte personnalisé du lot (voir tableau ci-dessous)
- Confettis : 120 particules en chute (~150 frames), couleurs du lot + doré + blanc + rouge + violet + vert

---

## Les 6 lots

| #   | Emoji | Label sur la roue                | Couleur            | Texte affiché en cas de victoire                                              |
| --- | ----- | -------------------------------- | ------------------ | ----------------------------------------------------------------------------- |
| 1   | 🎧    | Playlist sur mesure              | `#E24B4A` (rouge)  | Ressuscitons la playlist "Miel pour les oreilles en l'honneur de Pascalou" 🎶 |
| 2   | 🍿    | Film à regarder ensemble         | `#D85A30` (orange) | Plutôt qu'une vidéo de Feldup, regardons un film ensemble 🛋️                 |
| 3   | 🌍    | Défi GeoGuessr                   | `#1D9E75` (vert)   | Relèveras-tu le défi de la carte spéciale Alsace ? 🗺️                        |
| 4   | 📦    | Colis surprise                   | `#7F77DD` (violet) | Je peux pas en dire plus sinon c'est plus une surprise... 🤫                  |
| 5   | 🎨    | Défi peinture                    | `#D4537E` (rose)   | Le même thème — chacun peint de son côté, et on compare nos versions 🖌️      |
| 6   | 🎉    | Invitation au Toulouse Game Show | `#BA7517` (ambre)  | Je t'invite à venir au Toulouse Game Show le 28 & 29 Novembre 2026 🎮         |

---

## Détails techniques

### Roue (canvas 320×320)

- 6 segments égaux (60° chacun, `SLICE = 2π / 6`)
- Texte seul dans chaque segment (pas d'emoji), centré sur le rayon médian (`R * 0.62`)
- Texte blanc, Nunito bold 11px, ombre portée noire
- Séparateurs blancs semi-transparents entre segments (`rgba(255,255,255,0.6)`, lineWidth 2)
- Cercle blanc central (rayon 22px)
- Les emojis **n'apparaissent pas sur la roue** — uniquement dans la carte résultat

### Calcul du lot gagnant

Le pointeur est positionné en haut de la roue (angle `-π/2`). Après l'arrêt :

```js
const pointer = -Math.PI / 2;
const normalized = ((pointer - currentAngle) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
const idx = Math.floor(normalized / SLICE) % NB;
```

### Confettis

- Canvas plein écran en `position: fixed`, `z-index: 999`
- 120 particules rectangulaires (6–14px × 10–16px)
- Physique simple : gravité (`vy += 0.06`), rotation, dérive horizontale
- Fondu en sortie à partir de la frame 90, disparition complète à la frame 150

### Responsive

- Tout en colonne centrée
- Roue limitée à 320px (confortable sur 380px mobile)
- Pas de layout horizontal

---

## Ce qui est hors scope

- Notification par email du résultat
- Persistance / historique des tirages
- Plusieurs tirages (pas de bouton retry)
- Internationalisation

---

## Déploiement

Le projet est déployable sans dépendance locale. Il peut être déployé :

- Sur un serveur statique (ex. Nginx sur Debian)
- Via GitHub Pages
- En pièce jointe ou lien direct depuis n'importe quel hébergeur de fichiers statiques

Aucune configuration serveur particulière requise.
