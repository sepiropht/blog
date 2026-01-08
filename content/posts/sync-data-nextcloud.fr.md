---
title: "Synchroniser ses données entre toutes ses machines avec Nextcloud : regain de souveraineté"
date: 2026-01-07
type: post
tags: ["self-hosting", "nextcloud", "docker", "sync", "privacy"]
description: "Comment synchroniser fichiers, notes et photos entre tous vos appareils avec Nextcloud et reprendre le contrôle sur vos données personnelles"
showTableOfContents: true
draft: false
---

Je vais vous expliquer comment je synchronise mes données entre tous mes appareils (téléphone, ordinateurs, etc.). Ce guide s'adresse particulièrement aux utilisateurs d'iCloud ou d'autres clouds propriétaires qui souhaitent reprendre un peu de contrôle sur leurs données personnelles.

Je suis utilisateur de Nextcloud depuis plusieurs années maintenant, et j'ai envie de partager comment je l'utilise au quotidien. Nextcloud est une excellente alternative open-source, auto-hébergée, qui permet de synchroniser fichiers, notes, photos, et bien plus.

## Installation de Nextcloud sur un serveur Linux

Pour l'installer sur mon serveur Linux, je ne me complique pas la vie : j'utilise Docker Compose. Voici mon fichier `docker-compose.yml` de base :

```yaml
services:
  nc:
    image: nextcloud:apache
    user: "root"
    environment:
      - POSTGRES_HOST=db
      - POSTGRES_PASSWORD=nextcloud
      - POSTGRES_DB=nextcloud
      - POSTGRES_USER=nextcloud
      - REDIS_HOST=redis
    ports:
      - 4080:80
    restart: always
    volumes:
      - ./data:/var/www/html
    depends_on:
      - redis
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_PASSWORD=nextcloud
      - POSTGRES_DB=nextcloud
      - POSTGRES_USER=nextcloud
    restart: always
    volumes:
      - ./db:/var/lib/postgresql/data
    expose:
      - 5432

  redis:
    image: redis:alpine
    restart: always
    volumes:
      - ./redis:/data
    expose:
      - 6379
```

J'ai ajouté Redis car je trouve que cela rend l'application significativement plus rapide grâce au cache, mais ce n'est clairement pas obligatoire. Mon instance Nextcloud a tourné sans problème sur un Raspberry Pi de 2017 pendant plusieurs mois !

## Clients mobiles et desktop

J'installe ensuite le client mobile (Android/iOS) et le client desktop (Windows, macOS, Linux).

### Sur mobile

Il est important d'aller dans la section **Téléversement automatique** pour choisir les dossiers qui seront envoyés automatiquement vers votre instance Nextcloud.

Par défaut, seule la synchronisation automatique des photos est activée. Si vous voulez synchroniser un autre dossier (par exemple, des documents), il faut définir un dossier personnalisé via le menu des trois points en haut à droite.

Personnellement, je n'utilise pas beaucoup cette fonction : j'upload manuellement les fichiers quand j'en ai besoin.

### Sur desktop

Il y a très peu de configuration à faire : il suffit de choisir le répertoire local qui sera synchronisé avec Nextcloud.

Pensez juste à aller dans les paramètres de connexion et à désactiver les limitations de bande passante (upload/download) pour éviter que la synchronisation soit trop lente.

![Paramètres réseau Nextcloud Desktop - désactivez les limites de bande passante](/img/nextcloud-bandwith-settings.png)

## Intégration avec d'autres services auto-hébergés

Nextcloud devient vite le hub central de mon écosystème auto-hébergé. Voici comment il interagit avec mes autres outils.

### 1. PhotoPrism pour la gestion de photos/vidéos

Nextcloud n'est pas le plus performant pour gérer une grande bibliothèque de photos et vidéos. Pour ça, PhotoPrism est l'une des meilleures applications open-source.

(L'alternative Immich semble aussi excellente, mais je ne l'ai pas encore testée.)

PhotoPrism a une limitation : son app mobile pour la synchronisation automatique est payante. Du coup, j'utilise Nextcloud comme intermédiaire pour envoyer mes photos.

Comment ? Très simplement : dans le `docker-compose.yml` de PhotoPrism, je monte le volume des photos directement depuis le dossier Nextcloud où arrivent les uploads du téléphone.

```yaml
services:
  photoprism:
    image: photoprism/photoprism
    restart: always
    volumes:
      - /chemin/vers/nextcloud/data/sepiropht/files/InstantUpload:/photoprism/originals  # Dossier où Nextcloud stocke les uploads auto
    # ... autres configurations (MariaDB, etc.)
```

Ça marche hyper bien ! Les photos uploadées via l'app Nextcloud mobile atterrissent directement dans PhotoPrism pour indexation et visualisation.

### 2. Joplin pour les notes

J'utilise Joplin pour toutes mes notes (Markdown, avec chiffrement possible).

Pour synchroniser Joplin via Nextcloud, il suffit d'aller dans **Outils > Options > Synchronisation** et de configurer :

- **URL WebDAV Nextcloud** : `https://nextcloud.votredomaine.com/remote.php/dav/files/votreusername/`

(Optionnellement, ajoutez un sous-dossier comme `/Joplin/` à la fin pour organiser.)

Entrez ensuite votre nom d'utilisateur et mot de passe Nextcloud.

![Configuration de la synchronisation Joplin avec Nextcloud](/img/joplin.png)

Et voilà : Joplin utilise Nextcloud comme backend de synchronisation.

### 3. Floccus pour les marque-pages

J'utilise également [Floccus](https://floccus.org/) pour synchroniser mes marque-pages entre tous mes appareils. Floccus est une extension de navigateur open-source qui peut synchroniser les marque-pages en utilisant l'interface WebDAV de Nextcloud.

Pour le configurer :

1. Installez l'extension Floccus dans votre navigateur (disponible pour Chrome, Firefox et Edge)
2. Allez dans les options de Floccus et ajoutez une nouvelle configuration de synchronisation
3. Sélectionnez "Nextcloud" comme fournisseur
4. Entrez votre URL WebDAV Nextcloud : `https://nextcloud.votredomaine.com/remote.php/dav/files/votreusername/`
5. Ajoutez votre nom d'utilisateur et mot de passe Nextcloud

Floccus gardera alors tous vos marque-pages synchronisés entre tous vos navigateurs et appareils, vous donnant un contrôle total sur vos données de marque-pages.

## Conclusion

Avec cette configuration, Nextcloud devient le cœur de ma synchronisation multi-appareils, tout en restant 100% sous mon contrôle. Plus besoin de dépendre d'iCloud ou Google Drive pour les fichiers basiques, les notes ou les photos.
