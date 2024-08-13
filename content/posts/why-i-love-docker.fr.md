---
weight: 10
title: 'Why i love docker'
date: 2020-03-06T21:29:01+08:00
description: ''
tags: ['docker', 'self-hosting', 'docker-compose']
type: post
showTableOfContents: true
draft: false
---

## 1. L'accident

Ce matin j'ai eu un problème, mon serveur, un rasperry 2 acheté en 2016, ne demarre plus. J'utilise cette vétuste machine pour héberger beacoup de service (wireguard, nextcloud, bitwarden, serveur odps etc...).  
Après quelques essais infructeux, j'abondonne l'idéé de le réparer et j'opte pour utiliser un autre de mes serveurs à la place.
Je debranche le disque dur externe de mon raspberry et je le rebranche sur mon autre serveur.  
Et en 10 minutes tous les services sur la nouvelles machines fonctionnent comme sur le raspberry avec toutes les données. Comment j'ai fait ça ?

Simplement

```bash
$ docker compose up -d
```

##  2. Comment j'ai commencé.

je suis un utilisateur quasi-exclusif de linux depuis une quizaine d'année maintenant sur mon laptop, d'abord ubuntu/debian et puis arch pour flexer un peu. Mais je suis pas un utilisateurs avancé, je fais des trucs assez basics en fait. J'utilise le shell uniquement quand j'ai un soucis ou pour mon travail en tant dev javascript.

Evidement comme beaucoup je pense, j'avais acheté quelques raspberry à l'époque, mais c'était surtout un jouet, même s'il est vrai j'avais reussis à installer un serveur privé git et aussi à streamer ma bibiotheque musical grace à mpd.

Mais c'est tout recement que j'ai commencé à installer de manière systèmatique pleins de services nextcloud, photoprism, bitwarden et tant d'aures...

L'installation de chacun de ses services peut être longue et fastidieuse, par exemple [l'installation de nextcloud](https://docs.nextcloud.com/server/latest/admin_manual/installation/example_ubuntu.html), même si tout ce passe bien ça ne prendra pas 10 minutes :)

Et après il faudra encore récupérer les anciennes données pour nextcloud par exemple:

```bash
$ cp -r /mnt/storage/nextcloud/var/www/html /new_nextcloud_dir
```

Et ensuite il faudra re-faire la configuration post-intallation, créer les comptes ...et refaire ça pour tous les services qui ont chacun un fonctionnement différent.

Docker et docker compose simplifie grandement ce processus.

## 3. Comment ça fonctionne

Sur mon vieux raspberry j'avais sur mon disque externe plein de repertoires comme ceci.

```bash
old@serveur:/mnt/seagate$ ls
nextcloud/ photoprism/ bitwarden/ wireguard/ odps/
```

Tout ces repertoires sont structurés de la même façon plus ou moins, au hazard nextcloud par exemple

```bash
old@serveur:/mnt/seagate$ ls
data  db  docker-compose.yml  nextcloud.sql  redis
```

Le fichier qu'on va modifier ici c'est docker-compose.yml, les fichiers ou repertoires sont générés par le contenaires et contiennent les données qu 'on a généré en utilisant le service.

En général je n'ecris pas moi même les docker-compose.yml, tous les projets on un en général, ou alors en cherchant vous trouverer quelq'un qui en fait un.

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

Et c'est tout ! Vous retrouver votre installation extactement comme vous l'aviez laisser, je bient dit tout. Les connections avec les base de données les utilisateurs, les dernières modifs, tout ce passe comme si vous n'aviez pas changé de machine !
Même le cache redis est restauré à l'état où il était, la dernière fois que le service a fonctionné sur mon pi.

Je trouve ça vraiment génial, la hype autour de docker n'était vraiment pas exagérée, je me prends même à réver que tous les logiciels que j'utilise fonctionnent de cette façon même sur mon laptop.

Pour la petite histoire comme j'ai la flemme de rentrer dans chaque repertoire j'ai écris un petit script qui le fait à ma place.

```bash
# Find all directories that are exactly one level deep and contain a docker-compose.yml file
for dir in $(find . -mindepth 2 -maxdepth 2 -type f -name "docker-compose.yml" -exec dirname {} \;); do
  echo "Entering directory: $dir"
  cd "$dir"
  # Start docker compose in the current directory
  docker compose up -d
done

```

Il faut toutefois remarquer que ce n'est pas toujours utilse au lancement quand vous avez selectionner l'option `restart: always`  votre conf de docker compose. Le daemon docker se charge lui même de reveillé tous les services au démarage du serveur.

## 4. Pour les mis à jour c'est encore plus simple

Je ne l'ai pas dis mais quand on fait `docker compose up -d` pour la première fois il y a en fait trois commandes qui sont éxécutés

```bash
$ docker compose pull
$ docker compose build
$ docker compose start
```

Les autres fois c'est équivalent d' un `start` juste.
Si on veut mettre à jour son container il faut d'abord changer le numéro de version ou si vous aimer vivre dangereusement vous le laisser le flag `latest` à côté du nom de votre image et comme ça il ira toujours chercher la dernière image.

Pour mettre à jour donc

```bash
$ docker compose pull
$ docker compose up -d // il re-start le container uniquement si docker pull à trouver une image plus récente.
```

## 5. Conclusion

Sincèrement je sais pas ce que vous en penser, mais moi je trouve ça simple, élégant, ultra-pratique.

Il existe des milliers d'images docker et le principe sera à chaque fois le même.

Wordpress ? docker compose. Un cms ? docker compose . Streaming video, audio ? docker compose.

Bref la prochaine fois que vous penser avoir besoin d'un saas, ayez juste ce petit relfexe de faire cette requête dans votre moteur de recherche préféré: `mon problème self-hosted ` .

Si vous avez trouver votre bonheur chercher le `docker-compose.yml` , faites la modifs qui va bien pour les volumes et le monde vous appartient !
Je vous conseille ce [site](https://belginux.com/) qui recense un nombre incalculable de service installabe avec simplement `docker compose`

On verra plus tard comment accéder à ces services, la plupart du temps je privilégie le vpn, ça m'évite d'exposer mes services sur internet, et bien sûr wireguard s'installe en un clin d'oeil avec son [docker compose](https://github.com/wg-easy/wg-easy) , (bon il faut avouer qu'il y a quand même la redirection du ports udp depuis votre routeur vers votre instance). Vous aurez même en bonus une jolie interface web avec authentification et possibilité de génerérer un qr-code pour chaque client.
Ou alors si vous utiliser un vps, comment associer chaque service à un domain, c'est hyper simple en vrai. Mais ça ne l'était pas pour moi jusqu'en fin 2022.

D'ici là, à bientôt et merci de m'avoir lu jusqu'ici.
