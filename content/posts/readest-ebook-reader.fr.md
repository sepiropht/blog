---
title: "Readest : le lecteur d'ebooks open-source multi-plateforme qui synchronise tout"
date: 2026-01-19
type: post
tags: ["self-hosting", "books", "ebook", "open-source", "readest", "lecture", "epub", "koreader"]
description: "Découvrez Readest, un lecteur d'ebooks open-source moderne disponible sur macOS, Windows, Linux, Android, iOS et Web. Synchronisation des livres, annotations et progression de lecture entre tous vos appareils."
image: "/img/readest.webp"
---

## Une mésaventure de Noël

Les vacances de Noël dernier, j'étais en déplacement dans ma famille. Dans la précipitation du départ, j'ai oublié ma liseuse. Catastrophe pour le lecteur assidu que je suis. Deux semaines sans pouvoir avancer dans [The WEIRDest People in the World](/fr/books/the-weirdest-people-in-the-world/) de Joseph Henrich que j'essayais de finir ?

Heureusement, grâce au setup dont j'ai parlé dans [mon article sur ma bibliothèque numérique self-hosted](/fr/posts/digital-library-with-zlibrary-syncthing-opds/), j'ai pu accéder à tous mes ebooks depuis mon téléphone via le serveur OPDS. J'ai téléchargé le livre et j'ai pu continuer ma lecture. Problème résolu... en partie.

Car si j'avais bien accès à mes livres, impossible de récupérer ma progression de lecture ni mes annotations. J'ai dû feuilleter le livre pour retrouver où j'en étais, et toutes les notes que j'avais prises sur ma liseuse étaient inaccessibles depuis mon téléphone.

## Le setup idéal que je recherche

Cette mésaventure m'a fait réfléchir à ce que serait mon setup de lecture idéal. Après y avoir pensé, voici ce dont j'aurais besoin :

**L'accès à ma bibliothèque de n'importe où.** Ça, c'est déjà réglé grâce à Syncthing et mon serveur OPDS. Que je sois chez moi, au bureau ou chez mes parents à 800 km, mes livres sont accessibles.

**La synchronisation des notes et de la progression de lecture.** C'est le point faible de mon setup actuel. J'utilise KOReader sur ma liseuse Kobo, et théoriquement il est possible de synchroniser la progression et les annotations via leur serveur de sync. Mais malgré plusieurs tentatives, je n'ai jamais réussi à le faire fonctionner correctement. Résultat : quand je change d'appareil, je perds tout.

**La prise de notes manuscrites avec un stylet.** Ma liseuse le permet, et j'adore pouvoir griffonner dans les marges comme sur un vrai livre. Mais ces annotations restent prisonnières de l'appareil.

**L'accès à un LLM.** Pouvoir interroger une IA sur le contenu d'un livre, obtenir des résumés de chapitres, ou approfondir un concept sans quitter ma lecture. Ce serait un game changer.

## Et puis j'ai découvert Readest

Cela faisait des mois que je cherchais un logiciel qui répondrait à tous ces besoins. Sans succès. Frustré, j'ai fini par me dire que j'allais le construire moi-même. En demandant à un LLM de me montrer des exemples de code JavaScript pour lire des fichiers EPUB et PDF, Readest est apparu dans les résultats. Parfois la meilleure façon de trouver quelque chose, c'est d'essayer de le créer soi-même.

Et figurez-vous que ce projet open-source fait déjà, ou ambitionne de faire, exactement tout ce que je recherche.

Readest est né d'une frustration similaire à la mienne. C'est en quelque sorte le successeur spirituel de Foliate, un excellent lecteur Linux que j'utilisais avant. Mais là où Foliate est limité à une seule plateforme, Readest fonctionne partout : macOS, Windows, Linux, Android, iOS, et même en version web accessible depuis n'importe quel navigateur.

La killer feature, c'est la synchronisation. Vos livres, votre progression de lecture, vos notes et marque-pages voyagent avec vous d'un appareil à l'autre. Je commence un livre sur mon ordinateur le matin, je continue sur mon téléphone dans le métro, et le soir je reprends exactement au même endroit sur ma tablette. Sans manipulation, sans export/import, ça fonctionne.

Ce qui m'a particulièrement séduit, c'est la roadmap du projet. L'équipe travaille activement sur la synchronisation avec KOReader, exactement ce qu'il me faudrait pour connecter ma liseuse Kobo à l'écosystème Readest. Le support OPDS existe déjà mais reste encore bugué (impossible d'accéder aux sous-répertoires pour l'instant). Le support Calibre est également prévu.

Et pour la cerise sur le gâteau : des résumés de chapitres générés par IA sont en développement, ainsi que le support des annotations manuscrites pour les appareils avec stylet.

## Une fonctionnalité inattendue

En explorant l'application, j'ai découvert une fonction que je n'avais jamais vue ailleurs : la lecture parallèle. On peut afficher deux livres côte à côte dans une vue split-screen. Au début je me suis demandé à quoi ça pouvait servir, mais en fait c'est génial pour comparer une traduction avec l'original, ou pour lire un livre technique tout en consultant sa documentation.

Côté formats, Readest gère l'essentiel : EPUB évidemment, mais aussi MOBI et AZW3 pour les anciens fichiers Kindle, FB2, et CBZ pour les bandes dessinées. Le support PDF est encore expérimental, mais pour ma lecture quotidienne qui est à 95% en EPUB, ça me convient parfaitement.

## Mon nouveau workflow

Avec Readest, mon workflow de lecture évolue. L'acquisition reste la même : je télécharge mes ebooks via le bot Telegram Z-Library et Syncthing les synchronise sur mon serveur. Mais pour la lecture, je passe progressivement de KOReader à Readest sur mes appareils autres que ma liseuse.

En attendant que la synchronisation KOReader soit disponible, j'ai trouvé un équilibre : Readest sur téléphone, tablette et ordinateur (où la sync fonctionne parfaitement), et KOReader sur ma liseuse Kobo (pour le confort de l'écran e-ink). Ce n'est pas encore le setup parfait, mais c'est un net progrès par rapport à avant.

## Conclusion

Readest est encore un projet jeune et en développement actif. Certaines fonctionnalités que j'attends ne sont pas encore là. Mais l'approche me plaît : un logiciel libre, respectueux de la vie privée, qui ambitionne de résoudre exactement les problèmes que je rencontre au quotidien.

Si comme moi vous avez vécu la frustration de perdre votre progression de lecture en changeant d'appareil, ou si vous rêvez d'un écosystème de lecture vraiment unifié, Readest mérite votre attention.

Pour ceux qui veulent en savoir plus ou essayer par eux-mêmes, direction le [site officiel](https://readest.com/) ou le [dépôt GitHub](https://github.com/readest/readest) du projet.
