---
title: "Bibliothèque numérique self-hosted 2025 : Z-Library Telegram + Syncthing + OPDS sur liseuse Kobo, PocketBook, KOReader"
date: 2025-10-09
lastmod: 2026-01-19
type: post
tags: ["self-hosting", "books", "opds", "syncthing", "z-library", "ebook", "kobo", "koreader", "liseuse"]
description: "Guide complet pour créer sa bibliothèque numérique self-hosted avec Z-Library via Telegram, synchronisation Syncthing et serveur OPDS dir2opds. Compatible Kobo, PocketBook, KOReader et toutes liseuses OPDS."
---

## Créer sa bibliothèque numérique self-hosted : le guide complet

Aujourd'hui, je vais vous montrer comment j'ai mis en place ma bibliothèque numérique personnelle entièrement self-hosted. L'objectif est simple : pouvoir télécharger des ebooks depuis Z-Library via Telegram, les synchroniser automatiquement sur mon serveur, et y accéder facilement depuis n'importe quelle liseuse électronique (Kobo, PocketBook, Kindle, ou Android) grâce au protocole OPDS.

## Télécharger des ebooks avec le bot Telegram Z-Library

Z-Library offre un accès à une immense collection de livres numériques en anglais et en français. Plutôt que d'utiliser leur site web dont l'URL change fréquemment, j'utilise leur bot Telegram qui est beaucoup plus stable et pratique pour télécharger des ebooks.

Pour commencer, il suffit de créer un bot Telegram avec Z-Library :

![Configuration du bot Telegram Z-Library](/img/telegram.png)

Une fois configuré, le bot permet de rechercher et télécharger n'importe quel livre directement dans Telegram en format EPUB ou PDF :

![Recherche de livres via Telegram](/img/recherche-telegram.png)

J'ai installé le client Telegram pour desktop, ce qui fait que tous les fichiers téléchargés se retrouvent automatiquement dans un répertoire local sur ma machine. C'est là que la magie commence avec la synchronisation.

## Synchronisation automatique des ebooks avec Syncthing

Pour que mes livres soient automatiquement disponibles sur mon serveur distant, j'utilise Syncthing. C'est un outil de synchronisation de fichiers décentralisé, open-source et ultra-fiable — parfait pour synchroniser une bibliothèque d'ebooks entre plusieurs appareils.

### Configuration de Syncthing sur le serveur (Docker Compose)

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

### Configuration Syncthing côté client

Sur ma machine locale, j'ai installé le daemon Syncthing et configuré le partage du répertoire où Telegram télécharge les livres. Ainsi, dès qu'un nouveau livre arrive, il est automatiquement synchronisé sur mon serveur en quelques secondes.

## Serveur OPDS avec dir2opds : accéder aux ebooks depuis sa liseuse

OPDS (Open Publication Distribution System) est un protocole qui permet aux liseuses électroniques de parcourir et télécharger des livres comme on naviguerait dans une bibliothèque en ligne. C'est le standard utilisé par Kobo, PocketBook, KOReader et la plupart des applications de lecture.

J'utilise [dir2opds](https://github.com/dubyte/dir2opds), un serveur OPDS écrit en Go, ultra-léger et qui se met à jour instantanément quand de nouveaux fichiers arrivent.

### Installation et lancement de dir2opds

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

### Pourquoi choisir dir2opds comme serveur OPDS ?

Il existe plusieurs serveurs OPDS (Calibre-web, COPS, etc.), mais j'ai choisi dir2opds pour plusieurs raisons :
- Écrit en Go, donc ultra-rapide et léger en ressources
- Mise à jour instantanée quand un nouveau fichier arrive
- Aucune base de données nécessaire
- Configuration minimale
- Parfait pour une utilisation self-hosted

## Configurer OPDS sur Kobo, PocketBook et KOReader

Maintenant que le serveur OPDS est en place, n'importe quelle liseuse avec un client OPDS peut s'y connecter.

### Liseuses compatibles OPDS

- **Kobo** : via KOReader ou l'application NickelMenu
- **PocketBook** : support OPDS natif intégré
- **Kindle** : via KOReader (après jailbreak)
- **Android** : nombreuses applications (Moon+ Reader, FBReader, etc.)

Pour connecter mon téléphone au serveur OPDS, il suffit de configurer le client avec l'URL du serveur :

![Configuration de la connexion OPDS](/img/connection-opds.png)

Une fois connecté, je peux parcourir toute ma bibliothèque :

![Client OPDS sur Android](/img/android-opds.png)

Je recommande particulièrement [KOReader](https://koreader.rocks/), un lecteur open-source qui fonctionne sur de nombreuses liseuses (Kobo, Kindle, PocketBook, Android) et qui intègre parfaitement le support OPDS.

## Mise à jour janvier 2026 : retour après 3 mois d'utilisation

Après plus de 3 mois d'utilisation quotidienne, voici mon retour d'expérience sur cette configuration :

### Ce qui fonctionne parfaitement

- **Le bot Z-Library Telegram** : toujours fonctionnel et stable, aucun changement d'URL ou de configuration nécessaire
- **Syncthing** : synchronisation instantanée et fiable, aucune perte de fichier
- **dir2opds** : le serveur OPDS tourne sans interruption depuis octobre

### Ajustements effectués

- J'ai ajouté un healthcheck Docker pour redémarrer automatiquement dir2opds en cas de problème
- Organisation des ebooks en sous-dossiers par genre pour une navigation plus facile sur la liseuse

### Alternatives si Z-Library Telegram change

Si le bot Telegram venait à changer ou disparaître :
- **Anna's Archive** : alternative décentralisée avec une large collection
- **Library Genesis** : toujours accessible via des miroirs
- **Calibre + DeDRM** : pour vos propres ebooks achetés légalement

## Conclusion : votre bibliothèque numérique self-hosted

Avec cette configuration, j'ai maintenant :
- Un accès facile à des millions de livres via le bot Telegram de Z-Library
- Une synchronisation automatique sur mon serveur personnel avec Syncthing
- Un accès universel depuis n'importe quelle liseuse (Kobo, PocketBook, Kindle, Android) via OPDS

Le tout est self-hosted, open-source et fonctionne de manière totalement autonome. Plus besoin de brancher ma liseuse à mon ordinateur ou de manipuler des fichiers manuellement !

Cette solution est particulièrement pratique quand on lit sur plusieurs appareils ou qu'on veut partager sa bibliothèque avec d'autres membres de la famille.
