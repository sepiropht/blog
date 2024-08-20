---
weight: 10
title: "Pourquoi j'aime docker"
date: 2024-08-20T12:19:38.315Z
description: ''
tags: ['docker', 'self-hosting', 'docker-compose']
type: post
showTableOfContents: true
draft: false
---

## 1. L'accident

Ce matin, j'ai eu un problème : mon serveur, un Raspberry Pi 2 acheté en 2016, ne démarre plus. J'utilisais cette vétuste machine pour héberger beaucoup de services (WireGuard, Nextcloud, Bitwarden, serveur ODPS, etc.).

Après quelques essais infructueux, j'abandonne l'idée de le réparer et j'opte pour utiliser un autre de mes serveurs à la place. Je débranche le disque dur externe de mon Raspberry Pi et je le rebranche sur mon autre serveur.

En 10 minutes, tous les services sur la nouvelle machine fonctionnent comme sur le Raspberry Pi, avec toutes les données. Comment ai-je fait cela ?

Simplement :

```bash
$ docker compose up -d
```

##  2. Comment j'ai commencé.

Je suis un utilisateur quasi-exclusif de Linux depuis une quinzaine d'années maintenant sur mon laptop, d'abord Ubuntu/Debian puis Arch pour "flexer" un peu. Mais je ne suis pas un utilisateur avancé, je fais des trucs assez basiques en fait. J'utilise le shell uniquement quand j'ai un souci ou pour mon travail en tant que développeur JavaScript.

Évidemment, comme beaucoup je pense, j'avais acheté quelques Raspberry Pi à l'époque, mais c'était surtout un jouet. Même s'il est vrai que j'avais réussi à installer un serveur Git privé et aussi à streamer ma bibliothèque musicale grâce à MPD.

Mais c'est tout récemment que j'ai commencé à installer de manière systématique plein de services : Nextcloud, PhotoPrism, Bitwarden, et tant d'autres...

