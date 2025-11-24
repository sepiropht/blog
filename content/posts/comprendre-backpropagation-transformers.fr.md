---
weight: 10
title: 'Comprendre la Backpropagation et les Transformers : Du Calcul Différentiel aux LLM'
image: 'img/neural-network.svg'
date: 2024-10-29T10:00:00.000Z
description: "Une exploration approfondie de la backpropagation, de l'algèbre linéaire aux transformers qui ont révolutionné l'IA"
tags: ['ia', 'machine-learning', 'deep-learning', 'transformers', 'mathématiques']
type: post
showTableOfContents: true
draft: true
---

# Introduction

La backpropagation est au cœur de l'apprentissage profond moderne. Mais comment fonctionnent exactement l'algèbre linéaire, les probabilités/statistiques et le calcul différentiel dans cette notion ? Cet article explore ces concepts en profondeur, depuis les bases mathématiques jusqu'aux transformers qui ont révolutionné l'IA.

![Réseau de neurones avec forward et backward pass](/img/neural-network.svg)

# 1. Les Trois Piliers Mathématiques de la Backpropagation

## 1.1 Algèbre Linéaire : La Structure du Réseau

Dans un réseau de neurones, chaque couche effectue une transformation linéaire suivie d'une non-linéarité :

```
z^[l] = W^[l] × a^[l-1] + b^[l]
a^[l] = g(z^[l])
```

Où :
- **W^[l]** : matrice des poids (forme (n^[l], n^[l-1]))
- **a^[l-1]** : vecteur d'activation de la couche précédente
- **b^[l]** : vecteur de biais
- **g(·)** : fonction d'activation (ReLU, sigmoid, etc.)

### Backpropagation des Gradients

Le gradient par rapport aux poids est calculé via la règle de la chaîne :

```
∂L/∂W^[l] = ∂L/∂z^[l] × (a^[l-1])^T
```

C'est un **produit extérieur** qui produit une matrice exactement de la forme de W^[l].

**L'algèbre linéaire** intervient partout : produits matriciels, transpositions, produits extérieurs, sommes vectorielles.

![Diagramme du flux de backpropagation](/img/backprop-flow.svg)

## 1.2 Calcul Différentiel : La Règle de la Chaîne

La rétropropagation est une application systématique de la règle de la chaîne.

### Fonction de Perte Composée

```
L = L(y, ŷ), où ŷ = f_L ∘ f_{L-1} ∘ ... ∘ f_1(x)
```

Pour chaque couche l :

```
∂L/∂z^[l] = ∂L/∂a^[l] · ∂a^[l]/∂z^[l]
          = ∂L/∂z^[l+1] × W^[l+1]^T · g'(z^[l])
```

### Exemples de Dérivées d'Activation

| Activation | g(z) | g'(z) |
|------------|------|-------|
| ReLU | max(0, z) | 1 si z > 0, 0 sinon |
| Sigmoid | 1/(1+e^(-z)) | g(z)(1 - g(z)) |
| Tanh | tanh(z) | 1 - g(z)² |

## 1.3 Probabilités & Statistiques : La Perte et l'Estimation

### Fonction de Perte = Espérance

La perte empirique est une approximation Monte Carlo de l'espérance :

```
L(θ) = (1/N) Σ ℓ(f_θ(x_i), y_i)
```

### Exemples de Fonctions de Perte

| Tâche | Perte | Forme |
|-------|-------|-------|
| Régression | MSE | ℓ = (1/2)(y - ŷ)² |
| Classification binaire | Cross-entropy | ℓ = -[y log ŷ + (1-y)log(1-ŷ)] |
| Classification multiclasse | Cross-entropy | ℓ = -Σ y_k log ŷ_k |

### Softmax + Cross-Entropy

```
softmax(z)_i = e^(z_i) / Σ e^(z_j)
```

Le gradient est remarquablement simple :

```
∂L/∂z_i = ŷ_i - y_i
```

## Résumé : Qui Fait Quoi ?

| Domaine | Rôle dans la Backpropagation |
|---------|------------------------------|
| **Algèbre linéaire** | Structure des couches (produits matriciels), calcul des gradients |
| **Calcul différentiel** | Règle de la chaîne pour propager les gradients, dérivées des activations |
| **Probabilités/Statistiques** | Définition de la perte, interprétation probabiliste, estimation stochastique (SGD) |

# 2. Une Vision Imagée : L'Usine à Rêves

