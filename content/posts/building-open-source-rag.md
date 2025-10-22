---
weight: 10
title: 'Building an Open-Source RAG System'
image: 'img/post-rag.webp'
date: 2025-10-22T10:00:00.000Z
description: "How I built a Retrieval-Augmented Generation system that anyone can self-host"
tags: ['ai', 'rag', 'open-source', 'self-hosting', 'machine-learning']
type: post
showTableOfContents: true
draft: false
---

# Intro

AI is becoming increasingly essential in our daily lives. Whether it's ChatGPT for writing, GitHub Copilot for coding, or specialized assistants for various tasks, we're all becoming dependent on these tools. The problem? Most of these services are expensive, closed-source, and require sending your data to third-party servers.

I wanted to explore how we could self-host AI capabilities, even with modest resources. Sure, it's demanding in terms of compute, but I think it's worth experimenting with, even if just for fun and learning. So I built an open-source RAG (Retrieval-Augmented Generation) system that lets you chat with any website using AI.

I actually use this same RAG technology in my commercial project [tubetotext.com](https://tubetotext.com), where it powers automated chatbots that can answer questions about video content. The principles are the same: scrape content (in that case, YouTube transcripts), chunk it, create embeddings, and use an LLM to answer questions. But I wanted to create an open-source version so anyone could learn from it and experiment with RAG without barriers.

This open-source project is available on GitHub at [github.com/sepiropht/rag](https://github.com/sepiropht/rag), and the best part? It uses mostly local/free resources!

# What is RAG Anyway?

RAG stands for Retrieval-Augmented Generation. It's a fancy term for a relatively simple concept: instead of asking an AI to answer from its training data alone, you first retrieve relevant information from a knowledge base, then feed that context to the AI to generate an answer.

Think of it like giving a student an open-book exam versus a closed-book exam. The student (AI) performs much better when they can reference specific materials (your documents).

Here's how the pipeline works in my project:

## 1. Scraping → Raw HTML/Text

**Input:** A website URL
**Output:** Raw HTML content from multiple pages

I use Puppeteer and Cheerio for this. Puppeteer is fantastic because it can handle JavaScript-heavy sites (React, Vue, etc.) by running a real browser. Cheerio is lighter and perfect for static HTML parsing.

```typescript
// Find sitemap or crawl pages
const sitemap = await this.findSitemap(url);
const links = sitemap ? await this.parseSitemap(sitemap) : await this.crawlPages(url);

// Scrape each page
for (const link of links) {
  const content = await this.scrapePage(link);
  pages.push(content);
}
```

The scraper is intelligent about link prioritization. It prefers article pages over listing pages, which gives better quality content.

## 2. Site Detection → Chunking Strategy

**Input:** Raw website content
**Output:** Optimal chunking parameters

Not all websites are the same! A blog post should be chunked differently than API documentation or an e-commerce site. I built a site detector that analyzes the HTML structure to determine the website type.

```typescript
const siteType = SiteDetectorService.detectSiteType(html, url);
// Returns: 'blog' | 'documentation' | 'e-commerce' | 'news' | etc.

const strategy = SiteDetectorService.getChunkingStrategy(siteType);
// Returns optimal chunk size, overlap, and boundary rules
```

For example:
- **Blog posts**: Larger chunks (1000 tokens), respect paragraph boundaries
- **Documentation**: Medium chunks (800 tokens), respect section boundaries
- **E-commerce**: Smaller chunks (600 tokens), keep product info together

## 3. Adaptive Chunking → Text Chunks

**Input:** Raw text + chunking strategy
**Output:** Array of semantically meaningful text chunks

This is where things get interesting. You can't just split text every N characters—you'll cut sentences in half or separate related information. My adaptive chunker respects semantic boundaries:

```typescript
const chunks = AdaptiveChunkerService.chunkContent(content, strategy);

// Each chunk:
// - Respects paragraph/section boundaries
// - Has overlap with adjacent chunks (for context)
// - Maintains headings and structure
// - Stays within size limits
```

The overlap between chunks is crucial. If someone asks about something mentioned at the end of one chunk and the beginning of another, the overlap ensures we don't lose context.

## 4. Embedding Generation → Vector Representations

**Input:** Text chunks
**Output:** 384-dimensional vectors (embeddings)

This is the magic of modern NLP. Each text chunk gets converted into a vector of numbers that represents its semantic meaning. Similar texts will have similar vectors.

Here's where I made an important decision: **local embeddings**. Instead of using OpenAI's API (which costs money and sends your data to their servers), I use Transformers.js with the `all-MiniLM-L6-v2` model:

```typescript
import { pipeline, env } from '@xenova/transformers';

// Configure for local execution
env.allowLocalModels = false;
env.useBrowserCache = false;
env.cacheDir = path.join(process.cwd(), '.cache', 'transformers');

// Initialize the model
this.embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

// Generate embeddings
const embedding = await this.embedder(text, {
  pooling: 'mean',
  normalize: true,
});
```

The first run downloads the model (~80MB), but after that, it's completely local and free! The embeddings are 384-dimensional vectors that capture the semantic meaning of the text.

## 5. Vector Search → Relevant Chunks

**Input:** User question + all stored embeddings
**Output:** Top N most relevant chunks

When a user asks a question, we:
1. Convert their question to an embedding (same model)
2. Calculate cosine similarity with all stored embeddings
3. Return the top 5 most similar chunks

```typescript
// Calculate cosine similarity
const similarity = this.cosineSimilarity(queryEmbedding, chunkEmbedding);

// Sort by similarity and take top 5
const relevantChunks = chunks
  .sort((a, b) => b.similarity - a.similarity)
  .slice(0, 5);
```

Cosine similarity is perfect for this because normalized vectors make the calculation simple and fast. For my use case (small-scale, single user), this is more than sufficient.

## 6. LLM Generation → Final Answer

**Input:** User question + relevant chunks (context)
**Output:** Natural language answer

Finally, we send everything to a language model. I use OpenRouter with the free Llama 3.2 3B model:

```typescript
const messages = [
  {
    role: 'system',
    content: 'You are a helpful assistant. Answer based on the provided context.'
  },
  {
    role: 'user',
    content: `Context:\n${relevantChunks.join('\n\n')}\n\nQuestion: ${question}`
  }
];

const response = await openRouterChat.chat.completions.create({
  model: 'meta-llama/llama-3.2-3b-instruct:free',
  messages,
});
```

The model reads the context and generates an answer. Because we provided relevant chunks, it can answer questions about content it was never trained on!

# My Technical Choices

## Why Transformers.js?

I initially tried using OpenAI's embeddings API, but that would require users to have an API key and pay for usage. The whole point of this project was to be as self-hostable as possible.

Transformers.js lets you run actual machine learning models in Node.js using ONNX Runtime. The `all-MiniLM-L6-v2` model is:
- Small enough to run on modest hardware (~80MB)
- Fast enough for real-time use
- Accurate enough for semantic search
- Completely free and local

The downside? It's not as powerful as OpenAI's `text-embedding-3-large`, but for 99% of use cases, it's more than sufficient.

## Why OpenRouter with Llama?

For the actual chat completion, I needed an LLM. I could have used:
- **OpenAI GPT-4**: Too expensive for an open-source demo
- **Anthropic Claude**: Also expensive
- **Local LLM (Ollama)**: Requires significant RAM/GPU

OpenRouter is brilliant because it's an API gateway to hundreds of models. More importantly, they offer free models! I use `meta-llama/llama-3.2-3b-instruct:free` which is:
- Completely free (no credits needed)
- Fast enough for real-time chat
- Good quality for a 3B parameter model

Yes, it's not as good as GPT-4 or Claude 3.5 Sonnet, but it's free and accessible to everyone. If you have credits, you can easily switch to a better model by changing one line of code.

## Why Not FAISS or pgvector?

For vector search, I use simple cosine similarity in memory. More sophisticated solutions exist:
- **FAISS**: Facebook's library for efficient similarity search
- **pgvector**: PostgreSQL extension for vector operations
- **Pinecone/Weaviate**: Dedicated vector databases

Why didn't I use them? For my scale (hundreds to thousands of chunks per website), the simple approach is actually faster! Loading everything into memory and calculating cosine similarity takes milliseconds.

I would switch to FAISS if I was dealing with millions of vectors, but that's not the case here. Sometimes the simple solution is the best solution.

For [tubetotext.com](https://tubetotext.com), my production app, I actually use FAISS. When you're dealing with thousands of users and millions of embeddings, FAISS's performance and efficiency become essential. But for this open-source demo? Keep it simple!

# What I'd Do Differently with More Resources

If I had a powerful GPU and more RAM, here's what I'd change:

## 1. Local LLM with Ollama

Instead of using OpenRouter, I'd run Llama 3.1 70B locally with Ollama. The quality would be significantly better, and it would be truly self-hosted. But running a 70B model requires at least 40GB of RAM (or VRAM with GPU acceleration).

```bash
# With a beefy machine:
ollama run llama3.1:70b
```

## 2. Better Embedding Models

The `all-MiniLM-L6-v2` model is good, but I'd upgrade to:
- **all-mpnet-base-v2**: Better quality, still only 420MB
- **instructor-xl**: Specifically trained for retrieval tasks
- Or even OpenAI's `text-embedding-3-large` if cost wasn't a concern

## 3. Hybrid Search

Combine vector search with traditional keyword search (BM25). This gives you the best of both worlds:
- Vector search for semantic similarity
- Keyword search for exact term matches

## 4. Reranking

After retrieving candidates with vector search, use a cross-encoder model to rerank them. This significantly improves relevance but requires more compute.

## 5. Streaming Responses

Currently, the response arrives all at once. With more time, I'd implement streaming so users see the answer being generated in real-time, like ChatGPT.

# Conclusion

Building this RAG system taught me so much about modern AI infrastructure. The ecosystem has matured to the point where you can build sophisticated AI applications without breaking the bank.

Yes, it requires some technical knowledge. Yes, the quality isn't quite as good as paid services. But it's yours! Your data stays on your server, you can modify it however you want, and you learn a ton in the process.

The entire project is open-source and available on GitHub. If you're interested in self-hosting AI or just want to understand how RAG works under the hood, I encourage you to check it out and experiment with it.

And who knows? Maybe one day we'll all be running our own AI assistants on our home servers, just like we can now run our own Nextcloud, Bitwarden, or VPN servers. The future of AI doesn't have to be centralized!

Until next time, and thanks for reading this far!
