---
weight: 10
title: "J'ai fait télécharger un film à Claude parce que personne ne le seedait"
date: 2026-06-29T22:00:00.000Z
description: "Ma copine voulait regarder Sparkle, le dernier film de Whitney Houston. Mon stack *arr n'avait aucun seeder, alors j'ai demandé à Claude de s'en charger."
tags: ['ai', 'claude', 'self-hosting', 'radarr', 'jellyfin', 'x']
type: post
showTableOfContents: false
draft: false
---

Ma copine voulait regarder *Sparkle*, le dernier film de Whitney Houston. J'ai un stack *arr complet, je pensais que ça prendrait trente secondes.

Aucun seeder. Zéro. J'ai demandé à Claude d'ajouter de meilleurs trackers. « C'est déjà configuré, personne ne seed. » Un film de Whitney Houston de 2012, et Internet a collectivement tourné la page.

Je l'ai trouvé sur un site de streaming. Problème : elle veut le regarder sur la télé, pas sur l'ordinateur, et je n'allais pas expliquer le Chromecast à 21h.

Sur le point d'abandonner. Par pur désespoir, je demande à Claude de me récupérer le film. Il a reverse-engineeré le chiffrement du site, extrait la source, et téléchargé le fichier 1080p. Puis je lui ai demandé de tout ranger exactement là où Radarr l'aurait fait : bon dossier, métadonnées, poster TMDB, sous-titres français et anglais nommés pour que Jellyfin les détecte automatiquement.

J'ai ouvert Jellyfin sur la télé. *Sparkle (2012)*. Poster. Synopsis. Sous-titres. Indiscernable du reste de la bibliothèque.

Elle n'a rien remarqué. Elle a juste appuyé sur play.

Puis j'ai demandé à Claude de retenir toute la méthode et de la sauvegarder comme skill réutilisable, pour que n'importe quelle session future puisse la récupérer et l'exécuter sans que je doive tout réexpliquer.

Le premier téléchargement a pris plus d'une heure. J'ai demandé à Claude s'il pouvait aller plus vite. Il a ajouté le téléchargement parallèle des fragments, en une ligne de code. J'ai testé sur *Spider-Man 2* : 3,3 Go en dix minutes.

On est clairement bénis par ces outils. Le stack *arr est incroyable, jusqu'à ce qu'il ne le soit plus. Et quand il ne l'est plus, on a maintenant un agent qui comble le trou, retient la solution, et s'améliore. Tout ça dans la même conversation.

Le futur est bizarre, et j'en suis.

![Sparkle (2012) dans Jellyfin](/img/claude-downloaded-sparkle.png)

---

*Publié originalement sur [X](https://x.com/sepiropht/status/2071676521865961521)*
