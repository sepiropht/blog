---
weight: 10
title: "I had Claude download a movie because nobody was seeding it"
date: 2026-06-29T22:00:00.000Z
description: "My girlfriend wanted to watch Sparkle, Whitney Houston's last film. My *arr stack had zero seeders, so I asked Claude to handle it."
tags: ['ai', 'claude', 'self-hosting', 'radarr', 'jellyfin', 'x']
type: post
showTableOfContents: false
draft: false
---

My girlfriend wanted to watch Sparkle, Whitney Houston's last film. I have a full *arr stack running, I thought this would take 30 seconds.

No seeders. Zero. Asked Claude to add better trackers. "They're already configured, nobody is seeding this." A 2012 Whitney Houston film and the internet has collectively moved on.

Found it on a streaming site. Problem: she wants the TV, not the laptop, and I'm not explaining Chromecast at 9pm.

About to give up. Out of pure desperation, I ask Claude to just get me the film. It reverse-engineered the streaming site's encryption, extracted the source, and downloaded the full 1080p file. I then asked it to place everything exactly where Radarr would have, right folder, metadata, poster from TMDB, French and English subtitles named so Jellyfin picks them up automatically.

Opened Jellyfin on the TV. Sparkle (2012). Poster. Synopsis. Subtitles. Indistinguishable from anything else in the library.

She didn't notice a thing. Just pressed play.

Then I asked Claude to remember the whole method and save it as a reusable skill, so any future session could just pick it up and run it without me explaining anything again.

The first download took over an hour. I asked Claude if it could go faster. It added parallel fragment downloading to the command, one line change. I tested it on Spider-Man 2, 3.3GB, done in 10 minutes.

We are genuinely blessed with these tools. The *arr stack is incredible until it isn't. And when it isn't, you now have an agent that fills the gap, remembers the solution, and gets better at it. All in the same conversation.

The future is weird and I'm here for it.

![Sparkle (2012) in Jellyfin](/img/claude-downloaded-sparkle.png)

---

*Originally posted on [X](https://x.com/sepiropht/status/2071676521865961521)*
