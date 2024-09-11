---
weight: 10
title: 'Auto-hébérgement pour le indie-hacker'
image: 'img/post3.webp'
date: 2024-09-12T14:19:38.315Z
description: 'Comment utiliser au maximum les services auto-héberger quand on est indie-hacker'
tags: ['docker', 'auto-hébergement', 'mail', 'indie-hacker']
type: post
showTableOfContents: true
draft: false
---

# Intro

Je cherche à augmenter ma précence en ligne, c'était une de mes résolution de l'année 2024. L'objectif c'est d'avoir une audience avant de créer un eventuel produit.
J'ai énormément procrastiner donc les choses avancent lentement. Une contrainte que je m'étais fixé était d'utiliser au maximun des services auto-hébergé

## 1. Hébergement

En principe ce que je recommanderai pour quelqu'un qui se lance, c'est de rapidement tester le marché et pas trop s'embêter avec l'infrastructure. Donc vercel est pour moi un choix raisonnable, je l'utilise depuis des années et je n'ai jamais eu de problèmes avec eux. Bien sûr ça suppose que la stack sera entièrmeent en javascript.
Ce blog et un autre site que je gère pour une association sont sur vercel.

Ca peut sembler paradoxal, mais je trouve que pour du static hosting vercel est imbatabe et pour le coup gratuit.

