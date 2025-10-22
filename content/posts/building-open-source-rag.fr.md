---
weight: 10
title: 'Créer un système RAG open-source'
image: 'img/post-rag.webp'
date: 2025-10-22T10:00:00.000Z
description: "Comment j'ai construit un système RAG (Retrieval-Augmented Generation) que tout le monde peut auto-héberger"
tags: ['ia', 'rag', 'open-source', 'auto-hébergement', 'machine-learning']
type: post
showTableOfContents: true
draft: false
---

# Intro

L'intelligence artificielle devient de plus en plus indispensable dans nos vies. Que ce soit ChatGPT pour écrire, GitHub Copilot pour coder, ou des assistants spécialisés pour diverses tâches, nous devenons tous dépendants de ces outils. Le problème ? La plupart de ces services sont chers, closed-source, et nécessitent d'envoyer vos données sur des serveurs tiers.

Je voulais explorer comment on pourrait auto-héberger des capacités d'IA, même avec des ressources modestes. Certes, c'est gourmand en ressources de calcul, mais je pense que ça vaut le coup d'expérimenter, ne serait-ce que pour s'amuser et apprendre. J'ai donc construit un système RAG (Retrieval-Augmented Generation) open-source qui permet de discuter avec n'importe quel site web en utilisant l'IA.

J'utilise d'ailleurs cette même technologie RAG dans mon projet commercial [tubetotext.com](https://tubetotext.com), où elle alimente des chatbots automatisés capables de répondre aux questions sur le contenu des vidéos. Les principes sont les mêmes : scraper le contenu (dans ce cas, les transcriptions YouTube), le découper, créer des embeddings, et utiliser un LLM pour répondre aux questions. Mais je voulais créer une version open-source pour que tout le monde puisse apprendre et expérimenter avec le RAG sans barrières.

Ce projet open-source est disponible sur GitHub à l'adresse [github.com/sepiropht/rag](https://github.com/sepiropht/rag), et le meilleur ? Il utilise principalement des ressources locales et gratuites !

# C'est quoi le RAG au juste ?

RAG signifie Retrieval-Augmented Generation. C'est un terme sophistiqué pour un concept relativement simple : au lieu de demander à une IA de répondre uniquement à partir de ses données d'entraînement, on récupère d'abord des informations pertinentes dans une base de connaissances, puis on donne ce contexte à l'IA pour qu'elle génère une réponse.

Imaginez que vous donnez un examen à livre ouvert versus un examen à livre fermé. L'étudiant (l'IA) performe bien mieux quand il peut référencer des documents spécifiques (vos documents).

Voici comment fonctionne le pipeline dans mon projet :

## 1. Scraping → HTML/Texte brut

**Entrée :** Une URL de site web
**Sortie :** Contenu HTML brut de plusieurs pages

J'utilise Puppeteer et Cheerio pour ça. Puppeteer est génial parce qu'il peut gérer les sites lourds en JavaScript (React, Vue, etc.) en exécutant un vrai navigateur. Cheerio est plus léger et parfait pour parser du HTML statique.

```typescript
// Trouver le sitemap ou crawler les pages
const sitemap = await this.findSitemap(url);
const links = sitemap ? await this.parseSitemap(sitemap) : await this.crawlPages(url);

// Scraper chaque page
for (const link of links) {
  const content = await this.scrapePage(link);
  pages.push(content);
}
```

Le scraper est intelligent dans sa priorisation des liens. Il préfère les pages d'articles aux pages de listing, ce qui donne un contenu de meilleure qualité.

## 2. Détection de site → Stratégie de découpage

**Entrée :** Contenu brut du site web
**Sortie :** Paramètres optimaux de découpage

Tous les sites web ne sont pas identiques ! Un article de blog devrait être découpé différemment de la documentation d'une API ou d'un site e-commerce. J'ai construit un détecteur de site qui analyse la structure HTML pour déterminer le type de site.

```typescript
const siteType = SiteDetectorService.detectSiteType(html, url);
// Retourne: 'blog' | 'documentation' | 'e-commerce' | 'news' | etc.

const strategy = SiteDetectorService.getChunkingStrategy(siteType);
// Retourne la taille optimale des chunks, l'overlap, et les règles de frontières
```

Par exemple :
- **Articles de blog** : Chunks plus grands (1000 tokens), respecte les frontières de paragraphes
- **Documentation** : Chunks moyens (800 tokens), respecte les frontières de sections
- **E-commerce** : Chunks plus petits (600 tokens), garde les infos produit ensemble

## 3. Découpage adaptatif → Morceaux de texte

**Entrée :** Texte brut + stratégie de découpage
**Sortie :** Tableau de morceaux de texte sémantiquement significatifs

