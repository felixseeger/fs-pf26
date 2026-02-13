#!/usr/bin/env node
/**
 * Fetches homepage/front page from WordPress and logs footer-related fields.
 * Usage: node scripts/fetch-footer-data.mjs
 * Requires: .env.local with WORDPRESS_API_URL set (or .env.production.local for production URL).
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function loadEnv() {
  for (const file of ['.env.local', '.env.production.local', '.env']) {
    const path = join(root, file);
    if (!existsSync(path)) continue;
    const content = readFileSync(path, 'utf8');
    for (const line of content.split('\n')) {
      const m = line.match(/^\s*WORDPRESS_API_URL\s*=\s*(.+?)\s*$/);
      if (m) {
        const v = m[1].replace(/^["']|["']$/g, '').trim();
        if (v) return v.replace(/\/+$/, '');
      }
    }
  }
  return null;
}

const base = loadEnv();
if (!base) {
  console.error('WORDPRESS_API_URL not found. Set it in .env.local');
  process.exit(1);
}

const wp = `${base}/wp-json/wp/v2`;

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
  return res.json();
}

async function main() {
  console.log('WordPress API base:', base);
  let page = null;

  try {
    const front = await fetchJson(`${wp}/front-page`);
    if (front?.id) {
      console.log('Front page ID:', front.id);
      page = await fetchJson(`${base}/wp-json/wp/v2/pages/${front.id}?_embed`);
    }
  } catch (e) {
    console.log('No front-page endpoint or error:', e.message);
  }

  if (!page) {
    for (const slug of ['homepage', 'home']) {
      try {
        const list = await fetchJson(`${wp}/pages?slug=${slug}&_embed`);
        if (list?.length) {
          page = list[0];
          console.log('Using page slug:', slug, 'id:', page.id);
          break;
        }
      } catch (e) {
        console.log(`pages?slug=${slug} failed:`, e.message);
      }
    }
  }

  if (!page) {
    console.error('Could not load any homepage. Check WORDPRESS_API_URL and that a front page or "homepage"/"home" page exists.');
    process.exit(1);
  }

  const acf = page.acf ?? page.meta_box ?? {};
  const footer = {
    footer_about_title: acf.footer_about_title,
    footer_about_text: acf.footer_about_text,
    footer_connect_title: acf.footer_connect_title,
    footer_text: acf.footer_text,
    social_links: acf.social_links,
  };

  console.log('\n--- Footer fields from WordPress ---');
  console.log(JSON.stringify(footer, null, 2));
  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
