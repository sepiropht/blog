---
title: "Ma bibliothèque numérique personnelle avec Z-Library, Telegram, Syncthing et OPDS"
date: 2025-10-09
type: post
tags: ["self-hosting", "books", "opds", "syncthing"]
description: "Comment j'ai construit ma propre bibliothèque numérique synchronisée avec Z-Library, Telegram, Syncthing et un serveur OPDS"
---

## Introduction

Aujourd'hui, je vais vous montrer comment j'ai mis en place ma bibliothèque numérique personnelle. L'objectif est simple : pouvoir télécharger des livres depuis Z-Library via Telegram, les synchroniser automatiquement sur mon serveur, et y accéder facilement depuis n'importe quelle liseuse électronique grâce au protocole OPDS.

## Première étape : Le bot Telegram de Z-Library

Z-Library offre un accès à une immense collection de livres en anglais et en français. Plutôt que d'utiliser leur site web dont l'URL change fréquemment, j'utilise leur bot Telegram qui est beaucoup plus stable et pratique.

Pour commencer, il suffit de créer un bot Telegram avec Z-Library :

![Configuration du bot Telegram Z-Library](/img/telegram.png)

Une fois configuré, le bot permet de rechercher et télécharger n'importe quel livre directement dans Telegram :

![Recherche de livres via Telegram](/img/recherche-telegram.png)

J'ai installé le client Telegram pour desktop, ce qui fait que tous les fichiers téléchargés se retrouvent automatiquement dans un répertoire local sur ma machine. C'est là que la magie commence avec la synchronisation.

## Deuxième étape : Synchronisation avec Syncthing

Pour que mes livres soient automatiquement disponibles sur mon serveur distant, j'utilise Syncthing. C'est un outil de synchronisation de fichiers décentralisé, open-source et ultra-fiable.

### Configuration de Syncthing sur le serveur

Sur mon VPS, j'ai déployé Syncthing via Docker Compose :

```yaml
services:
  syncthing:
    image: lscr.io/linuxserver/syncthing:latest
    container_name: syncthing
    hostname: syncthing
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    volumes:
      - ./config:/config
      - ./data:/data
    ports:
      - 8384:8384
      - 22000:22000/tcp
      - 22000:22000/udp
      - 21027:21027/udp
    restart: unless-stopped
```

L'interface de gestion est accessible sur le port 8384. Pour simplifier l'accès, j'utilise un reverse proxy Caddy :

```caddy
sync.domain.com {
    reverse_proxy http://syncthing:8384
}
```

### Configuration côté client

Sur ma machine locale, j'ai installé le daemon Syncthing et configuré le partage du répertoire où Telegram télécharge les livres. Ainsi, dès qu'un nouveau livre arrive, il est automatiquement synchronisé sur mon serveur en quelques secondes.

## Troisième étape : Serveur OPDS avec dir2opds

OPDS (Open Publication Distribution System) est un protocole qui permet aux liseuses électroniques de parcourir et télécharger des livres comme on naviguerait dans une bibliothèque en ligne.

J'utilise [dir2opds](https://github.com/dubyte/dir2opds), un serveur OPDS écrit en Go, ultra-léger et qui se met à jour instantanément quand de nouveaux fichiers arrivent.

### Installation et lancement

```bash
podman run --name dir2opds --rm --userns=keep-id \
  --mount type=bind,src=/home/pi/syncthing/data,dst=/books,Z \
  --publish 8008:8080 \
  -i -t localhost/dir2opds /dir2opds -debug
```

L'important ici est de bien monter le répertoire où Syncthing synchronise les livres (`/home/pi/syncthing/data` dans mon cas).

Pour simplifier l'accès au serveur OPDS, j'utilise également un reverse proxy Caddy :

```caddy
opds.domain.com {
    reverse_proxy http://dir2opds:8080
}
```

### Pourquoi dir2opds ?

Il existe plusieurs serveurs OPDS, mais j'ai choisi dir2opds pour plusieurs raisons :
- Écrit en Go, donc ultra-rapide et léger en ressources
- Mise à jour instantanée quand un nouveau fichier arrive
- Aucune base de données nécessaire
- Configuration minimale

## Quatrième étape : Accès depuis une liseuse

Maintenant que le serveur OPDS est en place, n'importe quelle liseuse avec un client OPDS peut s'y connecter. La plupart des liseuses Android le supportent nativement.

Pour connecter mon téléphone au serveur OPDS, il suffit de configurer le client avec l'URL du serveur :

![Configuration de la connexion OPDS](/img/connection-opds.png)

Une fois connecté, je peux parcourir toute ma bibliothèque :

![Client OPDS sur Android](/img/android-opds.png)

Je recommande particulièrement [KOReader](https://koreader.rocks/), un lecteur open-source qui fonctionne sur de nombreuses liseuses et qui intègre parfaitement le support OPDS.

## Conclusion

Avec cette configuration, j'ai maintenant :
- Un accès facile à des millions de livres via le bot Telegram de Z-Library
- Une synchronisation automatique sur mon serveur personnel
- Un accès universel depuis n'importe quelle liseuse via OPDS

Le tout est self-hosted, open-source et fonctionne de manière totalement autonome. Plus besoin de brancher ma liseuse à mon ordinateur ou de manipuler des fichiers manuellement !

Cette solution est particulièrement pratique quand on lit sur plusieurs appareils ou qu'on veut partager sa bibliothèque avec d'autres membres de la famille.
