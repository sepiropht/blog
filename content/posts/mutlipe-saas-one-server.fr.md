---
weight: 10
title: 'Managing Multiple SaaS on a Single Server with Caddy'
image: 'img/post3.webp'
date: 2024-08-24T12:19:38.315Z
description: ''
tags: ['docker', 'self-hosting', 'saas', 'caddy']
type: post
showTableOfContents: true
draft: false
---

Le problème : J'ai un seul VPS dans le cloud, et j'ai de nombreuses applications que je code moi-même ou des services (Bitwarden, Nextcloud...) que je veux exposer au public. Donc parfois, je peux vouloir avoir plus d'un domaine pour une seule machine. Est-ce possible ? La réponse est oui.

Cela peut sembler trivial pour beaucoup de gens, mais en décembre 2022, je n'étais pas sûr que c'était possible et comment le faire. J'avais beaucoup utilisé des services cloud comme Vercel et Netlify par le passé, mais je voulais comprendre comment les choses fonctionnent réellement en coulisses lorsqu'on gère soi-même l'infrastructure.

Il existe des outils bien connus pour gérer ces problèmes, comme Apache et Nginx. Mais j'ai adopté un petit nouveau qui est ultra simple en termes de configuration.

## 1. Discovering Caddy

Le prérequis est, bien entendu, d'avoir un ou plusieurs noms de domaine qui pointent vers votre VPS. Ensuite, vous devez installer Caddy. Il y a deux approches : vous pouvez soit utiliser le gestionnaire de paquets de votre distribution Linux, soit installer Caddy en utilisant Docker Compose.

Cette dernière méthode est plus rapide pour avoir un Caddy fonctionnel, mais elle nécessitera également de créer un réseau commun pour tous vos conteneurs. Par défaut, les conteneurs ne se voient pas entre eux et ne peuvent pas communiquer. Pour l'installation native, allez...[ici](https://caddyserver.com/docs/install),

```bash
$ sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
$ curl -1sLf 'https://dl.cloudsmith.io/public/caddy/testing/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-testing-archive-keyring.gpg
$ curl -1sLf 'https://dl.cloudsmith.io/public/caddy/testing/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-testing.list
$ sudo apt update
$ sudo apt install caddy

```

Une fois l'installation terminée, vous devrez modifier le fichier de configurations `Caddyfile`. TLe fichier ressemble à du json

```bash
$ vim /etc/caddy/Caddyfile
```

Le fichier doit ressembler à ça:

```bash
monSaas.com {
	reverse_proxy http://localhost:3000   // un saas
}

monAutreSaas.com {
	reverse_proxy  http://localhost:4000  // un autre saas
}

blog.monSaas.com {
	reverse_proxy  http://localhost:8080   // yOn peut litteralement avoir une infinité de sous domain et de services associé !
}

```

Vous pouvez ensuite lancer le daemon:

```bash
$ sudo systemtcl start caddy
$ sudo systemtcl enable caddy
```

Ne surtout pas oublier de relancer le daemon après chaque modifiquation `Caddyfile` avec la commande `restart`.

Par défaut, Caddy gère également le SSL, ce qui est très pratique. Ainsi, toutes les entrées que nous avons créées seront accessibles via `https`, et ça c'es vraiment cool !

Bien sûr, vous pouvez faire des choses plus complexes avec Caddy, mais ici je voulais simplement illustrer la simplicité de Caddy et comment vous pouvez rapidement mettre en place un reverse proxy sur votre VPS.

Maintenant que vous avez terminé, vous pouvez commencer à coder vos propres SaaS (Software as a Service) et les exposer sur votre serveur !