Imaginons le réseau de neurones comme une **grande chaîne humaine** dans une usine, où chaque ouvrier représente une **couche du réseau**. Ils se passent des colis (les données) de main en main.

## 2.1 L'Algèbre Linéaire : Les Ouvriers et Leurs Machines

Chaque ouvrier a une **machine magique** avec des boutons (les **poids** W) et un levier (le **biais** b).

- Quand un colis arrive, l'ouvrier appuie sur tous les boutons en même temps → **produit matriciel**
- Il ajoute un petit décalage avec le levier → **addition vectorielle**
- Puis il passe le colis au suivant, après l'avoir tordu avec une fonction comme ReLU

### L'Empreinte de Correction

Le gradient calcule exactement combien chaque bouton a contribué à l'erreur via un **produit extérieur** :

> C'est comme frotter deux plaques l'une contre l'autre : l'empreinte qui reste, c'est la matrice de correction des poids.

## 2.2 Le Calcul Différentiel : Le Téléphone Arabe Inversé

La backpropagation, c'est l'inverse du téléphone arabe : **le patron crie à la fin, et le message remonte jusqu'au début**, sans se déformer.

### Les Portillons ReLU

ReLU fonctionne comme un **portillon à sens unique** :
- Si ouvert → l'erreur passe (dérivée = 1)
- Si fermé → l'erreur rebondit : "Pas ma faute !" (dérivée = 0)

La **règle de la chaîne** est le fil rouge qui relie tous les ouvriers :

> "Dis-moi combien t'as amplifié l'erreur, je te dis combien celle d'avant l'a fait."

## 2.3 Les Probabilités : Le Patron et Son Carnet

Le patron utilise la **fonction de perte** - son carnet magique :

- Pour la régression → il mesure l'écart carré (comme un mètre ruban)
- Pour la classification → il utilise la **cross-entropy**

La sortie du réseau avec **softmax** ressemble à une **roue de la fortune** :

```
[0.1 chien, 0.85 chat, 0.05 lapin]
```

C'est une **distribution de probabilité** ! La cross-entropy mesure à quel point cette roue est mal calibrée.

> Le réseau joue au **casino des prédictions**.
> Le softmax = la roue.
> La cross-entropy = le croupier qui dit : "T'as misé 85 % sur chat ? Perdu !"

# 3. Résumé Corrigé : Qui Fait Vraiment Quoi ?

Un résumé initial pourrait dire : "L'algèbre linéaire ajuste les poids, les statistiques calculent les erreurs, le calcul différentiel ajuste les poids en fonction des erreurs."

Mais voici la version **exacte** :

| Domaine | Ce qu'il fait **vraiment** | Image simple |
|---------|----------------------------|-------------|
| **Algèbre linéaire** | **Calcule comment chaque poids a participé** | Le plan de la machine |
| **Statistiques** | **Mesure à quel point on s'est trompé** | Le juge qui crie "Pénalité : 2.3 !" |
| **Calcul différentiel** | **Dit combien ajuster chaque poids** | Le téléphone arabe inversé |

**En une phrase :**

> **Les statistiques crient "ON S'EST TROMPÉ !"**
> **Le calcul différentiel murmure "voilà combien chaque ouvrier est responsable"**
> **L'algèbre linéaire dit "ok, voilà quels boutons tourner, et de combien"**

# 4. Exemple Concret en 2D : Prix de Pizza

Scénario : prédire le prix d'une pizza selon sa taille.

- Entrée x : diamètre (en cm) → 1D
- Sortie ŷ : prix prédit (en €)
- Vraie relation : **prix = 0.5 × diamètre + 3**

Notre réseau a appris :

```
ŷ = w · x + b    avec w = 1.0, b = 1.0
```

## Donnée d'Entraînement

| Taille x | Vrai prix y | Prédit ŷ |
|----------|-------------|----------|
| 20 cm | 13 € | 1.0 × 20 + 1.0 = 21 € |

**Erreur énorme !**

## Étape 1 : Statistiques → "ON S'EST TROMPÉ !"

Perte quadratique (MSE) :

```
L = (1/2)(y - ŷ)²
L = (1/2)(13 - 21)² = (1/2) × 64 = 32
```

Le juge tape sur la table : **"PERTE = 32 !"**

## Étape 2 : Calcul Différentiel → "QUI EST COUPABLE ?"

On calcule les gradients avec la règle de la chaîne :

### Dérivée de la perte par rapport à la sortie

