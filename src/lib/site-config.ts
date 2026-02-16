/**
 * Site-wide config for SEO, canonicals, and social.
 * NEXT_PUBLIC_SITE_URL should be set in .env (e.g. https://felixseeger.de).
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://felixseeger.de');

export function getSiteUrl(): string {
  return SITE_URL.replace(/\/$/, '');
}

export function getCanonicalUrl(path: string): string {
  const base = getSiteUrl();
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

/**
 * Hostnames treated as internal (convert to pathname for frontend routing).
 * Compares hostnames only (ignoring protocol) so http/https mismatches don't matter.
 * Also derives the base domain from subdomains to catch WordPress "Site Address" URLs.
 * e.g. fs26-back.felixseeger.de → also adds felixseeger.de
 */
function getInternalHostnames(): string[] {
  const hostnames: string[] = [];
  const urls = [
    process.env.NEXT_PUBLIC_WORDPRESS_API_URL,
    process.env.WORDPRESS_API_URL,
    process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL,
    process.env.WORDPRESS_SITE_URL,
    getSiteUrl(),
  ].filter(Boolean) as string[];
  for (const u of urls) {
    try {
      const hostname = new URL(u.replace(/\/+$/, '')).hostname.toLowerCase();
      if (hostname && !hostnames.includes(hostname)) hostnames.push(hostname);
      // Derive base domain (e.g. fs26-back.felixseeger.de → felixseeger.de)
      const parts = hostname.split('.');
      if (parts.length > 2) {
        const baseDomain = parts.slice(-2).join('.');
        if (baseDomain && !hostnames.includes(baseDomain)) hostnames.push(baseDomain);
      }
    } catch {
      // skip invalid URLs
    }
  }
  return hostnames;
}

/** WordPress language prefixes to strip from paths (e.g. /en/impressum → /impressum) */
const WP_LANG_PREFIXES = /^\/(?:en|de|fr|es|it|nl|pt|ru|ja|zh|ko|ar|tr|pl)\//i;

/**
 * Convert a WordPress/site URL to a frontend href.
 * Strips origin for internal links so Next.js routing works.
 * Also strips WordPress language prefixes (e.g. /en/).
 */
export function toFrontendHref(url: string): { href: string; external: boolean } {
  if (typeof url !== 'string' || !url.trim()) {
    return { href: '/', external: false };
  }
  const trimmed = url.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    const cleaned = trimmed.replace(WP_LANG_PREFIXES, '/');
    return { href: cleaned, external: false };
  }
  try {
    const u = new URL(trimmed);
    const internalHostnames = getInternalHostnames();
    const hostname = u.hostname.toLowerCase();
    if (internalHostnames.includes(hostname)) {
      const path = (u.pathname || '/').replace(WP_LANG_PREFIXES, '/');
      return { href: path, external: false };
    }
    return { href: trimmed, external: true };
  } catch {
    return { href: trimmed.startsWith('http') ? trimmed : `/${trimmed}`, external: trimmed.startsWith('http') };
  }
}

/** Default social profile URLs when not provided by WordPress */
export const DEFAULT_SOCIAL_URLS: Record<string, string> = {
  linkedin: 'https://www.linkedin.com/in/felixseeger',
  twitter: 'https://x.com/felixseeger',
  github: 'https://github.com/felixseeger',
  instagram: 'https://www.instagram.com/felixseeger',
  facebook: 'https://www.facebook.com/felixseeger',
};

export const SITE_NAME = 'Felix Seeger';
