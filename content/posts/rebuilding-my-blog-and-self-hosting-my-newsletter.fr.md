---
weight: 10
title: 'Reconstruire mon blog et auto-héberger ma newsletter'
date: 2026-06-09T12:00:00.000Z
description: "Comment j'ai failli abandonner Hugo, simplifié mon blog, et auto-hébergé une vraie newsletter avec Listmonk, Docker et Caddy."
tags: ['hugo', 'auto-hébergement', 'docker', 'listmonk', 'caddy', 'newsletter', 'x']
x_url: 'https://x.com/sepiropht/status/2064762596037968024'
type: post
showTableOfContents: true
draft: false
---

## 1. Le grain de sable

Tout est parti d'une petite frustration : ma page d'accueil me semblait vide. Elle affichait mon avatar, mon nom, une phrase de présentation, et les quatre derniers articles. C'est tout. Je voulais quelque chose qui ressemble davantage à une vraie archive, et j'ai commencé à me demander si je n'avais pas dépassé Hugo.

Pendant un moment j'ai sérieusement envisagé de tout jeter et de reconstruire en HTML, CSS et un peu de JavaScript. « Plus de flexibilité », que je me disais. Vous connaissez ce sentiment.

Spoiler : je n'ai pas abandonné Hugo. Et j'en suis content.

## 2. La flexibilité était déjà là

Ce que je n'aimais pas, ce n'était pas vraiment Hugo, c'était le thème. Et il s'avère qu'on n'a pas besoin de se battre avec le thème : il suffit de surcharger ses templates dans son propre dossier `layouts/`, fichier par fichier, sans jamais toucher au submodule du thème.

J'ai donc écrit ma propre page d'accueil qui liste **tous** les articles, groupés par année :

```go-html-template
{{ $posts := where .Site.RegularPages "Params.type" "post" }}
{{ range $posts.GroupByDate "2006" }}
    <h2 class="post-year">{{ .Key }}</h2>
    {{ range .Pages.ByDate.Reverse }}
        {{- partial "list-posts.html" . -}}
    {{ end }}
{{ end }}
```

Et voilà. Pas de migration, pas de réécriture, pas de nouveau framework à apprendre. La page d'accueil est passée de « un peu vide » à une liste chronologique propre de tout ce que j'ai écrit.

## 3. Faire le ménage

Tant qu'à faire, j'ai fait un peu de rangement. J'avais une page « Now » et une section « Pensées » que je n'entretenais jamais vraiment comme des choses séparées. La vérité, c'est que c'étaient juste des articles avec une saveur particulière.

J'ai donc supprimé les sections et tout transformé en articles normaux avec des tags. Un seul flux, un seul endroit, et les tags font le tri. Le menu est passé de cinq entrées à presque rien. J'ai même retiré complètement l'avatar et la tagline de la page d'accueil — si vous voulez savoir qui je suis, vous le découvrirez en lisant.

Moins à maintenir, moins à penser. C'est généralement la bonne direction.

## 4. Le vrai projet : auto-héberger ma newsletter

