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

/** Default social profile URLs when not provided by WordPress */
export const DEFAULT_SOCIAL_URLS: Record<string, string> = {
  linkedin: 'https://www.linkedin.com/in/felixseeger',
  twitter: 'https://x.com/felixseeger',
  github: 'https://github.com/felixseeger',
  instagram: 'https://www.instagram.com/felixseeger',
  facebook: 'https://www.facebook.com/felixseeger',
};

export const SITE_NAME = 'Felix Seeger';
