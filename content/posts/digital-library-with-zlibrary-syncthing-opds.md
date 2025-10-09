---
title: "My Personal Digital Library with Z-Library, Telegram, Syncthing and OPDS"
date: 2025-10-09
type: post
tags: ["self-hosting", "books", "opds", "syncthing"]
description: "How I built my own synchronized digital library using Z-Library, Telegram, Syncthing and an OPDS server"
---

## Introduction

Today, I'm going to show you how I set up my personal digital library. The goal is simple: download books from Z-Library via Telegram, automatically sync them to my server, and access them easily from any e-reader using the OPDS protocol.

## First Step: The Z-Library Telegram Bot

Z-Library offers access to a huge collection of books in English and French. Instead of using their website whose URL changes frequently, I use their Telegram bot which is much more stable and convenient.

To get started, simply create a Telegram bot with Z-Library:

![Z-Library Telegram Bot Setup](/img/telegram.png)

Once configured, the bot allows you to search and download any book directly in Telegram:

![Book search via Telegram](/img/recherche-telegram.png)

I've installed the Telegram desktop client, which means all downloaded files automatically end up in a local directory on my machine. This is where the magic begins with synchronization.

## Second Step: Synchronization with Syncthing

To make my books automatically available on my remote server, I use Syncthing. It's a decentralized, open-source, and ultra-reliable file synchronization tool.

### Syncthing Configuration on the Server

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

### Client-Side Configuration

On my local machine, I installed the Syncthing daemon and configured sharing of the directory where Telegram downloads books. This way, as soon as a new book arrives, it's automatically synced to my server within seconds.

## Third Step: OPDS Server with dir2opds

OPDS (Open Publication Distribution System) is a protocol that allows e-readers to browse and download books as if navigating an online library.

I use [dir2opds](https://github.com/dubyte/dir2opds), an OPDS server written in Go, ultra-lightweight and instantly updates when new files arrive.

### Installation and Launch

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

### Why dir2opds?

There are several OPDS servers available, but I chose dir2opds for several reasons:
- Written in Go, so ultra-fast and resource-light
- Instant updates when a new file arrives
- No database required
- Minimal configuration

## Fourth Step: Access from an E-Reader

Now that the OPDS server is in place, any e-reader with an OPDS client can connect to it. Most Android e-readers support it natively.

To connect my phone to the OPDS server, I simply configure the client with the server URL:

![OPDS Connection Configuration](/img/connection-opds.png)

Once connected, I can browse my entire library:

![OPDS Client on Android](/img/android-opds.png)

I particularly recommend [KOReader](https://koreader.rocks/), an open-source reader that works on many e-readers and perfectly integrates OPDS support.

## Conclusion

With this setup, I now have:
- Easy access to millions of books via Z-Library's Telegram bot
- Automatic synchronization to my personal server
- Universal access from any e-reader via OPDS

Everything is self-hosted, open-source, and works completely autonomously. No more plugging my e-reader into my computer or manually handling files!

This solution is particularly convenient when reading on multiple devices or when you want to share your library with other family members.
