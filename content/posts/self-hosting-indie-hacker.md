---
weight: 10
title: 'Self-hosting for indie-hacker'
image: 'img/post3.webp'
date: 2024-09-12T14:19:38.315Z
description: "How to maximize the use of self-hosted services when you're an indie hacker"
tags: ['docker', 'auto-hébergement', 'mail', 'indie-hacker']
type: post
showTableOfContents: true
draft: false
---

# Intro

I'm looking to increase my online presence, which was one of my resolutions for 2024. The objective is to build an audience before creating a potential product.
I've procrastinated a lot, so things are progressing slowly. One constraint I set for myself was to use self-hosted services as much as possible.

# 1. Hosting

In principle, what I would recommend for someone starting out is to quickly test the market and not worry too much about infrastructure. So Vercel is, in my opinion, a reasonable choice. I've been using it for years and have never had problems with them. Of course, this assumes that the stack will be entirely in JavaScript.
This blog and another site I manage for an association are on Vercel.

It may seem paradoxical, but I find that for static hosting, Vercel is unbeatable and, in this case, free.

For my micro-app, however, I opted for pure self-hosting. Having an app in production on your VPS can be a challenging exercise, but I'm generally satisfied with my setup. I intended to write a complete blog article about it, but this [video](https://www.youtube.com/watch?v=F-9KWQByeU0&) just beat me to it.

It's ultra-complete and almost the same setup as mine. There are still some notable differences: I use Caddy as a web server, I use CircleCI, and I log in via SSH to deploy on the production server, which, by the way, causes me problems because I had to copy my private SSH key into the CircleCI dashboard, which doesn't seem like a good practice. But given what he proposes in his video, I think I'll change that. The use of Watchtower seemed really practical.

I also learned that you can do load balancing with just docker-compose, and I found that incredible! I tried to quickly integrate it into my project, but it didn't work too well, so I'll need to take more time to understand how it works properly.

It's useful to me because there have already been production bugs where the app was unavailable for several hours, nothing dramatic because I don't have any regular/paying users.

So really, this video is worth checking out.

# 2. Analytics

I like to know where my users come from, and for that, using tracking is very useful. Google Analytics is out of the question because I want my service to be self-hosted and also because I found the Google Analytics dashboard frankly intimidating. After some research, I found [Umami](https://github.com/umami-software/umami), which really fits my needs. Self-hosted and very easy to use.

It's a Next.js application, and I used to run it on my famous 2017 Raspberry Pi 2 server, but now I don't bother anymore, I deploy it on Vercel. In 2 clicks, it's possible to have your private instance. Just clone the project on GitHub and go to the Vercel dashboard to deploy.
Yes, it may seem contradictory to talk about Vercel again, but here it's just too convenient. However, there will still be the PostgreSQL database, and for that, I use a container on one of my VPSs. I then pass the database URL in the environment variables. So honor is safe because at least I control my data.
Here's what the dashboard view looks like for the article on my [homelab](https://elimbi.com/posts/my-homelab/).
![dashboard umami sur l'artcile sur mon homelab](/img/dashboard-homelab.png)
It has been quite successful !

# 3. Customer Support

I have my little micro-SaaS that I launched at the beginning of the year, it doesn't bring me anything, and I don't think that's going to change. However, it's the first time one of my side projects has gone this far. Since the app has been running, I've already seen hundreds of users pass through. The downside is that they test but don't come back. So I thought about adding a dialog box in the interface that allows me to interact with users and possibly better understand their needs.

Of course, it's out of the question to pay for a service for this. I turned to a self-hosted solution, you know the drill now: [Chatwoot](https://github.com/chatwoot/chatwoot). I installed the server on one of my VPSs, the app is in Ruby, which isn't such a common language, and then I was able to add my website by copying a piece of code that I pasted in the body, following the docs on how to add their element in a Next.js app. I was stuck, but Claude 3 helped me.
This is what it looks like on the site.
There's also a mobile app that can send me notifications if a user interacts with the dialog box.
All this has been in place for a few days, and I'm still waiting for my first message, maybe from you?

# 4. Newsletter

For my blog, I wanted a newsletter, it's the only way to measure reader engagement. I'm not very comfortable even with the use of this type of service, so it's clearly the most challenging part. And again, thanks to the wonderful open-source community, I found [Listmonk](https://github.com/knadh/listmonk). The installation is very easy thanks to a docker-compose,
you have to be careful to install the `production` version.  
The app is in Go, so it really doesn't take up much memory, so I installed it right in my homelab. I had done that with my analytics service too.
For now, I'm not sending confirmation emails, because I haven't managed to customize it, the default email is quite ugly.
If you sign up, you won't receive any emails, go ahead and test it :).
Note that obviously, to work, we need a mail provider.

## 5. Mail

This makes a perfect transition to the last service, by far the most complicated to self-host. It's much easier to have your own Netflix than to have your own Gmail.
I still embarked on the adventure. The installation is done on a fresh VPS (mandatory, I think) and I used [Mail-in-a-Box](https://mailinabox.email), which offers a configuration script to follow. Honestly, I wasn't expecting anything when I started, but today I can say that it works!

I even have a serious use for it, although non-critical because I use it in a Stripe webhook to send a tax receipt by email to donors of the association I manage.

What's really great with this tool is that you can have an infinite number of custom domains associated with just one installation. I didn't necessarily know that at the start, and it's a pleasant surprise. I had already tried to have a custom domain with Proton, and it was still 5 euros per month. So all my next SaaS projects can have a nice email like `contact@site-project.com` without it costing me a penny more. The VPS on which my server is installed is with [Ionos](https://www.ionos.fr/) (no affiliation) and costs me 1 euro per month.

I don't know if I'll have the courage to use it for something really serious, but for now, it works surprisingly well.