C'est là que ça devient intéressant. On ne peut pas juste diviser le texte tous les N caractères—on couperait les phrases en deux ou on séparerait des informations liées. Mon chunker adaptatif respecte les frontières sémantiques :

```typescript
const chunks = AdaptiveChunkerService.chunkContent(content, strategy);

// Chaque chunk :
// - Respecte les frontières paragraphe/section
// - A un overlap avec les chunks adjacents (pour le contexte)
// - Maintient les titres et la structure
// - Reste dans les limites de taille
```

L'overlap entre les chunks est crucial. Si quelqu'un pose une question sur quelque chose mentionné à la fin d'un chunk et au début d'un autre, l'overlap assure qu'on ne perd pas le contexte.

## 4. Génération d'embeddings → Représentations vectorielles

**Entrée :** Morceaux de texte
**Sortie :** Vecteurs à 384 dimensions (embeddings)

C'est la magie du NLP moderne. Chaque morceau de texte est converti en un vecteur de nombres qui représente sa signification sémantique. Des textes similaires auront des vecteurs similaires.

C'est là que j'ai pris une décision importante : **embeddings locaux**. Au lieu d'utiliser l'API d'OpenAI (qui coûte de l'argent et envoie vos données sur leurs serveurs), j'utilise Transformers.js avec le modèle `all-MiniLM-L6-v2` :

```typescript
import { pipeline, env } from '@xenova/transformers';

// Configurer pour exécution locale
env.allowLocalModels = false;
env.useBrowserCache = false;
env.cacheDir = path.join(process.cwd(), '.cache', 'transformers');

// Initialiser le modèle
this.embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

// Générer les embeddings
const embedding = await this.embedder(text, {
  pooling: 'mean',
  normalize: true,
});
```

La première exécution télécharge le modèle (~80MB), mais après ça, c'est complètement local et gratuit ! Les embeddings sont des vecteurs à 384 dimensions qui capturent la signification sémantique du texte.

## 5. Recherche vectorielle → Chunks pertinents

**Entrée :** Question de l'utilisateur + tous les embeddings stockés
**Sortie :** Top N chunks les plus pertinents

Quand un utilisateur pose une question, on :
1. Convertit sa question en embedding (même modèle)
2. Calcule la similarité cosinus avec tous les embeddings stockés
3. Retourne les 5 chunks les plus similaires

```typescript
// Calculer la similarité cosinus
const similarity = this.cosineSimilarity(queryEmbedding, chunkEmbedding);

// Trier par similarité et prendre les 5 meilleurs
const relevantChunks = chunks
  .sort((a, b) => b.similarity - a.similarity)
  .slice(0, 5);
```

La similarité cosinus est parfaite pour ça parce que des vecteurs normalisés rendent le calcul simple et rapide. Pour mon cas d'usage (petite échelle, utilisateur unique), c'est largement suffisant.

## 6. Génération LLM → Réponse finale

**Entrée :** Question de l'utilisateur + chunks pertinents (contexte)
**Sortie :** Réponse en langage naturel

Finalement, on envoie tout à un modèle de langage. J'utilise OpenRouter avec le modèle gratuit Llama 3.2 3B :

```typescript
const messages = [
  {
    role: 'system',
    content: 'Tu es un assistant utile. Réponds basé sur le contexte fourni.'
  },
  {
    role: 'user',
    content: `Contexte:\n${relevantChunks.join('\n\n')}\n\nQuestion: ${question}`
  }
];

const response = await openRouterChat.chat.completions.create({
  model: 'meta-llama/llama-3.2-3b-instruct:free',
  messages,
});
```

Le modèle lit le contexte et génère une réponse. Parce qu'on a fourni des chunks pertinents, il peut répondre à des questions sur du contenu sur lequel il n'a jamais été entraîné !

# Mes choix techniques

## Pourquoi Transformers.js ?

J'ai d'abord essayé d'utiliser l'API d'embeddings d'OpenAI, mais ça nécessiterait que les utilisateurs aient une clé API et paient pour l'usage. Le but entier de ce projet était d'être le plus auto-hébergeable possible.

Transformers.js permet d'exécuter de vrais modèles de machine learning dans Node.js en utilisant ONNX Runtime. Le modèle `all-MiniLM-L6-v2` est :
- Assez petit pour tourner sur du matériel modeste (~80MB)
- Assez rapide pour un usage en temps réel
- Assez précis pour la recherche sémantique
- Complètement gratuit et local

L'inconvénient ? Ce n'est pas aussi puissant que le `text-embedding-3-large` d'OpenAI, mais pour 99% des cas d'usage, c'est largement suffisant.

## Pourquoi OpenRouter avec Llama ?