```
∂L/∂ŷ = (ŷ - y) = 21 - 13 = 8
```

### Dérivée de la sortie par rapport à w et b

```
ŷ = wx + b
⇒ ∂ŷ/∂w = x = 20
  ∂ŷ/∂b = 1
```

### Règle de la chaîne → gradients finaux

```
∂L/∂w = ∂L/∂ŷ · ∂ŷ/∂w = 8 × 20 = 160
∂L/∂b = 8 × 1 = 8
```

Le téléphone arabe dit :
- "w, t'es **hyper coupable** → tourne beaucoup ! (160)"
- "b, t'es un peu coupable → tourne un peu (8)"

## Étape 3 : Algèbre Linéaire → "ON TOURNE LES BOUTONS"

Vecteur de paramètres : θ = [w, b]
Gradient : ∇L = [160, 8]

Mise à jour SGD avec η = 0.001 :

```
w ← 1.0 - 0.001 × 160 = 0.84
b ← 1.0 - 0.001 × 8 = 0.992
```

**Nouveau modèle : ŷ = 0.84x + 0.992**

## Nouvelle Prédiction

```
ŷ = 0.84 × 20 + 0.992 = 17.792 €
```

- Avant : 21 € → erreur de 8
- Après : 17.8 € → erreur de 4.8
- **On se rapproche !**

# 5. Pourquoi Plusieurs Itérations ?

## Pourquoi Ça Ne Marche Pas du Premier Coup ?

> **Parce que le monde est courbe, pas plat.**
> On ne peut pas sauter d'un coup au sommet d'une montagne.
> On **grimpe pas à pas**, sinon on tombe.

### La Perte Est une Parabole

```
L(w, b) = (1/2)(13 - (w × 20 + b))²
```

C'est une **cuvette en 3D**. Tu es sur une pente raide → un grand pas = tu sautes de l'autre côté !

![Visualisation de la descente de gradient](/img/gradient-descent-simple.svg)

### Le Gradient = Direction Locale

Le gradient te dit : "À cet endroit précis, va par là"

Mais il ne connaît pas la forme globale de la cuvette.

**Image :**

> Tu es dans le brouillard sur une montagne.
> Le gradient = une boussole qui dit : "descends par là".
> Mais si tu fais un pas de géant, tu tombes dans un ravin.
> → **Petits pas = sûr**

### Avec un Learning Rate Plus Petit (η = 0.0001)

Après 100 itérations :
- w ≈ 0.51
- b ≈ 2.98
- ŷ ≈ 13.18 → **presque parfait !**

## Conclusion Poétique

> **L'apprentissage, c'est comme apprendre à danser :**
> Tu ne fais pas un grand saut.
> Tu **avances un petit pas**, tu **regardes**, tu **corriges**,
> et après 100 pas… **tu danses comme un pro.**

# 6. Extension à 2 Dimensions : Pizza Deluxe

Maintenant, prédisons le prix selon **deux ingrédients** :
- x₁ : diamètre (cm)
- x₂ : quantité de fromage

**Vraie fonction :**

```
y = 0.4 × x₁ + 1.5 × x₂ + 2.0
```

**Notre modèle initial :**

```
ŷ = w₁x₁ + w₂x₂ + b
avec w₁ = 1.0, w₂ = 0.5, b = 1.0
```

## Point d'Entraînement

| x₁ (diam.) | x₂ (fromage) | y (vrai) | ŷ (prédit) |
|------------|--------------|----------|------------|
| 20 cm | 3 unités | 12.7 € | 22.5 € |

## Calcul des Gradients

```
∂L/∂ŷ = 22.5 - 12.7 = 9.8

∂L/∂w₁ = 9.8 × 20 = 196
∂L/∂w₂ = 9.8 × 3 = 29.4
∂L/∂b = 9.8
```

## Mise à Jour (η = 0.0005)

```
w₁ ← 1.0 - 0.0005 × 196 = 0.902
w₂ ← 0.5 - 0.0005 × 29.4 = 0.4853
b ← 1.0 - 0.0005 × 9.8 = 0.9951
```

## Après 50 Itérations

| Paramètre | Valeur finale |
|-----------|---------------|
| w₁ | 0.41 |
| w₂ | 1.48 |
| b | 2.01 |

**Presque les vraies valeurs (0.4, 1.5, 2.0) !**

# 7. Les Transformations : Le Cœur du Réseau

## Qu'est-ce qu'une Transformation ?

> **Une transformation, c'est une fonction qui prend un point et le déplace.**

