---
weight: 10
title: 'Stockfish + LLM: A Real Chess Coach Without Hallucinations'
date: 2026-06-17T16:37:53.000Z
description: 'How to combine Stockfish and an LLM to get accurate, grounded chess commentary with zero hallucinations.'
tags: ['chess', 'llm', 'ai', 'stockfish']
image: 'img/chess-llm-stockfish.jpg'
type: post
showTableOfContents: false
draft: false
---

Ever since LLMs became accessible, my dream as a chess player was to combine them with Stockfish — to finally get plain-English commentary instead of long engine lines.

But I wanted the commentary to be accurate, grounded, and hallucination-free. I've never been closer to that goal. ♟

## The Problem: LLMs Can't Read a Board

The key insight: never let the LLM look at the chessboard on its own. That's exactly where it starts making things up.

Instead, a real chess engine does the observation work and hands the LLM pre-verified facts: the exact material balance, bishop color complex, pawn structure, game phase.

## The Architecture

Stockfish's evaluation reaches the LLM translated into words rather than numbers — for example "slight advantage for White" — so it can't invent a score.

When it comes to citing a specific move, it only draws from Stockfish's list of top calculated variations, never from its own imagination. No more "Rook to h4" when there's no rook on that file.

Finally, every move it mentions gets cross-checked against the actual position before being displayed.

## The Division of Labor

In short:

- **Stockfish calculates** the best variations
- **The engine verifies** the facts (moves, material, position)
- **The LLM explains** in plain language

Each does what it does best. That's how you get a real coach. ♟

---

*Originally posted on [X](https://x.com/sepiropht/status/2067285614760726922)*
