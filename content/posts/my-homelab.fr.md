---
weight: 10
title: 'Mon homelab'
image: 'img/post3.webp'
date: 2024-10-10T12:19:38.315Z
description: ''
tags: ['docker', 'auto-hébergement', 'nextcloud', 'homelab']
type: post
showTableOfContents: true
draft: false
---

J'ai envie de partager les principaux logiciels que j'utilise dans mon homelab. Je ne vais pas rentrer en profondeur cette fois-ci, c'est juste un éventail.

# 1. Homelab

Je vais commencer par vous présenter les services qui tournent chez moi. Certains services comme le premier que j'ai présenté nécessitent que j'y accède depuis l'extérieur, dans ce cas j'utilise Wireguard.

## - Nextcloud

Je l'ai découvert il y a au moins 5 ans alors que je cherchais une seedbox pour mes torrents. Nextcloud était alors installé par défaut sur la seedbox. Au début, je me suis dit : "Et alors ? C'est juste Google Drive ou Dropbox sur mon serveur, je n'en ai pas besoin."
Mon avis a bien changé depuis, puisque maintenant je pense que ma vie entière est sur mon instance Nextcloud privée.

Je trouve ce logiciel juste trop pratique. Par exemple, je l'utilise conjointement avec son client mobile, et je peux synchroniser automatiquement toutes mes photos sur mon cloud perso. La configuration pourrait être plus intuitive, mais depuis que c'est fait, je n'y pense plus. Et j'ai pu désactiver Google Cloud. J'ai un petit shot de dopamine chaque fois que je réactive le Wi-Fi et que je vois les photos partir dans mon cloud.
Il y a aussi un client pour desktop, ça m'a permis de synchroniser toutes mes données importantes. Je partage l'instance avec un ami et quand on s'échange des fichiers, ils arrivent directement sur mon système de fichiers grâce à la synchronisation, et moi je trouve ça trop cool.

