---
title: "Readest: The Open-Source Multi-Platform Ebook Reader That Syncs Everything"
date: 2026-01-19
type: post
tags: ["self-hosting", "books", "ebook", "open-source", "readest", "reading", "epub", "koreader"]
description: "Discover Readest, a modern open-source ebook reader available on macOS, Windows, Linux, Android, iOS, and Web. Sync your books, annotations, and reading progress across all your devices."
image: "/img/readest.webp"
---

## A Christmas Mishap

Last Christmas holidays, I was traveling to visit family. In the rush of packing, I forgot my e-reader. Disaster for an avid reader like me. Two weeks without being able to finish [The WEIRDest People in the World](/books/the-weirdest-people-in-the-world/) by Joseph Henrich?

Fortunately, thanks to the setup I described in [my article about my self-hosted digital library](/posts/digital-library-with-zlibrary-syncthing-opds/), I could access all my ebooks from my phone via my OPDS server. I downloaded the book and continued where I left off. Problem solved... partially.

Because while I had access to my books, I couldn't retrieve my reading progress or annotations. I had to flip through the book to find where I was, and all the notes I had taken on my e-reader were inaccessible from my phone.

## The Ideal Setup I'm Looking For

This mishap got me thinking about what my ideal reading setup would be. After some reflection, here's what I need:

**Access to my library from anywhere.** That's already sorted thanks to Syncthing and my OPDS server. Whether I'm at home, at the office, or at my parents' place 500 miles away, my books are accessible.

**Synchronization of notes and reading progress.** This is the weak point of my current setup. I use KOReader on my Kobo e-reader, and theoretically it's possible to sync progress and annotations via their sync server. But despite several attempts, I've never managed to get it working properly. Result: when I switch devices, I lose everything.

**Handwritten note-taking with a stylus.** My e-reader supports it, and I love being able to scribble in the margins like in a real book. But these annotations remain trapped on the device.

**Access to an LLM.** Being able to query an AI about a book's content, get chapter summaries, or dive deeper into a concept without leaving my reading. That would be a game changer.

## And Then I Discovered Readest

I had been searching for months for software that would meet all these needs. Without success. Frustrated, I eventually decided to build it myself. While asking an LLM to show me JavaScript code examples for reading EPUB and PDF files, Readest appeared in the results. Sometimes the best way to find something is to try building it yourself.

And as it turns out, this open-source project already does, or aims to do, exactly everything I'm looking for.

Readest was born from a similar frustration to mine. It's essentially the spiritual successor to Foliate, an excellent Linux reader I used to use. But where Foliate is limited to a single platform, Readest works everywhere: macOS, Windows, Linux, Android, iOS, and even as a web version accessible from any browser.

The killer feature is synchronization. Your books, reading progress, notes, and bookmarks travel with you from one device to another. I start a book on my computer in the morning, continue on my phone during my commute, and in the evening pick up exactly where I left off on my tablet. No fiddling, no export/import, it just works.

What particularly sold me is the project's roadmap. The team is actively working on KOReader synchronization, exactly what I would need to connect my Kobo e-reader to the Readest ecosystem. OPDS support already exists but is still buggy (can't access subdirectories for now). Calibre support is also planned.

And the cherry on top: AI-generated chapter summaries are in development, as well as support for handwritten annotations on stylus devices.

## An Unexpected Feature

While exploring the app, I discovered a feature I'd never seen elsewhere: parallel reading. You can display two books side by side in a split-screen view. At first I wondered what the use case was, but it's actually great for comparing a translation with the original, or reading a technical book while consulting its documentation.

Format-wise, Readest handles the essentials: EPUB obviously, but also MOBI and AZW3 for legacy Kindle files, FB2, and CBZ for comics. PDF support is still experimental, but for my daily reading which is 95% EPUB, that works perfectly for me.

## My New Workflow

With Readest, my reading workflow is evolving. Acquisition stays the same: I download ebooks via the Z-Library Telegram bot and Syncthing syncs them to my server. But for reading, I'm gradually moving from KOReader to Readest on my devices other than my e-reader.

While waiting for KOReader sync to become available, I've found a balance: Readest on phone, tablet, and computer (where sync works perfectly), and KOReader on my Kobo e-reader (for the comfort of the e-ink screen). It's not the perfect setup yet, but it's a clear improvement over before.

## Conclusion

Readest is still a young project in active development. Some features I'm waiting for aren't there yet. But I like the approach: free software that respects privacy and aims to solve exactly the problems I encounter daily.

If like me you've experienced the frustration of losing your reading progress when switching devices, or if you dream of a truly unified reading ecosystem, Readest deserves your attention.

For those who want to learn more or try it themselves, head to the [official website](https://readest.com/) or the project's [GitHub repository](https://github.com/readest/readest).
