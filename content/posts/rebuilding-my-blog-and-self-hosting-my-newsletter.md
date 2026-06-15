---
weight: 10
title: 'Rebuilding my blog and self-hosting my newsletter'
date: 2026-06-09T12:00:00.000Z
description: 'How I stopped wanting to ditch Hugo, simplified my blog, and self-hosted a full newsletter with Listmonk, Docker and Caddy.'
tags: ['hugo', 'self-hosting', 'docker', 'listmonk', 'caddy', 'newsletter', 'x']
x_url: 'https://x.com/sepiropht/status/2064762596037968024'
type: post
showTableOfContents: true
draft: false
---

## 1. The itch

It started with a small annoyance: my home page felt empty. It showed my avatar, my name, a tagline, and the last four posts. That's it. I wanted something that looked more like a real archive, and I started wondering if I had outgrown Hugo.

For a moment I seriously considered throwing the whole thing away and rebuilding it with plain HTML, CSS and a bit of JavaScript. "More flexibility", I told myself. You know the feeling.

Spoiler: I didn't ditch Hugo. And I'm glad.

## 2. Flexibility was already there

The thing I disliked wasn't really Hugo, it was the theme. And it turns out you don't have to fight the theme: you just override its layouts in your own `layouts/` folder, file by file, without ever touching the theme submodule.

So I wrote my own home page that lists **every** post, grouped by year:

```go-html-template
{{ $posts := where .Site.RegularPages "Params.type" "post" }}
{{ range $posts.GroupByDate "2006" }}
    <h2 class="post-year">{{ .Key }}</h2>
    {{ range .Pages.ByDate.Reverse }}
        {{- partial "list-posts.html" . -}}
    {{ end }}
{{ end }}
```

That's it. No migration, no rewrite, no new framework to learn. The home page went from "a bit empty" to a clean, chronological list of everything I've written.

## 3. Killing the clutter

While I was at it, I did some spring cleaning. I had a "Now" page and a "Thoughts" section that I never really maintained as separate things. The truth is, they were just posts with a particular flavour.

So I deleted the sections and turned everything into regular posts with tags. One stream, one place, and tags do the sorting. The menu went from five items down to almost nothing. I even removed the avatar and tagline from the home page entirely — if you want to know who I am, you'll find out by reading.

Less to maintain, less to think about. That's usually the right direction.

## 4. The real project: self-hosting my newsletter

Here's where it got fun. I wanted a newsletter, and of course I wanted to self-host it. The tool for that is [Listmonk](https://listmonk.app/), and like everything else in my homelab, it runs with Docker Compose:

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
    # secrets live in a .env file, never in here

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

One `docker compose up -d` and I have a Postgres database and a full mailing-list app running. Same story as always: I love this.

A small detail I care about: notice the app only listens on `127.0.0.1`. It's never exposed to the internet directly.

## 5. Exposing it without exposing it

My blog itself lives on Vercel (static hosting, free, unbeatable), but the newsletter form on each post talks to a small serverless function that calls Listmonk. So Listmonk needs to be reachable — but I really don't like opening ports to the world.

My setup: Listmonk runs on one machine, my reverse proxy (Caddy) runs on another, and the two talk to each other over a private mesh VPN. Caddy is the only thing facing the internet, and it gets a TLS certificate automatically:

```caddyfile
newsletter.example.com {
  reverse_proxy http://my-listmonk-host:9000
}
```

That's the whole config. Caddy fetches a Let's Encrypt certificate on its own, and the box running Listmonk stays invisible from the outside. Clean.

## 6. Automating the boring part

A newsletter is only useful if it actually goes out. I didn't want to log in and copy-paste every time I publish. So now a small CI job runs on every push: it looks at what I just added, and if it's a new post, it creates a campaign in Listmonk targeting all my subscribers.

For now I keep it in "draft" mode — the campaign is created but not sent — so I get to glance at it before hitting send. Once I trust it, flipping it to send automatically is a one-line change.

## 7. The part that genuinely surprised me

I should be honest about how all of this happened: I did it pairing with an AI coding agent running in my terminal. And I don't mean "it wrote a function for me". I mean it actually operated my infrastructure, end to end, while my job mostly shrank to making decisions and occasionally logging into something.

A few moments stuck with me. My Caddy instance doesn't run on the same machine as the blog — it's on another box, reachable over my private mesh VPN (I use NetBird). The agent SSH'd into it on its own. It couldn't use `sudo` (no password — and honestly I'm glad it can't), so instead of touching the root-owned config file it talked to Caddy's local admin API to add the new site route on the fly, then handed me a single copy-paste command for the part that really needed root. It even spotted a leftover editor swap file and flagged it.

Then there was the DNS. I asked it to point a subdomain at the service. It tried, discovered the domain's DNS wasn't hosted where it assumed, found a little script I'd written ages ago to talk to my registrar's (Namecheap) API, queried the real records through it — and realised a wildcard record already sent everything to the right server, so there was nothing to change. It picked the domain that would "just work" and explained the trade-off, instead of blindly forcing the exact one I'd named.

The one that really got me: I run a Brave instance inside Docker that can be driven remotely. The only thing I did was open Listmonk and log in. The agent connected to that already-authenticated browser session and ran the *entire* Listmonk setup from inside the logged-in page — created the subscriber list, created an API user, generated its token, configured the SMTP server — by calling Listmonk's own API as me. I never had to copy a single credential anywhere.

When everything was wired up, it added a fake subscriber through the live production endpoint, confirmed it landed in the right list, checked the welcome email actually went out, then deleted the test subscriber. It logged into my mail server over SMTP just to prove the credentials worked before wiring them in. The throwaway campaigns it created to probe the API? Deleted too.

The strange thing is that the hard part was never the code. It was the decisions: do I really need to migrate? Which domain? Send automatically, or review first? The agent was relentless at the mechanical work and genuinely good at surfacing trade-offs — but the taste, what to keep and what to throw away, still had to be mine. It's impressive, a little unsettling, and I'm fairly sure it's where things are heading.

## 8. Conclusion

I started wanting to rewrite everything and ended up keeping Hugo, deleting half my content structure, and self-hosting a newsletter that mostly runs itself. Funny how that goes.

If there's a lesson here, it's the same one I keep relearning: most of the time you don't need a new tool, you need to remove things. And when you do add something, see if it fits in a `docker-compose.yml` first.

Speaking of which, there's now a little form at the bottom of this post. If you'd like the next one in your inbox, you know what to do.

Thanks for reading this far, and see you soon.
