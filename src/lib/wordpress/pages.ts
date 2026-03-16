/**
 * Pages module for WordPress REST API
 * Handles all page-related API functions
 */

import { WPPage } from '@/types/wordpress';
import { fetchWordPress } from './api';

export async function getPages(
  perPage: number = 10,
  page: number = 1,
  lang?: string
): Promise<WPPage[]> {
  try {
    return await fetchWordPress<WPPage[]>('/pages', {
      _embed: true,
      per_page: perPage,
      page,
      orderby: 'menu_order',
      order: 'asc',
      ...(lang ? { lang } : {}),
    });
  } catch (error) {
    console.error('Error fetching pages:', error);
    return [];
  }
}

export async function getPageBySlug(slug: string, lang?: string): Promise<WPPage | null> {
  try {
    const pages = await fetchWordPress<WPPage[]>('/pages', {
      slug,
      _embed: true,
      ...(lang ? { lang } : {}),
    });
    return pages.length > 0 ? pages[0] : null;
  } catch (error) {
    console.error(`Error fetching page by slug '${slug}':`, error);
    return null;
  }
}

/**
 * Get the homepage content.
 * Tries, in order: (1) WP static front page endpoint, (2) slug "homepage", (3) slug "home".
 */
export async function getHomePage(opts?: { lang?: string }): Promise<WPPage | null> {
  const lang = opts?.lang;
  try {
    const res = await fetchWordPress<{ id: number }>('/front-page', undefined, {
      suppressErrorLogging: true,
    });
    if (res?.id) {
      const p = await getPageById(res.id, lang);
      if (p) return p;
    }
  } catch {
    // No front-page endpoint; fall through to slug look-ups
  }
  const byHomepage = await getPageBySlug('homepage', lang);
  if (byHomepage) return byHomepage;
  return getPageBySlug('home', lang);
}

export async function getPageById(id: number, lang?: string): Promise<WPPage | null> {
  try {
    return await fetchWordPress<WPPage>(`/pages/${id}`, {
      _embed: true,
      ...(lang ? { lang } : {}),
    });
  } catch (error) {
    console.error(`Error fetching page by ID '${id}':`, error);
    return null;
  }
}

/** Legal page item for footer links */
export interface LegalPageItem {
  title: string;
  slug: string;
  link: string;
}

const DEFAULT_LEGAL_SLUGS = [
  'impressum',
  'imprint',
  'impress',
  'privacy-policy',
  'privacy-policy-2',
  'privacy',
  'policy',
  'policies',
  'datenschutz',
  'cookies',
  'cookie-policy',
  'cookie-policy-2',
  'cookie',
  'terms',
  'terms-of-service',
];

export async function getLegalPages(
  slugs: string[] = DEFAULT_LEGAL_SLUGS,
  lang?: string
): Promise<LegalPageItem[]> {
  const seen = new Set<string>();
  const results: LegalPageItem[] = [];
  for (const slug of slugs) {
    if (seen.has(slug)) continue;
    try {
      const page = await getPageBySlug(slug, lang);
      if (page?.slug && page?.title?.rendered) {
        if (seen.has(page.slug)) continue;
        seen.add(page.slug);
        const title = page.title.rendered.replace(/<[^>]*>/g, '').trim();
        results.push({
          title: title || page.slug,
          slug: page.slug,
          link: `/${page.slug}`,
        });
      }
    } catch {
      // Skip missing slugs
    }
  }
  return results;
}