Pour la complétion du chat, j'avais besoin d'un LLM. J'aurais pu utiliser :
- **OpenAI GPT-4** : Trop cher pour une démo open-source
- **Anthropic Claude** : Aussi cher
- **LLM local (Ollama)** : Nécessite beaucoup de RAM/GPU

OpenRouter est génial parce que c'est une passerelle API vers des centaines de modèles. Plus important encore, ils offrent des modèles gratuits ! J'utilise `meta-llama/llama-3.2-3b-instruct:free` qui est :
- Complètement gratuit (pas besoin de crédits)
- Assez rapide pour du chat en temps réel
- De bonne qualité pour un modèle à 3B de paramètres

Oui, ce n'est pas aussi bon que GPT-4 ou Claude 3.5 Sonnet, mais c'est gratuit et accessible à tous. Si vous avez des crédits, vous pouvez facilement passer à un meilleur modèle en changeant une ligne de code.

## Pourquoi pas FAISS ou pgvector ?

Pour la recherche vectorielle, j'utilise une simple similarité cosinus en mémoire. Des solutions plus sophistiquées existent :
- **FAISS** : La bibliothèque de Facebook pour la recherche de similarité efficace
- **pgvector** : Extension PostgreSQL pour les opérations vectorielles
- **Pinecone/Weaviate** : Bases de données vectorielles dédiées

Pourquoi je ne les utilise pas ? À mon échelle (des centaines à des milliers de chunks par site web), l'approche simple est en fait plus rapide ! Charger tout en mémoire et calculer la similarité cosinus prend des millisecondes.

Je passerais à FAISS si je gérais des millions de vecteurs, mais ce n'est pas le cas ici. Parfois, la solution simple est la meilleure solution.

Pour [tubetotext.com](https://tubetotext.com), mon app en production, j'utilise justement FAISS. Quand on gère des milliers d'utilisateurs et des millions d'embeddings, les performances et l'efficacité de FAISS deviennent essentielles. Mais pour cette démo open-source ? Restons simples !

# Ce que je ferais différemment avec plus de ressources

Si j'avais un GPU puissant et plus de RAM, voici ce que je changerais :

## 1. LLM local avec Ollama

Au lieu d'utiliser OpenRouter, je ferais tourner Llama 3.1 70B localement avec Ollama. La qualité serait significativement meilleure, et ce serait vraiment auto-hébergé. Mais exécuter un modèle 70B nécessite au moins 40GB de RAM (ou VRAM avec accélération GPU).

```bash
# Avec une machine puissante :
ollama run llama3.1:70b
```

## 2. Meilleurs modèles d'embeddings

Le modèle `all-MiniLM-L6-v2` est bon, mais je passerais à :
- **all-mpnet-base-v2** : Meilleure qualité, seulement 420MB
- **instructor-xl** : Spécifiquement entraîné pour les tâches de récupération
- Ou même le `text-embedding-3-large` d'OpenAI si le coût n'était pas un problème

## 3. Recherche hybride

Combiner la recherche vectorielle avec la recherche par mots-clés traditionnelle (BM25). Ça donne le meilleur des deux mondes :
- Recherche vectorielle pour la similarité sémantique
- Recherche par mots-clés pour les correspondances de termes exacts

## 4. Reranking

Après avoir récupéré des candidats avec la recherche vectorielle, utiliser un modèle cross-encoder pour les reclasser. Ça améliore significativement la pertinence mais nécessite plus de calcul.

## 5. Réponses en streaming

Actuellement, la réponse arrive d'un coup. Avec plus de temps, j'implémentais le streaming pour que les utilisateurs voient la réponse être générée en temps réel, comme ChatGPT.

# Conclusion

Construire ce système RAG m'a tellement appris sur l'infrastructure IA moderne. L'écosystème a mûri au point où on peut construire des applications IA sophistiquées sans se ruiner.

Oui, ça nécessite des connaissances techniques. Oui, la qualité n'est pas tout à fait aussi bonne que les services payants. Mais c'est le vôtre ! Vos données restent sur votre serveur, vous pouvez le modifier comme vous voulez, et vous apprenez énormément dans le processus.

Le projet entier est open-source et disponible sur GitHub. Si vous êtes intéressé par l'auto-hébergement d'IA ou si vous voulez juste comprendre comment fonctionne le RAG sous le capot, je vous encourage à aller voir et à expérimenter avec.

Et qui sait ? Peut-être qu'un jour nous ferons tous tourner nos propres assistants IA sur nos serveurs maison, comme on peut maintenant faire tourner notre propre Nextcloud, Bitwarden, ou serveurs VPN. L'avenir de l'IA n'a pas besoin d'être centralisé !

À la prochaine, et merci d'avoir lu jusqu'ici !
