---
title: "One of my biggest LLM use cases right now: getting them to take over my browser"
date: 2026-07-06T21:55:25Z
tags: ['x', 'llm', 'browser-automation', 'docker']
type: post
showTableOfContents: false
draft: false
---

One of my biggest LLM use cases right now: getting them to take over my browser for tedious tasks.

I'm getting lazier and lazier. The moment I hit a new interface, I log in once, then hand the rest to the agent.

The setup: a VPS running Docker, a real browser (not headless) running 24/7 inside it, and the agent connecting to it over CDP via websocket — like it's grabbing the keyboard and mouse of a browser that's already open, same profile, same cookies, same history. A freshly launched headless browser screams "bot" the moment a site pays any attention. Here, as far as the site is concerned, it's just me coming back.

Save the cookies once = no more logging back in, and it often skips the login-time captcha entirely.

The one catch: some sites throw a random captcha mid-session, no warning. When that happens the agent stops everything, sends me a message, I go solve the challenge by hand, and it picks up exactly where it left off.

In practice it does everything I'd do myself in a browser: post on X, search a search engine without going through an API, reverse-engineer a piracy streaming site, set up an account in a new workout-tracking app, etc.

Video proof: the agent posting a tweet and deleting it itself, without me touching anything. 👇

Repo (docker-compose + everything an LLM needs to connect to it): [github.com/sepiropht/llm-browser-agent](https://github.com/sepiropht/llm-browser-agent)

{{< video src="/videos/llm-browser-automation.mp4" controls="true" >}}

---

*Originally posted on [X](https://x.com/sepiropht/status/2074250892594016395)*
