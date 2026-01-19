---
title: "Self-Hosted Digital Library 2025: Z-Library Telegram + Syncthing + OPDS for Kobo, PocketBook, KOReader"
date: 2025-10-09
lastmod: 2026-01-19
type: post
tags: ["self-hosting", "books", "opds", "syncthing", "z-library", "ebook", "kobo", "koreader", "e-reader"]
description: "Complete guide to building a self-hosted digital library with Z-Library via Telegram, Syncthing file sync, and dir2opds OPDS server. Works with Kobo, PocketBook, Kindle, KOReader and all OPDS-compatible e-readers."
---

## Building Your Self-Hosted Digital Library: Complete Guide

Today, I'm going to show you how I set up my personal self-hosted digital library. The goal is simple: download ebooks from Z-Library via Telegram, automatically sync them to my server, and access them easily from any e-reader (Kobo, PocketBook, Kindle, or Android) using the OPDS protocol.

## Downloading Ebooks with the Z-Library Telegram Bot

Z-Library offers access to a huge collection of digital books in English and French. Instead of using their website whose URL changes frequently, I use their Telegram bot which is much more stable and convenient for downloading ebooks.

To get started, simply create a Telegram bot with Z-Library:

![Z-Library Telegram Bot Setup](/img/telegram.png)

Once configured, the bot allows you to search and download any book directly in Telegram in EPUB or PDF format:

![Book search via Telegram](/img/recherche-telegram.png)

I've installed the Telegram desktop client, which means all downloaded files automatically end up in a local directory on my machine. This is where the magic begins with synchronization.

## Automatic Ebook Synchronization with Syncthing

To make my books automatically available on my remote server, I use Syncthing. It's a decentralized, open-source, and ultra-reliable file synchronization tool — perfect for syncing an ebook library across multiple devices.

### Syncthing Server Configuration (Docker Compose)

On my VPS, I deployed Syncthing via Docker Compose:

```yaml
services:
  syncthing:
    image: lscr.io/linuxserver/syncthing:latest
    container_name: syncthing
    hostname: syncthing
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    volumes:
      - ./config:/config
      - ./data:/data
    ports:
      - 8384:8384
      - 22000:22000/tcp
      - 22000:22000/udp
      - 21027:21027/udp
    restart: unless-stopped
```

The management interface is accessible on port 8384. To simplify access, I use a Caddy reverse proxy:

```caddy
sync.domain.com {
    reverse_proxy http://syncthing:8384
}
```

### Client-Side Syncthing Configuration

On my local machine, I installed the Syncthing daemon and configured sharing of the directory where Telegram downloads books. This way, as soon as a new book arrives, it's automatically synced to my server within seconds.

## OPDS Server with dir2opds: Accessing Ebooks from Your E-Reader

OPDS (Open Publication Distribution System) is a protocol that allows e-readers to browse and download books as if navigating an online library. It's the standard used by Kobo, PocketBook, KOReader, and most reading applications.

I use [dir2opds](https://github.com/dubyte/dir2opds), an OPDS server written in Go, ultra-lightweight and instantly updates when new files arrive.

### Installing and Running dir2opds

```bash
podman run --name dir2opds --rm --userns=keep-id \
  --mount type=bind,src=/home/pi/syncthing/data,dst=/books,Z \
  --publish 8008:8080 \
  -i -t localhost/dir2opds /dir2opds -debug
```

The important part here is to properly mount the directory where Syncthing synchronizes the books (`/home/pi/syncthing/data` in my case).

To simplify access to the OPDS server, I also use a Caddy reverse proxy:

```caddy
opds.domain.com {
    reverse_proxy http://dir2opds:8080
}
```

### Why Choose dir2opds as Your OPDS Server?

There are several OPDS servers available (Calibre-web, COPS, etc.), but I chose dir2opds for several reasons:
- Written in Go, so ultra-fast and resource-light
- Instant updates when a new file arrives
- No database required
- Minimal configuration
- Perfect for self-hosted use

## Setting Up OPDS on Kobo, PocketBook, and KOReader

Now that the OPDS server is in place, any e-reader with an OPDS client can connect to it.

### OPDS-Compatible E-Readers

- **Kobo**: via KOReader or the NickelMenu app
- **PocketBook**: native built-in OPDS support
- **Kindle**: via KOReader (after jailbreak)
- **Android**: numerous apps (Moon+ Reader, FBReader, etc.)

To connect my phone to the OPDS server, I simply configure the client with the server URL:

![OPDS Connection Configuration](/img/connection-opds.png)

Once connected, I can browse my entire library:

![OPDS Client on Android](/img/android-opds.png)

I particularly recommend [KOReader](https://koreader.rocks/), an open-source reader that works on many e-readers (Kobo, Kindle, PocketBook, Android) and perfectly integrates OPDS support.

## January 2026 Update: 3-Month Review

After more than 3 months of daily use, here's my feedback on this setup:

### What Works Perfectly

- **Z-Library Telegram bot**: still functional and stable, no URL or configuration changes needed
- **Syncthing**: instant and reliable synchronization, no file losses
- **dir2opds**: the OPDS server has been running without interruption since October

### Adjustments Made

- Added a Docker healthcheck to automatically restart dir2opds if needed
- Organized ebooks into subfolders by genre for easier navigation on the e-reader

### Alternatives if Z-Library Telegram Changes

If the Telegram bot were to change or disappear:
- **Anna's Archive**: decentralized alternative with a large collection
- **Library Genesis**: still accessible via mirrors
- **Calibre + DeDRM**: for your own legally purchased ebooks

## Conclusion: Your Self-Hosted Digital Library

With this setup, I now have:
- Easy access to millions of books via Z-Library's Telegram bot
- Automatic synchronization to my personal server with Syncthing
- Universal access from any e-reader (Kobo, PocketBook, Kindle, Android) via OPDS

Everything is self-hosted, open-source, and works completely autonomously. No more plugging my e-reader into my computer or manually handling files!

This solution is particularly convenient when reading on multiple devices or when you want to share your library with other family members.
