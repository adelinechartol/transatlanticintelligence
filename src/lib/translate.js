import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Google Cloud Translation API (v2, API key auth): https://cloud.google.com/translate/docs/reference/rest/v2/translate
const API_URL = 'https://translation.googleapis.com/language/translate2';
const CACHE_PATH = path.resolve('src/data/translation-cache.json');

let cache;
let cacheDirty = false;

async function loadCache() {
  if (cache) return cache;
  try {
    cache = JSON.parse(await readFile(CACHE_PATH, 'utf-8'));
  } catch {
    cache = {};
  }
  return cache;
}

// Cache translations by content hash so repeat builds (e.g. on every Cloudflare
// deploy) don't re-translate unchanged posts and burn API quota.
function cacheKey(text, format, target) {
  return createHash('sha256').update(`${target}:${format}:${text}`).digest('hex');
}

export async function translate(text, { format = 'text', target = 'fr', logger } = {}) {
  if (!text) return text;

  const apiKey = import.meta.env.GOOGLE_TRANSLATE_API_KEY ?? process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    logger?.warn('GOOGLE_TRANSLATE_API_KEY is not set — skipping translation, falling back to English.');
    return text;
  }

  const store = await loadCache();
  const key = cacheKey(text, format, target);
  if (store[key]) return store[key];

  try {
    const res = await fetch(`${API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, target, format, source: 'en' }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);

    const json = await res.json();
    const translated = json.data?.translations?.[0]?.translatedText;
    if (!translated) throw new Error('No translation in response');

    store[key] = translated;
    cacheDirty = true;
    return translated;
  } catch (err) {
    logger?.error(`Translation failed, falling back to English: ${err.message}`);
    return text;
  }
}

export async function flushTranslationCache() {
  if (!cacheDirty || !cache) return;
  await mkdir(path.dirname(CACHE_PATH), { recursive: true });
  await writeFile(CACHE_PATH, JSON.stringify(cache, null, 2) + '\n');
  cacheDirty = false;
}
