#!/usr/bin/env node
/**
 * Live production environment monitoring
 * Verifies frontend is reachable and WordPress API returns data.
 * Reads URLs from conf/start.md (frontend:, backend:).
 * Exit 0 = all checks passed, 1 = one or more failed.
 * Usage: node scripts/monitor-production.mjs [--json] [--insecure]
 *   --json     Print only JSON report to stdout (for MCP/automation).
 *   --insecure Skip TLS certificate verification (use if live host uses generic cert).
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const startMd = join(rootDir, 'conf', 'start.md');

function parseStartMd() {
  if (!existsSync(startMd)) {
    return { frontend: null, backend: null };
  }
  const content = readFileSync(startMd, 'utf8').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = content.split('\n');
  const result = { frontend: null, backend: null };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const sameLineMatch = line.match(/^(frontend|backend):\s*(https?:\/\/[^\s#]+)/i);
    if (sameLineMatch) {
      const key = sameLineMatch[1].toLowerCase();
      const val = sameLineMatch[2].trim().replace(/\/+$/, '');
      if (key === 'frontend') result.frontend = val;
      if (key === 'backend') result.backend = val;
      continue;
    }
    if (/^(frontend|backend):\s*$/i.test(line)) {
      const key = line.split(':')[0].trim().toLowerCase();
      for (let j = i + 1; j < lines.length; j++) {
        const v = lines[j].trim();
        if (!v || v.startsWith('#')) continue;
        if (/^\w+:\s*$/i.test(v) || /^(frontend|backend|host|path):/i.test(v)) break;
        if (/^https?:\/\//i.test(v)) {
          const val = v.replace(/\/+$/, '');
          if (key === 'frontend') result.frontend = val;
          if (key === 'backend') result.backend = val;
          break;
        }
      }
    }
  }
  return result;
}

function normalizeUrl(url) {
  if (!url) return url;
  return url.replace(/\/+$/, '').replace(/\.$/, '');
}

async function fetchJson(url) {
  try {
    const res = await fetch(url, { redirect: 'follow' });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (e) {
    return { ok: false, status: 0, data: null, error: e.message };
  }
}

async function run() {
  const insecure = process.argv.includes('--insecure') || process.env.MONITOR_INSECURE === '1';
  if (insecure) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }
  const parsed = parseStartMd();
  const frontend = normalizeUrl(parsed.frontend);
  const backend = normalizeUrl(parsed.backend);
  const report = {
    ok: false,
    timestamp: new Date().toISOString(),
    frontend: { url: frontend, reachable: false, status: null, hasContent: false },
    backend: {
      url: backend,
      reachable: false,
      typesOk: false,
      postsCount: 0,
      homepageSource: null,
      frontPageId: null,
    },
    summary: '',
  };

  if (!frontend) {
    report.summary = 'Missing frontend URL in conf/start.md (add frontend: then URL on next line)';
    if (process.argv.includes('--json')) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.error(report.summary);
    }
    process.exit(1);
  }

  if (!backend) {
    report.summary = 'Missing backend URL in conf/start.md (add backend: http://...)';
    if (process.argv.includes('--json')) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.error(report.summary);
    }
    process.exit(1);
  }

  // 1. Frontend homepage
  const homeRes = await fetch(frontend, { redirect: 'follow' });
  report.frontend.status = homeRes.status;
  report.frontend.reachable = homeRes.ok;
  const html = await homeRes.text();
  report.frontend.hasContent =
    report.frontend.reachable &&
    (html.includes('Felix Seeger') || html.includes('id="main-content"') || html.includes('__NEXT_DATA__'));

  // 2. Backend REST API types
  const typesUrl = `${backend}/wp-json/wp/v2/types`;
  const typesRes = await fetchJson(typesUrl);
  report.backend.reachable = typesRes.ok;
  report.backend.typesOk = typesRes.ok && typesRes.data && typeof typesRes.data === 'object';

  // 3. Backend posts (ensure data is returned)
  const postsListUrl = `${backend}/wp-json/wp/v2/posts?per_page=10`;
  const postsListRes = await fetchJson(postsListUrl);
  if (postsListRes.ok && Array.isArray(postsListRes.data)) {
    report.backend.postsCount = postsListRes.data.length;
  }

  // 4. Homepage source (front-page or slug homepage/home)
  const frontPageUrl = `${backend}/wp-json/wp/v2/front-page`;
  const frontPageRes = await fetchJson(frontPageUrl);
  if (frontPageRes.ok && frontPageRes.data?.id) {
    report.backend.frontPageId = frontPageRes.data.id;
    report.backend.homepageSource = 'front-page';
  } else {
    const homePageUrl = `${backend}/wp-json/wp/v2/pages?slug=homepage&per_page=1`;
    const homePageRes = await fetchJson(homePageUrl);
    if (homePageRes.ok && Array.isArray(homePageRes.data) && homePageRes.data.length > 0) {
      report.backend.homepageSource = 'slug:homepage';
    } else {
      const homeSlugUrl = `${backend}/wp-json/wp/v2/pages?slug=home&per_page=1`;
      const homeSlugRes = await fetchJson(homeSlugUrl);
      if (homeSlugRes.ok && Array.isArray(homeSlugRes.data) && homeSlugRes.data.length > 0) {
        report.backend.homepageSource = 'slug:home';
      } else {
        report.backend.homepageSource = 'none';
      }
    }
  }

  report.ok =
    report.frontend.reachable &&
    report.frontend.hasContent &&
    report.backend.reachable &&
    report.backend.typesOk;

  const issues = [];
  if (!report.frontend.reachable) issues.push(`Frontend ${frontend} not reachable (${report.frontend.status})`);
  if (!report.frontend.hasContent) issues.push('Frontend page missing expected content');
  if (!report.backend.reachable) issues.push(`Backend ${backend} not reachable`);
  if (!report.backend.typesOk) issues.push('WordPress REST API types not available');
  if (report.backend.homepageSource === 'none') {
    issues.push(
      'WordPress has no homepage source: set static front page (Settings → Reading) and add wordpress-front-page-api.php, or create a page with slug "homepage" or "home"'
    );
  }
  report.issues = issues;
  report.summary = report.ok
    ? 'OK: Frontend and backend reachable; WordPress data available.'
    : issues.length
      ? issues.join('; ')
      : 'Checks completed with warnings.';

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log('--- Production monitor ---');
    console.log('Frontend:', report.frontend.url, report.frontend.reachable ? 'OK' : 'FAIL', `(${report.frontend.status})`);
    console.log('  Has content:', report.frontend.hasContent ? 'yes' : 'no');
    console.log('Backend:', report.backend.url, report.backend.reachable ? 'OK' : 'FAIL');
    console.log('  REST types:', report.backend.typesOk ? 'OK' : 'FAIL');
    console.log('  Homepage source:', report.backend.homepageSource ?? 'unknown');
    if (report.issues.length) {
      console.log('Issues:');
      report.issues.forEach((i) => console.log('  -', i));
    }
    console.log('---', report.summary);
  }

  process.exit(report.ok ? 0 : 1);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