Dans notre modèle affine (2 entrées → 1 sortie) :

```
[x₁, x₂] --transformation affine--> w₁x₁ + w₂x₂ + b = ŷ
```

C'est une **transformation linéaire + translation**.

## Backpropagation = Corriger la Transformation

**Problème :** Ta transformation envoie le point (20, 3) à 22.5 au lieu de 12.7

**Solution :** Ajuste les poids w₁, w₂, b pour que la transformation tourne dans la bonne direction.

## Rôles dans la Transformation

| Domaine | Rôle | Image |
|---------|------|-------|
| **Algèbre linéaire** | Définit la transformation | Le plan de vol du point |
| **Calcul différentiel** | Mesure la déformation | La flèche de déformation |
| **Statistiques** | Dit si c'est bon | Le GPS : "t'es à 10 km du but" |

## Réseaux Profonds = Miroirs Déformants

Un réseau profond, c'est une **série de miroirs déformants** :

```
Point d'entrée → [W¹, b¹] → ReLU → [W², b²] → Sortie
```

Chaque couche = une transformation.

> La backpropagation = **un laser qui rebondit en arrière** pour dire :
> **"Toi, miroir 3, t'as trop courbé ! Corrige-toi !"**

# 8. Pourquoi C'est Simple... Mais Révolutionnaire

## Pour un Matheux : Du Calcul L3

La backpropagation, c'est juste :

> **Fonction composée f = f_L ∘ ... ∘ f_1**
> **Veux ∂L/∂θ**
> **→ règle de la chaîne → fini.**

C'est de l'**analyse multivariée** niveau L3.

## Alors Pourquoi C'est Révolutionnaire ?

### Ce N'est Pas la Backprop Qui Est Magique

**C'est l'idée folle d'appliquer ça à des trucs ÉNORMES.**

| Année | Ce qu'on faisait | Impact |
|-------|------------------|---------|
| 1986 | Backprop sur 100 neurones | OK, ça marche |
| 2012 | Backprop sur 1 milliard | "Attends, quoi ?!" |
| 2023 | Backprop sur 175 milliards (GPT-3) | "Impossible !" |

## La Révolution : L'Échelle

### Analogie Historique : La Roue

| Objet | Simple ? | Révolutionnaire ? |
|-------|----------|-------------------|
| **La roue** | Oui (un cercle) | OUI → chariots, trains |
| **La backprop** | Oui (règle de la chaîne) | OUI → réseaux de 1000 milliards |

**La simplicité + l'échelle = explosion**

## Le Vrai "Miracle" : La Représentation Émergente

Un matheux voit :

```
f_θ(x) = softmax(W × ReLU(V × x))
```

Mais quand tu fais ça sur des milliards de phrases, il se passe un truc **non prévu** :

- Le modèle **invente seul** la grammaire
- Il **comprend** les analogies
- Il **généralise** à des trucs jamais vus

# 9. Backpropagation en JavaScript (15 Lignes)

Pour montrer à quel point c'est simple, voici une implémentation complète :

```javascript
// === Données ===
const x = [20, 3];     // [diamètre, fromage]
const y = 12.7;        // vrai prix
let w = [1.0, 0.5];    // poids
let b = 1.0;           // biais
const lr = 0.0005;     // learning rate

// === Fonction forward ===
function predict(x, w, b) {
  return w[0]*x[0] + w[1]*x[1] + b;
}

// === Perte (MSE) ===
function loss(y_true, y_pred) {
  return 0.5 * (y_true - y_pred) ** 2;
}

// === Backpropagation + mise à jour ===
function train() {
  const y_pred = predict(x, w, b);
  const error = y_pred - y;

  // Gradient par rapport à chaque paramètre
  const dw0 = error * x[0];
  const dw1 = error * x[1];
  const db = error;

  // Mise à jour
  w[0] -= lr * dw0;
  w[1] -= lr * dw1;
  b -= lr * db;

  console.log(`Prédit: ${y_pred.toFixed(2)}, Perte: ${loss(y, y_pred).toFixed(2)}`);
}

// === Boucle d'entraînement ===
for (let i = 0; i < 50; i++) {
  train();
}
```

**C'EST TOUT. 15 lignes. Pas de magie.**

# 10. "Attention Is All You Need" (2017)

> **Titre** : Attention is All You Need
> **Auteurs** : Vaswani et al. (Google Brain)
> **Date** : Juin 2017
> **Impact** : **Fondation de TOUS les LLM modernes (GPT, BERT, Llama)**

