---
weight: 10
title: 'Mon homelab'
image: 'img/post3.webp'
date: 2024-10-10T12:19:38.315Z
description: ''
tags: ['docker', 'self-hosting', 'nextcloud', 'homelab']
type: post
showTableOfContents: true
draft: false
---

I want to share the main software I use in my homelab. I won't go into depth this time; it's just an overview.

## 1. Homelab

I'll start by presenting the services running at my home. Some services, like the first one I'll present, require access from outside, in which case I use Wireguard.

### - Nextcloud

I discovered it at least 5 years ago while looking for a seedbox for my torrents. Nextcloud was installed by default on the seedbox. At first, I thought, "So what? It's just Google Drive or Dropbox on my server; I don't need it."
My opinion has changed since then, as now I think my entire life is on my private Nextcloud instance.

I find this software just too convenient. For example, I use it in conjunction with its mobile client, and I can automatically synchronize all my photos to my personal cloud. The configuration could be more intuitive, but once it's done, I don't think about it anymore, and I was able to deactivate Google Cloud. I get a little dopamine hit every time I reactivate Wi-Fi and see the photos going to my cloud.
There's also a desktop client, which allowed me to synchronize all my important data. I share the instance with a friend, and when we exchange files, they arrive directly on my filesystem thanks to the sync, and I find that really cool.

The interface is a bit austere, but it's functional. I particularly like the fact that you can select/deselect the directories that are synchronized. When you deselect a directory, the client erases the local data and keeps the ones stored on the server. Deleting data from the server is the only way to permanently delete data. I had a very bad experience with [Syncthing](https://syncthing.net/), which is peer-to-peer, so data deleted on a single client is permanently lost. This is not necessarily bad behavior; you just need to be aware of it. In any case, I'm more comfortable with the old client-server model in this specific case.

Nextcloud also serves as a backend for other applications I use:

- [Joplin](https://joplinapp.org/), which I use to take notes or write the article you're currently reading. Joplin has an Electron app and an Android mobile app, both pointing to my Nextcloud server.
- [Floccus](https://floccus.org/), which allows synchronization of bookmarks between Firefox and Chrome.

Some will say it's too heavy and should be rewritten in Rust, which they've actually started doing for some [parts](https://github.com/nextcloud/notify_push) at least. But I used Nextcloud for 2 years on a Raspberry Pi 2 released in 2017 with 1GB of RAM and many other services before the server gave up. So this reputation for heaviness is somewhat exaggerated. The only downside is the lack of native end-to-end encryption.

### - PhotoPrism

Even though Nextcloud allows me to easily retrieve photos from my phone (it's also possible with PhotoPrism, except the app is paid), PhotoPrism is really optimized for exploiting your personal photo/video library.
For PhotoPrism to access Nextcloud directories, I play with Docker volumes, always mounting them locally, so it's possible even if it's not always pretty:

```yaml
#docker-compose.yml photoprism
volumes:
  - '/mnt/ssd/nextcloud2/data/data/sepiropht/files/InstantUpload/WhatsApp Images:/photoprism/originals/images'
```

For those wondering how two containers can share data, here's the recipe.

There's a cron job that runs every day at 2 AM to read the files and transform them into PhotoPrism format. The web interface also allows importing files, but I've never used it.
The app is written in Go on the backend, so it's quite light and fast, not demanding on my server, and the web app is quite pretty and functional. There's no mobile app, but the PWA does the job well. The app is particularly smooth even on my old Raspberry Pi 2, and that fully justifies using PhotoPrism.

### - Vaultwarden

I don't have much to say about it; it works, it's efficient, and it's definitely the service I use the most. In my browsers with the add-ons and on my smartphone with the Bitwarden app. The only thing that bothers me a bit is that you're forced to use HTTPS to access the web app, so you're obliged to have a domain name (I believe so, right?) pointing to the service. For such a sensitive service, I would have preferred to just use my Wireguard bridge. Fortunately, this is not mandatory for extensions and the mobile app.

### - COPS

Probably the least known on the list, but not the least practical. I have a huge digital book library that's safe and sound in my Nextcloud instance.

When I download the EPUB with my desktop and copy it to the book directory, it's automatically sent to my instance (yes, I'm repeating myself, I know). It's also possible with mobile, but it's less fun because the mobile app only automatically synchronizes photos.
But how do I read these files on my Kobo e-reader? Out of the question to connect it via USB to my machine every time I want to take a book from my 16GB library. This is where [COPS](https://github.com/seblucas/cops) comes into play; it's an OPDS server. Every day at 3 AM, it reads my library and updates the Calibre database. Then these books are accessible on a web server with an OPDS protocol that can be read by the e-reader.

It works, but I find it complex, and especially the library updating only once a day; for photos, it's okay, but for books, it's less tolerable. There are alternatives like [Kavita](https://www.kavitareader.com/) that I'm testing at the moment, which seems to have everything:

- Beautiful web interface
- Continuous updates
- OPDS server for my Kobo e-readers

When installing Kavita, its memory consumption really scared me, but it seems to have settled down since.
Otherwise, Nextcloud (yes, again and always) also has an OPDS plugin, but I haven't managed to make it work.

### - Wallabag

I'm also a big reader of blog articles. For years, I used [Firefox's Pocket](https://support.mozilla.org/en-US/kb/save-web-pages-later-pocket-firefox), and I found and still find it amazing how well this thing works. My e-reader connects to my Pocket account and can download blog articles that I can then read comfortably on e-ink. I really feared not finding a service that runs at home and does the same thing, and fortunately, I was wrong. [Wallabag](https://github.com/wallabag/wallabag) does everything like Pocket:

- Add-on in Chrome and Firefox to save the current article to the server
- Mobile app with quick share option to share the article
- Web app (I admit it doesn't serve much purpose in both cases)
- Ability for my e-reader to connect to the server to retrieve articles.

I didn't mention it earlier, so I'll do it now: my Kobo e-reader needs [KOReader](https://koreader.rocks/) to be able to connect to a server.

# Homelab and Micro-SaaS Software Overview

[Previous content remains the same]

### - Audio and Video Streaming

I use Jellyfin to stream movies and series. I particularly like the fact that it has a mobile client and even a desktop client independent of the browser. For music, I use Navidrome, another app made in Go + React that I also particularly appreciate. The server implements the Subsonic protocol, which allows the use of a multitude of clients, even though I haven't found an open-source one that's good yet.

I use Transmission for torrents. I indicate to my Transmission container the path of my Nextcloud directory:

```yaml
#docker-compose.yml transmission
volumes:
  - '/mnt/ssd/nextcloud2/data/data/sepiropht/files:/output'
```

This allows me to access and browse the files downloaded with Transmission from Nextcloud. And I do the same thing between Jellyfin and Transmission. So all downloaded files automatically appear in the Jellyfin library.

### - Wireguard

The last on the list will be Wireguard, which I install simply thanks to [wg-easy](https://github.com/wg-easy/wg-easy). Installation takes 2 minutes thanks to docker-compose, and you even get a nice web interface to which you can add an authentication screen.
It's very useful for me to be able to access certain internal services without necessarily opening a port on my router and associating a domain name with this service.
