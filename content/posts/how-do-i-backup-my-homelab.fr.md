---
weight: 10
title: 'Comment je sauvegarde mes données'
date: 2024-08-22T14:00:00.315Z
description: 'Ne perdez plus vous données'
tags: ['aws', 'auto-hebergemenent', 'sauvegarde']
type: post
showTableOfContents: true
draft: false
---

Dans mon dernier article, j'expliquais comment Docker m'avait sauvé lorsque mon Raspberry Pi, qui hébergeait tous mes services, m'avait lâché du jour au lendemain. En effet, Docker permet de bien compartimenter configurations et données, et de choisir où on veut les stocker, le disque dur externe en l'occurrence pour moi. En cas de panne, il suffit juste de prendre le disque dur et le connecter à une autre machine et c'est fini.

Ce genre d'accidents arrive assez souvent malheureusement, et la méthode que je viens d'énoncer est assez efficace pour résoudre ce problème.
En revanche, que se passe-t-il si c'est le disque dur externe qui lâche ou pire si j'ai un incendie ? Dans ce cas, je perds tout ?

Ce genre d'incident est plus rare. Je n'ai jamais subi une perte de disque dur. Tous les disques durs que j'ai achetés la décennie précédente fonctionnent encore. Donc il a été plus difficile pour moi de construire une infrastructure résiliente face à ce genre de problème. J'y suis quand même parvenu et je vais présenter comment je procède. Je vais vous faire découvrir la déduplication avec Borg Backup et Amazon S3 Glacier.

## 1. Règle 3-2-1

Pour la mise en place de plan de backup, je suis ce principe qui semble faire consensus d'avoir trois copies différentes de ses données :

- Utiliser au minimum 3 copies
- Utiliser deux types de supports différents
- Et avoir une copie hors site

La copie hors site, c'est ce qui permet de survivre à un incendie par exemple.  
C'est bon pour la vue d'ensemble et le principe directeur, voyons voir comment je l'applique.

## 2. Borg Backup et déduplication

### 1. Installer Borg Backup

Le principal problème quand on fait des sauvegardes, c'est la redondance des données entre les différentes sauvegardes. Heureusement des outils comme Borg existent, il nous permet de faire des sauvegardes incrémentales, c'est-à-dire, la première fois il sauvegarde l'ensemble de vos fichiers, mais les autres fois il enregistre seulement les modifications ce qui permet d'économiser de la bande passante et aussi de l'espace sur le disque de sauvegarde.

Si Borg Backup n'est pas encore installé :

```bash
$ sudo apt install borgbackup
```

### 2. Initialiser le dépôt

Créez un dépôt Borg à l'emplacement de votre choix, ici /mnt/seagate/. Ce dépôt contiendra toutes les sauvegardes.

```bash
$ borg init --encryption=repokey /mnt/seagate/
```

### 3. Créer une sauvegarde

Pour créer une sauvegarde, utilisez la commande suivante :

```bash
$ borg create --progress --stats /mnt/seagate/borg-repo::$(date +%Y-%m-%d) /mnt/ssd
```

Le repertoire est mon disque dur externe où je stocke mes docker compose et leur données:

```bash
/mnt/ssd$ ls
docker-hub  homarr  nextcloud2  nostr photoprism vaultwaarden  wireguard
```

Vous pouvez être plus fin en indiquant dans une chaine de caractère tous les repertoires que vous voulez intégrer

```bash
$ borg create --progress --stats /mnt/seagate/borg-repo::$(date +%Y-%m-%d) '/mnt/ssd/nextcloud/data /mnt/ssd/docker-hub/data'
```

Pour la restauration vous pouvez lister d'abord, pour afficher le nom de la version que vous voulez restaurer

```bash
borg list /mnt/seagate/borg-repo
2024-07-20-Jul                       Sat, 2024-07-20 04:22:06 [7817b88dcd86c1cf5c70934e5beca141ca8cc3a72137f9d10649fd0a8207d39d]
2024-07-21-Jul                       Sun, 2024-07-21 04:22:06 [6df4a3e576a2bee8ce290adbcf876c53e670e22f3e8b192e9e0ca36540595b69]
2024-08-06-août                      Tue, 2024-08-06 02:26:11 [c0090b647cd385bc87d75d17749be4011f2bcca522eadda2e825df4e5031c455]
2024-08-07-août                      Wed, 2024-08-07 07:07:01 [89c3ab26e928b244b7a9fd952c95e416a2003c232ab98d8b0dda3c5ff4ae1f46]
2024-08-08-août                      Thu, 2024-08-08 04:00:08 [87d75f01dced5048c363e6ebfe756232026d1f1e557085fa9e1c4e239986065e]

$ borg extract /mnt/seagate/borg-repo::2024-08-08-août  --target /mnt/restore-point

```

Et voila nous avons 2 copies sur 2 support différents, maintenant il faut la copie hors site

## 3. Sauvegarde hors site avec amazon s3 glacier

Oui j'utilse amazon, c'est vraiment pas chère pour stocker de grosses données, je paye moin de 1 dollars par mois pour 300 giga, j'ai pas envie de dépenser plus pour un problème que n'ai jamais eu et que je n'aurai peut être jamais. Il faut aussi savoir que borg backup crypte les données chez vous en local, il ne faut juste surtout ne pas perdre la passpharase, donc pour la vie privé il y a pas de soucis. Le seul inconvénient c'est que pour récuprer les données il faut pas être pressé, çà peut prendre 2 jours.

### Étapes pour configurer la synchronisation avec Amazon S3 en utilisant AWS CLI

#### 1. Installer AWS CLI

```bash
sudo apt-get install awscli
```

#### 2. Configurer AWS CLI

Configurez AWS CLI avec vos informations d'accès AWS :

```bash
aws configure
```

Vous serez invité à entrer les informations suivantes :

- AWS Access Key ID : Votre clé d'accès AWS.
- AWS Secret Access Key : Votre clé secrète AWS.
- Default region name : La région AWS dans laquelle votre bucket S3 est situé (par exemple, us-west-2).
- Default output format : Vous pouvez laisser vide ou choisir json.

Il faut maintenant créer un bucket amazon, et faire bien attention a créer un bucket glacier deep archive

une fois cela fais on peut alors faire un

```bash
$ aws s3 sync /mnt/seagate/borg-repo s3://my-borg-backups
```

Pour la restauration

```bash
$ aws s3 sync s3://my-borg-backups /mnt/restore-point
```

Je vous montre le script final pour la sauvegarde

```bash
REPOSITORY="/mnt/seagate/borg-repo"
SOURCE="/mnt/ssd/"
BORG_S3_BACKUP_BUCKET="bucket-name"


export BORG_PASSPHRASE='PASSPHRASE'

# Backup to borg repo
borg create -v --stats $REPOSITORY::$(date +%Y-%m-%d-%h) $SOURCE


# Backup to s3
aws s3 sync $REPOSITORY s3://$BORG_S3_BACKUP_BUCKET --storage-class DEEP_ARCHIVE --delete
```

Au final j'appelle mon script dans une tache cron tous les jours

Et voila si vous êtes arrivez jusqu'ici vous avez maintenant un système automatiser de backup 3-2-1 qui applique la déduplication et avec une copie hors site.