L'interface est un peu austère, mais elle est fonctionnelle. J'aime particulièrement le fait qu'on puisse sélectionner/désélectionner les répertoires qui sont synchronisés. Quand on désélectionne un répertoire, le client en efface les données locales et garde celles stockées sur le serveur. Effacer les données du serveur est le seul moyen de supprimer définitivement les données. J'ai eu une très mauvaise expérience avec [Syncthing](https://syncthing.net/) qui lui est peer-to-peer, donc les données effacées sur un seul client sont définitivement perdues. Ce n'est pas forcément un mauvais comportement, il faut juste bien en avoir conscience, moi en tout cas je suis plus à l'aise avec le vieux modèle client-serveur dans ce cas précis.

Nextcloud sert aussi de backend à d'autres applications que j'utilise :

- [Joplin](https://joplinapp.org/) qui me sert à prendre des notes, ou à rédiger l'article que vous êtes en train de lire. Joplin a une app Electron et une app mobile Android, les deux pointent sur mon serveur Nextcloud.
- [Floccus](https://floccus.org/) qui permet de synchroniser les marque-pages entre Firefox et Chrome.

Certains diront qu'il est trop lourd et qu'il faudrait le réécrire en Rust, ce qu'ils ont d'ailleurs commencé à faire pour certaines [parties](https://github.com/nextcloud/notify_push) au moins. Mais j'ai utilisé Nextcloud durant 2 ans sur un Raspberry Pi 2 sorti en 2017 avec 1 Go de RAM et beaucoup d'autres services dessus avant que le serveur ne me lâche. Donc cette réputation de lourdeur est un peu exagérée. Le seul bémol c'est le manque de chiffrement de bout en bout natif.

## - PhotoPrism

Même si Nextcloud me permet très facilement de récupérer les photos depuis mon téléphone, d'ailleurs c'est possible aussi avec PhotoPrism sauf que l'app est payante, PhotoPrism est vraiment optimisé pour exploiter sa bibliothèque de photos/vidéos perso.
Pour que PhotoPrism accède aux répertoires Nextcloud, je joue avec les volumes Docker, je les monte toujours en local donc c'est possible même si ce n'est pas toujours joli :

```
#docker-compose.yml photoprism
volumes:
- "/mnt/ssd/nextcloud2/data/data/sepiropht/files/InstantUpload/WhatsApp Images:/photoprism/originals/images"
-
```

Ceux qui cherchent à savoir comment deux conteneurs peuvent partager des données, voilà la recette.

Il y a une tâche cron qui se lance tous les jours à 2 heures du matin qui va lire les fichiers et les transformer en format PhotoPrism. L'interface web permet aussi d'importer des fichiers mais je ne l'ai jamais utilisée.
L'app est faite en Go côté backend donc elle est assez légère et rapide, elle n'est pas gourmande sur mon serveur, et la web app est assez jolie et fonctionnelle. Il n'y a pas d'app mobile mais la PWA fait bien le travail. L'app est particulièrement fluide même sur mon ancien Raspberry Pi 2 et cela justifie amplement l'utilisation de PhotoPrism.

## - Vaultwarden

Je n'ai pas grand-chose à dire dessus, ça fonctionne, c'est efficace et c'est forcément le service que j'utilise le plus. Dans mes navigateurs avec les add-ons et dans mon smartphone avec l'app Bitwarden. La seule chose qui m'embête un peu c'est qu'on est obligé pour accéder à la web app de passer en HTTPS, donc obligé d'avoir un nom de domaine (je crois bien, non ?) pointant sur le service. Pour un service aussi sensible, j'aurais préféré juste utiliser mon pont Wireguard. Heureusement, ce n'est toutefois pas obligatoire pour les extensions et l'app mobile.

## - COPS

Sans doute le moins connu de la liste, mais pas le moins pratique. J'ai une énorme bibliothèque de livres numériques qui sont bien au chaud dans mon instance Nextcloud.

Quand je télécharge l'EPUB avec mon desktop et que je le copie dans le répertoire livres, il est automatiquement envoyé dans mon instance, je me répète oui je sais. Possible aussi avec le mobile, mais c'est moins marrant, car l'app mobile ne synchronise automatiquement que les photos.
Mais comment je fais pour lire ces fichiers sur ma liseuse Kobo ? Hors de question de la brancher en USB sur ma machine chaque fois que je veux prendre un livre dans ma bibliothèque de 16 Go. C'est là que [COPS](https://github.com/seblucas/cops) entre en jeu, c'est un serveur OPDS. Tous les jours à 3 heures du matin, il va lire ma bibliothèque et mettre à jour la base Calibre. Ensuite ces livres sont accessibles sur un serveur web avec un protocole OPDS qui est lisible par la liseuse.

Ça fonctionne mais je trouve ça complexe, et surtout la bibliothèque qui se met à jour une fois par jour, pour les photos c'est OK, mais pour les livres c'est moins supportable. Il y a des alternatives comme [Kavita](https://www.kavitareader.com/) que je teste en ce moment qui semble tout avoir :

- belle interface web
- mise à jour en continu
- serveur OPDS pour mes liseuses Kobo

À l'installation de Kavita, sa consommation mémoire me faisait vraiment peur, il semble être rentré dans les rangs depuis.
Sinon Nextcloud (oui et encore et toujours lui) a aussi un plugin OPDS mais je n'ai pas réussi à le faire fonctionner.

## - Wallabag

Je suis aussi un gros lecteur d'articles de blog, pendant des années j'ai utilisé [Pocket de Firefox](https://support.mozilla.org/fr/kb/enregistrer-pages-web-plus-tard-pocket-firefox), je trouvais et je trouve toujours ça fou à quel point ça fonctionne bien ce truc. Ma liseuse se connecte à mon compte Pocket et peut télécharger les articles de blog que je peux alors lire confortablement sur de l'encre électronique. Je craignais vraiment ne pas trouver un service qui tourne chez moi et qui fasse la même chose, et heureusement je me suis trompé. [Wallabag](https://github.com/wallabag/wallabag) fait tout comme Pocket :

- add-on dans Chrome et Firefox pour sauvegarder l'article courant dans le serveur
- app mobile avec option de partage rapide qui permet de partager l'article
- web app (j'avoue que ça ne sert pas trop à grand-chose dans les deux cas)
- Possibilité pour ma liseuse de se connecter au serveur pour récupérer les articles.

Je ne l'ai pas précisé plus haut donc je le fais maintenant mais ma liseuse Kobo a besoin de [KOReader](https://koreader.rocks/) pour pouvoir se connecter à un serveur.

## - Audio and Video Streaming

J'utilise Jellyfin pour streamer films et séries. J'aime particulièrement le fait qu'il ait un client mobile et même desktop indépendant du navigateur. Pour la musique, j'utilise Navidrome, une autre app faite en Go + React que j'apprécie aussi particulièrement. Le serveur implémente le protocole Subsonic, ce qui permet d'utiliser une multitude de clients, même si je n'en ai pas encore trouvé un open source et bien.

## - Wireguard

Le dernier de la liste ce sera Wireguard que j'installe simplement grâce à [wg-easy](https://github.com/wg-easy/wg-easy). L'installation se fait en 2 min grâce à Docker Compose, et en plus on a une jolie interface web à laquelle on peut même rajouter un écran d'authentification.
Il m'est très utile pour pouvoir accéder à certains services internes sans forcément ouvrir un port sur mon routeur et d'associer à ce service un nom de domaine.
