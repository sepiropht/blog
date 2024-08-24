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

## 1. Probleme

The problem: I have a single VPS in the cloud, and I have many apps that I code myself or services (Bitwarden, Nextcloud...) that I want to expose to the public.
So sometimes I may want to have more than one domain for a single machine. Is that possible?

The answer is yes.

This may seem trivial to a lot of people, but back in December 2022, I wasn’t sure if this was possible and how to do it.
I had used cloud services like Vercel and Netlify a lot in the past, but I wanted to understand how things really work behind the scenes when you manage the infrastructure yourself.

There are well-known tools to handle these issues, like Apache and Nginx. But I adopted a newcomer that is ultra-simple in terms of configuration.

## 2. Discovering Caddy

The prerequisite is, of course, to have one or more domain names pointing to your VPS. Then, you need to install Caddy. There are two approaches: you can either use your Linux distribution’s package manager, or you can install Caddy using Docker Compose.

The latter is a faster method to get a working Caddy, but it will also require you to create a common network for all your containers. By default, containers do not see each other and cannot communicate. For native installation, go[there](https://caddyserver.com/docs/install),

```bash
$ sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
$ curl -1sLf 'https://dl.cloudsmith.io/public/caddy/testing/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-testing-archive-keyring.gpg
$ curl -1sLf 'https://dl.cloudsmith.io/public/caddy/testing/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-testing.list
$ sudo apt update
$ sudo apt install caddy

```

Once the installation is done, you will need to modify the `Caddyfile`. The structure of this file resembles JSON.

```bash
$ vim /etc/caddy/Caddyfile
```

Your file should look like this:

```json
saas1.com {
	reverse_proxy http://localhost:3000   // one saas
}

saas2.com {
	reverse_proxy  http://localhost:4000  // another saas
}

blog.saas1.com {
	reverse_proxy  http://localhost:8080   // you can liiteraly have infinte amount of service with sub-domain
}

```

To start the Caddy daemon:

```bash
$ sudo systemtcl start caddy
$ sudo systemtcl enable caddy
```

Don't forget to restart the Caddy service after each modification to the `Caddyfile` with the `restart` command.

By default, Caddy also handles SSL, which is very convenient. So, all the entries we've created here will be accessible via `https`.

Of course, you can do more complex things with Caddy, but here I just wanted to illustrate the simplicity of Caddy and how you can quickly set up a reverse proxy on your VPS.
Now you're done, you can start coding your own SaaS and expose them on your server !
