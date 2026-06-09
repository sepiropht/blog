#!/usr/bin/env node
// Creates and sends a Listmonk campaign for each newly added blog post.
// Triggered by .github/workflows/newsletter.yml on push to master.

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const {
  LISTMONK_URL,
  LISTMONK_USER,
  LISTMONK_TOKEN,
  LIST_ID = '3',
  SITE_URL = 'https://elimbi.com',
  BEFORE_SHA,
  AFTER_SHA,
  SEND_MODE = 'running', // 'running' = send immediately, 'draft' = create only
} = process.env;

if (!LISTMONK_URL || !LISTMONK_USER || !LISTMONK_TOKEN) {
  console.error('Missing LISTMONK_URL / LISTMONK_USER / LISTMONK_TOKEN env vars.');
  process.exit(1);
}

const auth = 'Basic ' + Buffer.from(`${LISTMONK_USER}:${LISTMONK_TOKEN}`).toString('base64');

async function lm(path, method = 'GET', body) {
  const res = await fetch(`${LISTMONK_URL}${path}`, {
    method,
    headers: { Authorization: auth, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${text.slice(0, 300)}`);
  return json;
}

// --- Find newly added English post files in this push ---
function addedPosts() {
  const zero = '0000000000000000000000000000000000000000';
  let range;
  if (BEFORE_SHA && BEFORE_SHA !== zero) range = `${BEFORE_SHA} ${AFTER_SHA}`;
  else range = 'HEAD~1 HEAD'; // first push / new branch fallback
  let out = '';
  try {
    // -M over the whole tree (no pathspec) so git can pair renamed files and
    // classify them as 'R'. A pathspec would hide the rename source and make
    // moved files (git mv) look like brand-new additions.
    out = execSync(`git diff -M --name-status ${range}`, { encoding: 'utf8' });
  } catch (e) {
    console.error('git diff failed:', e.message);
    return [];
  }
  return out
    .split('\n')
    .map((l) => l.split('\t'))
    .filter(([status]) => status && status[0] === 'A') // pure additions only
    .map(([, path]) => path)
    .filter((f) => /^content\/posts\/[^/]+\.md$/.test(f) && !f.endsWith('.fr.md'));
}

// --- Minimal YAML frontmatter parser (title / description / draft / slug / url) ---
function parseFrontmatter(file) {
  const raw = readFileSync(file, 'utf8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w[\w.-]*)\s*:\s*(.*)$/);
    if (!kv) continue;
    let [, key, val] = kv;
    val = val.trim().replace(/^['"]|['"]$/g, '');
    fm[key] = val;
  }
  return fm;
}

function slugFor(file, fm) {
  if (fm.slug) return fm.slug;
  if (fm.url) return fm.url.replace(/^\/+|\/+$/g, '').replace(/^posts\//, '');
  return file.split('/').pop().replace(/\.md$/, '');
}

async function waitForLive(url, attempts = 20, delayMs = 15000) {
  for (let i = 1; i <= attempts; i++) {
    try {
      const r = await fetch(url, { method: 'GET' });
      if (r.ok) return true;
    } catch {}
    if (i < attempts) await new Promise((r) => setTimeout(r, delayMs));
  }
  return false;
}

function escapeHtml(s = '') {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const posts = addedPosts();
if (posts.length === 0) {
  console.log('No newly added posts in this push. Nothing to send.');
  process.exit(0);
}
console.log('New posts:', posts.join(', '));

for (const file of posts) {
  const fm = parseFrontmatter(file);
  if (!fm) { console.log(`Skip ${file}: no frontmatter`); continue; }
  if (String(fm.draft).toLowerCase() === 'true') { console.log(`Skip ${file}: draft`); continue; }

  const title = fm.title || slugFor(file, fm);
  const description = fm.description || '';
  const url = `${SITE_URL}/posts/${slugFor(file, fm)}/`;

  console.log(`\nPost: "${title}"\n  URL: ${url}`);
  const live = await waitForLive(url);
  console.log(`  live: ${live}`);

  const body = `
<h1>${escapeHtml(title)}</h1>
${description ? `<p>${escapeHtml(description)}</p>` : ''}
<p><a href="${url}">Read the full post &rarr;</a></p>
`.trim();

  const created = await lm('/api/campaigns', 'POST', {
    name: title,
    subject: title,
    lists: [Number(LIST_ID)],
    from_email: 'Elimbi Blog <noreply@elimbi.com>',
    type: 'regular',
    content_type: 'html',
    template_id: 1,
    tags: ['blog', 'auto'],
    body,
  });
  const id = created.data.id;
  console.log(`  campaign created: id=${id}`);

  if (SEND_MODE === 'running') {
    await lm(`/api/campaigns/${id}/status`, 'PUT', { status: 'running' });
    console.log(`  campaign ${id} -> running (sending to list ${LIST_ID})`);
  } else {
    console.log(`  campaign ${id} left as draft (SEND_MODE=${SEND_MODE})`);
  }
}

console.log('\nDone.');
