# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a bilingual (English/French) Hugo static site blog deployed on Vercel. The site features:
- Personal blog posts about self-hosting, Docker, and technical topics
- Lightning Network (LNURL) integration for cryptocurrency payments
- Nostr protocol integration
- Newsletter subscription system with Listmonk integration
- Custom theme (Gokarna) with custom JavaScript and CSS

## Hugo Configuration

- **Hugo Version**: 0.133.0 (specified in vercel.json)
- **Theme**: Gokarna (git submodule)
- **Base URL**: https://elimbi.com/
- **Languages**: English (default) and French

## Development Commands

### Local Development
```bash
# Start Hugo development server
hugo server -D

# Start server with drafts and verbose logging
hugo server -D --verbose

# Build the site
hugo

# Build with verbose output
hugo --verbose
```

### Content Management
```bash
# Create a new post (English)
hugo new content/posts/post-name.md

# Create a new post (French)
hugo new content/posts/post-name.fr.md

# Create a new book entry
hugo new content/books/book-name.md
```

### Theme Management
```bash
# Update theme submodule
git submodule update --remote themes/gokarna

# Initialize submodules after cloning
git submodule update --init --recursive
```

### Deployment
Deployment is automatic via Vercel when pushing to the master branch. No manual build/deploy commands needed.

## Architecture

### Content Structure
- **Posts**: `content/posts/` - Blog posts in both English and French (files with `.fr.md` suffix are French)
- **Books**: `content/books/` - Book-related content
- **Bilingual Support**: French posts use `.fr.md` suffix and automatic language detection redirects French-speaking users

### Static Assets
- `static/js/footer.js` - Newsletter form injection and submission handling
- `static/styles/` - Custom CSS
- `static/img/` - Images and icons

### Serverless API Endpoints (Vercel Functions)
Located in `/api` directory:

- **`subscribe.js`** - Newsletter subscription endpoint
  - Integrates with Listmonk API (https://listmonk.sepiropht.me)
  - Sends welcome emails via Nodemailer
  - Requires env vars: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `LISTMONK_USER`, `LISTMONK_TOKEN`, `EMAIL_FROM`

- **`lnurlp.js`** - LNURL-pay endpoint for Lightning Network payments
  - Returns payment request metadata

- **`lnurl-callback.js`** - LNURL callback handler

- **`invoice.js`** - Creates Lightning Network invoices
  - Integrates with LND node
  - Requires env vars: `DOMAIN`, `MACAROON`
  - Uses custom HTTPS agent with `rejectUnauthorized: false`

- **`check-payment.js`** - Verifies Lightning payment status

- **`nostr.js`** - Nostr protocol integration (NIP-05 identifier)

### URL Rewrites
Configured in `vercel.json`:
- `/.well-known/lnurlp/sepiropht` → `/api/lnurlp`
- `/.well-known/nostr.json` → `/api/nostr`

### Analytics
- Umami analytics integration via custom footer script
- Website ID: `d2ab5694-fea7-4132-aaa1-b7a43471cbb4`
- Analytics server: `https://analytics.sepiropht.me`
- Only loads on non-localhost environments

### Language Detection
Client-side JavaScript in `customFooterHTML` automatically redirects French-speaking users to `/fr/` URLs based on browser language.

## Content Frontmatter

Blog posts use this frontmatter structure:
```yaml
---
weight: 10
title: 'Post Title'
image: 'img/post.webp'
date: 2024-08-24T12:19:38.315Z
description: 'Post description'
tags: ['docker', 'self-hosting', 'saas']
type: post
showTableOfContents: true
draft: false
---
```

## Environment Variables Required

For local testing of API functions:
- `SMTP_HOST` - SMTP server hostname
- `SMTP_PORT` - SMTP server port
- `SMTP_USER` - SMTP username
- `SMTP_PASSWORD` - SMTP password
- `EMAIL_FROM` - Sender email address
- `LISTMONK_USER` - Listmonk API username
- `LISTMONK_TOKEN` - Listmonk API token
- `DOMAIN` - LND node domain
- `MACAROON` - LND macaroon for authentication

## Key Technical Details

1. **Newsletter System**: Footer JavaScript (`static/js/footer.js`) dynamically injects a newsletter subscription form on individual post pages (but not on the posts index). Form submission POSTs to `/api/subscribe`.

2. **Theme Customization**: Uses Gokarna theme with custom CSS (`static/styles/footer.css`) and custom HTML in `config.toml` (`customHeadHtml` and `customFooterHTML`).

3. **Lightning Payments**: Full LNURL-pay implementation with invoice generation and payment verification against an LND node.

4. **Bilingual Content**: Hugo's multilingual mode with automatic client-side redirection for French users.

5. **Git Submodules**: The theme is managed as a git submodule. Always use `git submodule update` commands when updating themes.
