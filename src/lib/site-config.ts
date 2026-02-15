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
 * Origins treated as internal (convert to pathname for frontend routing).
 * WordPress menu URLs may use backend API URL, Site URL, or frontend URL.
 */
function getInternalOrigins(): string[] {
  const origins: string[] = [];
  const urls = [
    process.env.NEXT_PUBLIC_WORDPRESS_API_URL,
    process.env.WORDPRESS_API_URL,
    process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL,
    process.env.WORDPRESS_SITE_URL,
    getSiteUrl(),
  ].filter(Boolean) as string[];
  for (const u of urls) {
    try {
      const origin = new URL(u.replace(/\/+$/, '')).origin;
      if (origin && !origins.includes(origin)) origins.push(origin);
    } catch {
      // skip invalid URLs
    }
  }
  return origins;
}

/**
 * Convert a WordPress/site URL to a frontend href.
 * Strips origin for internal links so Next.js routing works.
 */
export function toFrontendHref(url: string): { href: string; external: boolean } {
  if (typeof url !== 'string' || !url.trim()) {
    return { href: '/', external: false };
  }
  const trimmed = url.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return { href: trimmed, external: false };
  }
  try {
    const u = new URL(trimmed);
    const internalOrigins = getInternalOrigins();
    if (internalOrigins.includes(u.origin)) {
      const path = u.pathname || '/';
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