C'est là que ça devient amusant. Je voulais une newsletter, et bien sûr je voulais l'auto-héberger. L'outil pour ça, c'est [Listmonk](https://listmonk.app/), et comme tout le reste dans mon homelab, il tourne avec Docker Compose :

```yaml
services:
  app:
    image: listmonk/listmonk:latest
    restart: unless-stopped
    ports:
      - "127.0.0.1:9000:9000"
    depends_on:
      db:
        condition: service_healthy
    command: [sh, -c, "./listmonk --install --idempotent --yes --config '' && ./listmonk --upgrade --yes --config '' && ./listmonk --config ''"]
    # les secrets vivent dans un fichier .env, jamais ici

  db:
    image: postgres:17-alpine
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U listmonk"]
      interval: 10s
      timeout: 5s
      retries: 6
    volumes:
      - listmonk-data:/var/lib/postgresql/data

volumes:
  listmonk-data:
```

Un `docker compose up -d` et j'ai une base Postgres et une vraie application de mailing-list qui tournent. Toujours la même histoire : j'adore ça.

Un petit détail auquel je tiens : remarquez que l'app n'écoute que sur `127.0.0.1`. Elle n'est jamais exposée directement sur internet.

## 5. L'exposer sans l'exposer

Mon blog lui-même est sur Vercel (hébergement statique, gratuit, imbattable), mais le formulaire de newsletter en bas de chaque article parle à une petite fonction serverless qui appelle Listmonk. Listmonk doit donc être joignable — mais je n'aime vraiment pas ouvrir des ports sur le monde entier.

Mon setup : Listmonk tourne sur une machine, mon reverse proxy (Caddy) sur une autre, et les deux se parlent via un VPN mesh privé. Caddy est la seule chose face à internet, et il obtient son certificat TLS tout seul :

```caddyfile
newsletter.example.com {
  reverse_proxy http://mon-hote-listmonk:9000
}
```

C'est toute la config. Caddy va chercher un certificat Let's Encrypt de lui-même, et la machine qui fait tourner Listmonk reste invisible de l'extérieur. Propre.

## 6. Automatiser la partie pénible

Une newsletter n'est utile que si elle part vraiment. Je ne voulais pas me connecter et copier-coller à chaque publication. Du coup, un petit job de CI tourne à chaque push : il regarde ce que je viens d'ajouter, et si c'est un nouvel article, il crée une campagne dans Listmonk ciblant tous mes abonnés.

Pour l'instant je la laisse en mode « brouillon » — la campagne est créée mais pas envoyée — comme ça je peux y jeter un œil avant de cliquer sur envoyer. Quand j'aurai confiance, passer à l'envoi automatique sera une modification d'une seule ligne.

## 7. La partie qui m'a vraiment surpris

Autant être honnête sur la façon dont tout ça s'est fait : je l'ai réalisé en binôme avec un agent IA de code qui tournait dans mon terminal. Et je ne parle pas de « il m'a écrit une fonction ». Je veux dire qu'il a réellement piloté mon infrastructure, de bout en bout, pendant que mon rôle se réduisait surtout à prendre des décisions et, de temps en temps, à me loguer quelque part.

Quelques moments m'ont marqué. Mon instance Caddy ne tourne pas sur la même machine que le blog — elle est sur une autre, joignable via mon VPN mesh privé (j'utilise NetBird). L'agent s'y est connecté en SSH tout seul. Il ne pouvait pas faire de `sudo` (pas de mot de passe — et franchement tant mieux), alors au lieu de toucher au fichier de conf appartenant à root, il a parlé à l'API admin locale de Caddy pour ajouter la nouvelle route du site à la volée, puis m'a donné une seule commande à copier-coller pour la partie qui nécessitait vraiment root. Il a même repéré un fichier swap d'éditeur oublié et me l'a signalé.

Il y a eu aussi le DNS. Je lui ai demandé de faire pointer un sous-domaine vers le service. Il a essayé, a découvert que le DNS du domaine n'était pas hébergé là où il croyait, a trouvé un petit script que j'avais écrit il y a longtemps pour parler à l'API de mon registrar (Namecheap), a interrogé les vrais enregistrements à travers lui — et s'est rendu compte qu'un enregistrement wildcard envoyait déjà tout vers le bon serveur, donc il n'y avait rien à changer. Il a choisi le domaine qui marcherait « tout seul » et m'a expliqué le compromis, au lieu de forcer aveuglément celui que j'avais nommé.

Celui qui m'a vraiment scotché : je fais tourner une instance de Brave dans Docker qu'on peut piloter à distance. La seule chose que j'ai faite, c'est ouvrir Listmonk et me loguer. L'agent s'est connecté à cette session de navigateur déjà authentifiée et a fait *toute* la configuration de Listmonk depuis l'intérieur de la page loguée — création de la liste d'abonnés, création d'un utilisateur API, génération de son token, configuration du serveur SMTP — en appelant l'API de Listmonk en se faisant passer pour moi. Je n'ai jamais eu à copier le moindre identifiant où que ce soit.

Quand tout était câblé, il a ajouté un faux abonné via l'endpoint de production réel, a confirmé qu'il atterrissait dans la bonne liste, a vérifié que le mail de bienvenue partait vraiment, puis a supprimé l'abonné de test. Il s'est connecté à mon serveur mail en SMTP juste pour prouver que les identifiants marchaient avant de les câbler. Les campagnes jetables qu'il a créées pour tester l'API ? Supprimées aussi.

Le plus étrange, c'est que la partie difficile n'a jamais été le code. C'étaient les décisions : ai-je vraiment besoin de migrer ? Quel domaine ? Envoyer automatiquement, ou relire d'abord ? L'agent était infatigable sur le travail mécanique et vraiment doué pour faire ressortir les compromis — mais le goût, quoi garder et quoi jeter, devait rester le mien. C'est impressionnant, un peu déroutant, et je suis assez convaincu que c'est la direction que prennent les choses.

## 8. Conclusion

J'ai commencé en voulant tout réécrire et j'ai fini par garder Hugo, supprimer la moitié de ma structure de contenu, et auto-héberger une newsletter qui tourne presque toute seule. C'est drôle comme ça se passe.

S'il y a une leçon ici, c'est la même que je réapprends sans cesse : la plupart du temps, on n'a pas besoin d'un nouvel outil, on a besoin d'enlever des choses. Et quand on ajoute quelque chose, regardez d'abord si ça tient dans un `docker-compose.yml`.

D'ailleurs, il y a maintenant un petit formulaire en bas de cet article. Si vous voulez le prochain dans votre boîte mail, vous savez quoi faire.

Merci d'avoir lu jusqu'ici, et à bientôt.
