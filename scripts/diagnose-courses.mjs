#!/usr/bin/env node
/**
 * Diagnose why Course posts are not fetched from WordPress.
 * Checks: REST types (course CPT), /courses and /course endpoints, and suggests fixes.
 *
 * Usage: node scripts/diagnose-courses.mjs
 * Reads backend URL from .env.local (WORDPRESS_API_URL) or conf/start.md (backend:).
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

function getBackendUrl() {
  const envPath = join(rootDir, '.env.local');
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf8');
    const m = content.match(/^\s*WORDPRESS_API_URL\s*=\s*(.+?)\s*$/m);
    if (m) {
      const url = m[1].replace(/^["']|["']$/g, '').trim().replace(/\/+$/, '');
      if (url) return url;
    }
  }
  const startPath = join(rootDir, 'conf', 'start.md');
  if (existsSync(startPath)) {
    const content = readFileSync(startPath, 'utf8').replace(/\r\n/g, '\n');
    const sameLine = content.match(/backend:\s*(https?:\/\/[^\s#\n]+)/i);
    if (sameLine) return sameLine[1].trim().replace(/\/+$/, '');
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (/^backend:\s*$/i.test(lines[i].trim())) {
        for (let j = i + 1; j < lines.length; j++) {
          const v = lines[j].trim();
          if (v && !v.startsWith('#') && /^https?:\/\//i.test(v)) return v.replace(/\/+$/, '');
        }
        break;
      }
    }
  }
  return null;
}

async function fetchJson(url) {
  try {
    const res = await fetch(url, { redirect: 'follow' });
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (_) {
      data = { _raw: text.slice(0, 200) };
    }
    return { ok: res.ok, status: res.status, data };
  } catch (e) {
    return { ok: false, status: 0, data: null, error: e.message };
  }
}

async function run() {
  const base = getBackendUrl();
  if (!base) {
    console.error('Could not find backend URL. Set WORDPRESS_API_URL in .env.local or add backend: in conf/start.md');
    process.exit(1);
  }

  console.log('--- Courses API diagnosis ---');
  console.log('Backend:', base);
  console.log('');

  const typesUrl = `${base}/wp-json/wp/v2/types`;
  const typesRes = await fetchJson(typesUrl);
  if (!typesRes.ok) {
    console.log('1. REST types (wp/v2/types): FAIL', typesRes.status, typesRes.error || '');
    if (typesRes.data?.message) console.log('   Message:', typesRes.data.message);
    console.log('');
  } else {
    const types = typesRes.data || {};
    const courseType = types.course;
    const hasCourses = Object.prototype.hasOwnProperty.call(types, 'course');
    console.log('1. REST types: OK');
    console.log('   Registered post types:', Object.keys(types).join(', '));
    if (hasCourses) {
      const restBase = courseType?.rest_base ?? '(default)';
      console.log('   Course CPT: present, rest_base =', restBase);
    } else {
      console.log('   Course CPT: NOT REGISTERED in REST API.');
      console.log('   → Add show_in_rest => true (and optionally rest_base => "courses") where you register the "course" post type.');
    }
    console.log('');
  }

  for (const endpoint of ['/courses', '/course']) {
    const url = `${base}/wp-json/wp/v2${endpoint}?per_page=1&_embed=true`;
    const res = await fetchJson(url);
    const label = endpoint === '/courses' ? '2a' : '2b';
    const status = res.ok ? `OK (${res.status})` : `FAIL (${res.status})`;
    console.log(`${label}. GET wp/v2${endpoint}: ${status}`);
    if (res.ok && Array.isArray(res.data)) {
      console.log('   Items returned:', res.data.length);
      if (res.data.length > 0) {
        const first = res.data[0];
        console.log('   First item id:', first.id, 'slug:', first.slug);
      }
    } else if (!res.ok && res.data) {
      if (res.data.code) console.log('   Code:', res.data.code);
      if (res.data.message) console.log('   Message:', res.data.message);
    }
    console.log('');
  }

  console.log('--- Next steps ---');
  console.log('If Course CPT is missing: see WORDPRESS_CONTENT_CHECKLIST.md §6 (expose CPT to REST, rest_base, publish a course, resave permalinks).');
  console.log('If both endpoints return 404: ensure show_in_rest => true and resave Settings → Permalinks in WordPress.');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
