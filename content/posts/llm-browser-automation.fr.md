---
title: "Un de mes plus gros usages des LLM en ce moment : leur faire prendre le relais dans mon navigateur pour des tâches chiantes"
date: 2026-07-06T22:18:10Z
tags: ['x', 'llm', 'browser-automation', 'docker']
type: post
showTableOfContents: false
draft: false
---

Un de mes plus gros usages des LLM en ce moment : leur faire prendre le relais dans mon navigateur pour des trucs chiants.

Je deviens de plus en plus fainéant. Dès que je tombe sur une nouvelle interface, je me logue une fois, puis je lâche l'agent dessus.

Le setup : un VPS avec Docker, un vrai navigateur (pas headless) qui tourne 24/7 dedans, et l'agent qui s'y connecte via CDP en websocket — comme s'il prenait le clavier et la souris d'un navigateur déjà ouvert, avec le même profil, les mêmes cookies, le même historique. Un headless fraîchement lancé crie "bot" à la moindre requête un peu regardante. Là, pour le site en face, c'est juste moi qui reviens.

Cookies sauvegardés une fois = plus besoin de se reloguer, et souvent ça évite carrément le captcha au login.

Le seul hic : certains sites balancent un captcha random en pleine session, sans prévenir. Là l'agent arrête tout, m'envoie un message, je vais résoudre le challenge à la main, et il repart pile où il s'était arrêté.

Concrètement ça fait tout ce que je ferais moi-même dans un navigateur : poster sur X, chercher sur un moteur de recherche sans passer par une API, reverse-engineer un site de streaming pirate, configurer un compte dans un nouveau logiciel de suivi d'entraînement, etc.

Preuve en vidéo : l'agent poste un tweet et le supprime lui-même, sans que j'y touche. 👇

Repo (docker-compose + tout ce qu'il faut pour qu'un LLM s'y connecte) : [github.com/sepiropht/llm-browser-agent](https://github.com/sepiropht/llm-browser-agent)

{{< video src="/videos/llm-browser-automation.mp4" controls="true" >}}

---

*Publié originalement sur [X](https://x.com/sepiropht/status/2074256617202409780)*