L'installation de chacun de ces services peut être longue et fastidieuse, par exemple [l'installation de nextcloud](https://docs.nextcloud.com/server/latest/admin_manual/installation/example_ubuntu.html),. Même si tout se passe bien, cela ne prendra pas 10 minutes :)

Et après, il faudra encore récupérer les anciennes données pour Nextcloud, par exemple :

```bash
$ cp -r /mnt/storage/nextcloud/var/www/html /new_nextcloud_dir
```

Ensuite, il faudra refaire la configuration post-installation, créer les comptes, et répéter cela pour tous les services, chacun ayant un fonctionnement différent.

Docker et Docker Compose simplifient grandement ce processus.

## 3. Comment ça fonctionne

Sur mon vieux Raspberry Pi, j'avais sur mon disque externe plein de répertoires comme ceux-ci :

```bash
old@serveur:/mnt/seagate$ ls
nextcloud/ photoprism/ bitwarden/ wireguard/ odps/
```

Tous ces répertoires sont structurés de la même façon, plus ou moins. Par exemple, pour Nextcloud :

```bash
old@serveur:/mnt/seagate$ ls
data  db  docker-compose.yml  nextcloud.sql  redis
```

Le fichier qu'on va modifier ici est docker-compose.yml. Les fichiers ou répertoires sont générés par les conteneurs et contiennent les données que l'on a générées en utilisant le service.

En général, je n'écris pas moi-même les fichiers docker-compose.yml. Tous les projets en ont un en général, ou alors, en cherchant, vous trouverez quelqu'un qui en a fait un.

```bash
# docker-compose.yml file
services:
  nc:
    image: nextcloud:apache
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
      - ./data:/var/www/html # je modifie uniquement ces lignes
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
      - ./db:/var/lib/postgresql/data # je modifie uniquement ces lignes
    expose:
      - 5432
  redis:
    image: redis:alpine
    restart: always
    volumes:
      - ./redis:/data # je modifie uniquement ces lignes
    expose:
      - 6379
~
```

Les conteneurs Docker sont des processus isolés qui partagent le noyau du système d'exploitation hôte mais qui fonctionnent dans des environnements compartimentés (appelés "espaces de noms") qui les séparent du reste du système et des autres conteneurs. En termes de communication avec le monde extérieur, les conteneurs peuvent être configurés pour interagir via des réseaux, mais par défaut, ils sont isolés.

Concernant la persistance des données, par défaut, un conteneur Docker ne conserve pas les données une fois arrêté ou supprimé, car tout ce qui est écrit dans son système de fichiers interne est éphémère. Pour persister des données au-delà du cycle de vie d'un conteneur, il faut explicitement monter des volumes ou des répertoires. Cela permet de sauvegarder les données dans le système de fichiers de l'hôte ou sur un stockage externe.

Lors de la définition d'un volume ou d'un montage de répertoire, le chemin de gauche (dans la syntaxe Docker) désigne l'emplacement des fichiers sur la machine hôte, et le chemin de droite indique l'endroit où ces fichiers seront accessibles à l'intérieur du conteneur.

La modification que j'effectue indique juste à docker que les données seront toujours dans le repertoire courant qui est lui même je vous le rappelle situé sur mon disque externe.

Tout ça permet d'avoir tout ce qu'il faut pour faire marcher nos services, localisés aux même endroits dans mon disque externes, la configuration et les données.

C'est veritablement ce qui me plait dans docker cette séparation clair entre les données, et l'application.

C'est notamment ce qui permet de debrancher ce disque dur de le monter ailleurs. Si docker compose est déja installé sur la machine je fais juste

```bash
new@serveur:$ cd /mnt/seagate/nextcloud
new@serveur:/mnt/seagate/nextcloud$ docker compose up -d
new@serveur:$ cd /mnt/seagate/bitwarden
new@serveur:/mnt/seagate/bitwarden$ docker compose up -d
new@serveur:$ cd /mnt/seagate/wireguard
new@serveur:/mnt/seagate/wireguard$ docker compose up -d
```

Et c'est tout ! Vous retrouvez votre installation exactement comme vous l'aviez laissée. Je dis bien tout : les connexions avec les bases de données, les utilisateurs, les dernières modifications, tout se passe comme si vous n'aviez pas changé de machine ! Même le cache Redis est restauré à l'état où il était la dernière fois que le service a fonctionné sur mon Pi.

Je trouve cela vraiment génial. La hype autour de Docker n'était vraiment pas exagérée. Je me prends même à rêver que tous les logiciels que j'utilise fonctionnent de cette façon, même sur mon laptop.

Pour la petite histoire, comme j'ai la flemme de rentrer dans chaque répertoire, j'ai écrit un petit script qui le fait à ma place :

```bash
# Find all directories that are exactly one level deep and contain a docker-compose.yml file
for dir in $(find . -mindepth 2 -maxdepth 2 -type f -name "docker-compose.yml" -exec dirname {} \;); do
  echo "Entering directory: $dir"
  cd "$dir"
  # Start docker compose in the current directory
  docker compose up -d
done

```

Il faut toutefois remarquer que ce n'est pas toujours utile au lancement si vous avez sélectionné l'option `restart: always` dans votre configuration Docker Compose. Le daemon Docker se charge lui-même de réveiller tous les services au démarrage du serveur.

## 4. Pour les mis à jour c'est encore plus simple

Je ne l'ai pas dit, mais quand on fait `docker compose up -d` pour la première fois, il y a en fait trois commandes qui sont exécutées :

```bash
$ docker compose pull
$ docker compose build
$ docker compose start
```

es autres fois, c'est l'équivalent d'un simple `start`.
Si on veut mettre à jour son conteneur, il faut d'abord changer le numéro de version, ou si vous aimez vivre dangereusement, vous laissez le flag latest à côté du nom de votre image, et comme ça, il ira toujours chercher la dernière image.

Pour mettre à jour, donc :

```bash
$ docker compose pull
$ docker compose up -d // il re-start le container uniquement si docker pull à trouver une image plus récente.
```

## 5. Conclusion

Sincèrement, je ne sais pas ce que vous en pensez, mais moi, je trouve ça simple, élégant et ultra-pratique.

Il existe des milliers d'images Docker et le principe sera à chaque fois le même.

WordPress ? Docker Compose. Un CMS ? Docker Compose. Streaming vidéo, audio ? Docker Compose.

Bref, la prochaine fois que vous pensez avoir besoin d'un SaaS, ayez juste ce petit réflexe de faire cette requête dans votre moteur de recherche préféré : "mon problème self-hosted".

Si vous avez trouvé votre bonheur, cherchez le docker-compose.yml, faites les modifications nécessaires pour les volumes, et le monde