Pour ma micro-app par contre j'ai opter pour de l'auto-hébergement pur. Avoir une app en production sur son vps est exercise qui peut ardu, mais je ne suis globalement satisatit de mon setup, j'avais l'intention de réfdiger un article de blog complet dessus mais cette [vidéo](https://www.youtube.com/watch?v=F-9KWQByeU0&) vient de me couper l'herbe sous les pieds.

Elle est ultra complète et c'est quasiment le même setup que le mien. Il y a quand même quelques différence notable moi j'utilise caddy comme serveur web, j'utilise cirecleci et je me logue en ssh pour deployer sur le serveur de production, ce qui parailleur me pose problème car pour ça il fallu que je copie ma clé privé ssh dans le bashboard de circleci, ce qui me semble n'est pas une bonne pratique . Mais vu ce qu'il propose dans sa vidéo je pense bien changer ça, l'utilisation de watchtower m'a semblé vraiment pratique.

J'ai aussi appris qu'on pouvais faire du load-balencing avec juste docker-compose et ça j'ai trouvé ça incroyable ! J'ai essayé d'intégrer ça rapidement dans mon projet mais ça n'a pas trop marché, donc il faudra que je prenne encore de temps pour bien comprendre commen ça fonctionne.

Ca m'est utilse car il est déjâ arrivé que jes bugs de productions et que l'app soit indipsonibles pendant plusieurs heures, rien de dramatique car je n'ai aucun utilisateurs réguliers / payants.

Donc vraiment cette vidéo vaut le détour.

## 2.Analytics

J'aime bien savoir d'où vienne mes utilisateurs et pour ça utliser du tracking est bien utile. Hors de question d'utiliser google-analytics que je veux mon service auto-héberger et aussi parce que je trouvais le dashboard de google-analytics franchement intimidant. Après quelques recherche j'ai trouvé [umami](https://github.com/umami-software/umami) qui correspond vraiment à mon besoin. Auto-hébergé et très simple a prendre en main.

C'est une application en Next.js et autrefois je la fesait tourné sur mon fameux serveur rpi 2 de 2017, mais maintenant je ne me casse plus la tête, je le deploi sur vercel. En 2 clic c'est possible d'avoir son instance privé. Il sufit de cloner le projet sur github et de rendre sur le dashboard vercle et de déployer.
Oui ça peut paraître contraditoire de parler encore de vercel, mais là c'est juste trop pratique. Après il y aura quand même la base prostgresql et la parcontre j'utilse un container sur un des mes vps. Je passe ensuite l'url de la base dans les variables d'environnement. Donc l'honneur est sauf car au moins je contrôle mes données.
Voila à quoi ressemble la vue du dashboard sur l'artcile sur mon [homelab](https://elimbi.com/posts/my-homelab/).
![dashboard umami sur l'artcile sur mon homelab](/img/dashboard-homelab.png)

Il a eu pas mal de succès.

## 3. Support client

J'ai mon petit micro-saas que j'ai lancé en début d'années, il me rapporte rien et je ne pense pas que ça va changer. Toutefois c'est la première fois qu'un des mes side project va aussi loin. Depuis que l'app tourne j'ai déja vu des centaines d'utilsateurs passé. Le bémol c'est qu'ils testent mais ne reviennent pas. J'ai donc pensé rajouter un boite de dialogue dans l'interface qui me permet d'interegir avec les utilissateurs et eventuelement mieu comprendre leur besoin.

C'est bien entendu hors de question de payé un services pour ça. Je me suis tourné vers une solution en auto-hébéergement, vous connaissez la chanson maintenant: [chatwood](https://github.com/chatwoot/chatwoot). J'ai installé le serveur sur un de mes vps, l'app est en ruby, ce language n'est pas si courant, et ensuite j'ai pu rajouter mon site web en copiant bout de code que j'ai collé dans le body, en suivant la docs sur comment rajouter leur élémént dans une app Next.js j'étais bloqué, mais `Claude 3` m'a aider.

Il y a aussi une app mobile qui pourra m'envoyer des notifications si jamais un utilisateurs intéragis avec la boite de dialogue.
Tout ça est en place depuis quelques jours et j'attends toujours mon prmeier message peut être vous ?

## 4.Mailing listes

Pour mon blog je voulais une newletter, c'est le seul moyen de mesurer l'engagment des lecteurs. Je suis pas très à l'aise mâme avec le l'utilsation d'un service de ce type, donc c'est clairement la partie la plus challengente. Et la encore graĉe à la meirveilleuse communauté open-source j'ai trouvé [listmonk](https://github.com/knadh/listmonk). L'installation se fait très facilement grâce à un docker-compose,
il faut bien faire attention à installer la version `production`.  
L'app est go, donc elle prends vraiment pas beacoup de place en mémoire donc je l'ai carrément installé dans mon homelab. J'avais fait ça aussi avec mon service anlytics.
Pour l'instant je n'envoie pas de mail de confirmation, par ce que j'ai pas réussi à le personnaliser, le mail par défaut est assez moche.
Si vous vous inscriverz vous ne recevrer par de mails, allez y vous pouvez tester :).
A noter evidement que pour fonctionner on a besoin d'un provider mail.

##  5. Mail

Cela fait une transition parfaite pour le dernier service, de loin le plus compliqué à auto-héberger. C'est beaucoup plus facile d'avoir son propre netflix que d'avoir son propore gmail.
Je me suis quand même lancé dans l'aventure.L'installation ce fait sur un vps vierge (obligatoire il me semble) et j'ai utilisé [Mailbox](https://mailinabox.email), qui propose un script de configuration qu'il faut suivre. Honnètement je m'attendais à rien quand je me suis lancé, mais aujourd'hui je peut dire que ça fonctionne !

J'en ai même une utiisation sérieuse, même si non critique car je l'utilse dans un webhook stripe pour envoyer un reçu fiscal par mail au donateur de l'association dont je gère le site.

Ce qui est vraiment bien avec cet outils, c'est qu'on peut avoir une infinité de custom domain associé avec seulement une seule installation. Ca je le savais pas forcément au départ et c'est une agréable surprise. J'avais déja essayé d'avoir un custom domain avec proton et c'était quand même 5 euros par mois. Donc toon mes prochains saas pourron avoir un joilie mial du type `contact@site-project.com` sans que cela ne me coûte un centimes de plus. Le vps sur lequel est installé le mon serveur est chez [ionos](https://www.ionos.fr/) (pas d'affliation) et me coûte 1 euro par mois.

Je sais pas si j'aurai le courage pour m'en servir pour quelques chose de vraiemnet sérieux, mais pour l'instant ça fonctionne étonnant bien.