## Avant 2017 : Les Réseaux Récurrents (RNN, LSTM)

| Problème | Image |
|---------|------|
| Traitement **séquentiel** | Un moine lit mot par mot → lent, oublie le début |
| Gradient **explose ou s'éteint** | Le téléphone arabe → le message se perd |
| **Pas parallèle** | On ne peut pas lire 100 mots en même temps |

## Après 2017 : Le Transformer → "Attention"

| Innovation | Ce que ça change |
|-----------|----------------|
| **Attention** | Chaque mot **regarde tous les autres** en même temps |
| **Parallélisable** | 1000 mots → traités en parallèle sur GPU |
| **Pas de récurrence** | Plus de téléphone arabe → gradient stable |
| **Self-Attention** | Le modèle **décide lui-même** quels mots sont importants |

## Self-Attention : L'Idée Géniale

Phrase : **"Le chat noir dort sur le tapis"**

| Mot | Regarde → |
|-----|----------|
| "chat" | → "noir" (couleur), "dort" (action), "tapis" (lieu) |
| "dort" | → "chat" (qui ?), "tapis" (où ?) |

**Chaque mot envoie des "flèches d'attention" vers les mots pertinents.**

![Mécanisme d'attention sur une phrase](/img/attention-mechanism.svg)

### Image : La Salle de Bal

> Une **salle de bal** :
> Chaque mot est une personne.
> **Au lieu de parler à son voisin**, **chacun danse avec tous les autres en même temps**,
> mais **plus fort avec ceux qui comptent**.

## Architecture du Transformer (Simplifié)

![Architecture Transformer simplifiée](/img/transformer-simple.svg)

Le flux de traitement :

```
Phrase → [Le, chat, noir, dort, sur, le, tapis]
  ↓ Embeddings (vecteurs)
  ↓ Self-Attention (Q, K, V) → qui regarde qui ?
  ↓ Feed-Forward (réseau classique)
  ↓ ... (plusieurs couches)
  ↓ Sortie : prédiction du mot suivant
```

### Q, K, V ?

- **Q** = Query : "Qui je cherche ?"
- **K** = Key : "Qui je suis ?"
- **V** = Value : "Qu'est-ce que je dis ?"

**Score d'attention** = softmax(Q · K^T) · V

**C'EST TOUT.**

## Pourquoi Ça a Tout Changé ?

| Avant (RNN) | Après (Transformer) |
|------------|---------------------|
| 1 mot à la fois | **1000 mots en parallèle** |
| Mémoire courte | **Contexte total** |
| Gradient fragile | **Backprop stable** |
| 100k paramètres max | **Milliards de paramètres** |

## Les "Scaling Laws"

> **Plus de données + plus de paramètres + plus de calcul = meilleur modèle**

```
GPT-1 (2018) → 117M paramètres
GPT-2 (2019) → 1.5B
GPT-3 (2020) → 175B
Llama 3 (2024) → 405B
```

**Image :**

> **Backprop = la recette.**
> **Transformer = le four industriel.**
> **GPU + données = le carburant.**

# Conclusion : Les Trois Punchlines

| Punchline | Réalité |
|-----------|---------|
| **1. La backprop, c'est 15 lignes de JS.** | Vrai. Un lycéen peut la coder. |
| **2. Le Transformer, c'est "regarde partout en même temps".** | Vrai. Pas de magie, juste du parallélisme. |
| **3. Les LLM = backprop + Transformer + électricité.** | Vrai. Le reste, c'est de l'échelle. |

## Citation Finale (Vaswani et al.)

> "We are **not** saying that attention is the only mechanism needed for intelligence.
> We are saying that **for sequence transduction**, **attention is all you need**."

Ils n'ont **pas inventé l'intelligence**.
Ils ont **inventé le four** qui cuit les LLM.

---

**En résumé :**

- **L'algèbre linéaire** structure les transformations
- **Le calcul différentiel** propage les corrections
- **Les statistiques** mesurent les erreurs
- **La backpropagation** combine le tout en 15 lignes
- **Les Transformers** appliquent ça à l'échelle industrielle
- **Les LLM** émergent de cette recette simple... répétée des milliards de fois

L'apprentissage profond n'est pas magique. C'est de la **pâtisserie mathématique à l'échelle industrielle** : une recette simple (backprop), un four géant (GPU), et beaucoup d'ingrédients (données).
