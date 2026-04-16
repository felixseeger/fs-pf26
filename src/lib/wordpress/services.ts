/**
 * Services module for WordPress REST API
 * Handles all service-related API functions
 */

import { WPServiceItem, FeaturedMedia, ACFImage } from '@/types/wordpress';
import { fetchWordPress } from './api';
import { getServiceIconUrl } from '@/lib/service-icons';

const SERVICES_PAGE_SIZE = 100;

function normalizeLocale(value: string): string {
  return value.toLowerCase().replace('_', '-');
}

function matchesRequestedLocale(item: WPServiceItem, locale: string): boolean {
  const normalizedLocale = normalizeLocale(locale);

  if (item.lang) {
    const normalizedLang = normalizeLocale(item.lang);
    return (
      normalizedLang === normalizedLocale ||
      normalizedLang.startsWith(`${normalizedLocale}-`)
    );
  }

  const link = (item.link || '').toLowerCase();

  // For English we must see an explicit /en/ marker in permalink.
  // Otherwise Polylang fallback responses can leak default-language posts.
  if (normalizedLocale === 'en') {
    return link.includes('/en/');
  }

  // For default DE, accept entries without /en/ marker.
  return !link.includes('/en/');
}

export function filterServiceItemsByLocale(items: WPServiceItem[], locale: string): WPServiceItem[] {
  return items.filter((item) => matchesRequestedLocale(item, locale));
}

export async function getServiceItems(
  perPage: number = SERVICES_PAGE_SIZE,
  page: number = 1,
  lang?: string
): Promise<WPServiceItem[]> {
  try {
    const services = await fetchWordPress<WPServiceItem[]>('/services', {
      _embed: true,
      per_page: perPage,
      page,
      orderby: 'menu_order',
      order: 'asc',
      ...(lang ? { lang } : {}),
    }, { suppressErrorLogging: true });

    // Some WP/Polylang setups ignore or mishandle `lang` on custom post types.
    // If a language-scoped request returns empty, retry once without lang.
    if (lang && Array.isArray(services) && services.length === 0) {
      const fallback = await fetchWordPress<WPServiceItem[]>('/services', {
        _embed: true,
        per_page: perPage,
        page,
        orderby: 'menu_order',
        order: 'asc',
      }, { suppressErrorLogging: true });
      return Array.isArray(fallback) ? fallback : [];
    }

    return Array.isArray(services) ? services : [];
  } catch (error) {
    console.error('Error fetching service items:', error);
    return [];
  }
}

export async function getAllServiceItems(lang?: string): Promise<WPServiceItem[]> {
  const all: WPServiceItem[] = [];
  let page = 1;
  let chunk: WPServiceItem[];
  do {
    chunk = await getServiceItems(SERVICES_PAGE_SIZE, page, lang);
    all.push(...chunk);
    page++;
  } while (chunk.length === SERVICES_PAGE_SIZE);
  return all;
}

export async function getServiceItemBySlug(slug: string, lang?: string): Promise<WPServiceItem | null> {
  try {
    const services = await fetchWordPress<WPServiceItem[]>('/services', {
      slug,
      _embed: true,
      ...(lang ? { lang } : {}),
    });

    if (lang && services.length > 0) {
      const localeMatches = filterServiceItemsByLocale(services, lang);
      if (localeMatches.length > 0) {
        return localeMatches[0];
      }
    }

    // Fallback for setups where lang filtering on CPT is not reliable.
    if (lang && services.length === 0) {
      const fallback = await fetchWordPress<WPServiceItem[]>('/services', {
        slug,
        _embed: true,
      });
      const localeMatches = filterServiceItemsByLocale(fallback, lang);
      if (localeMatches.length > 1) {
        console.warn(`Multiple locale-matching service items found for slug '${slug}' (fallback):`, localeMatches.map(s => s.id));
      }
      if (localeMatches.length > 0) {
        return localeMatches[0];
      }
      if (fallback.length > 1) {
        console.warn(`Multiple service items found for slug '${slug}' (fallback):`, fallback.map(s => s.id));
      }
      return fallback.length > 0 ? fallback[0] : null;
    }

    if (services.length > 1) {
      console.warn(`Multiple service items found for slug '${slug}':`, services.map(s => s.id));
    }
    return services.length > 0 ? services[0] : null;
  } catch (error) {
    console.error(`Error fetching service item by slug '${slug}':`, error);
    return null;
  }
}

export async function getServiceNeighbors(slug: string, lang?: string): Promise<{
  previous: { slug: string; title: string; thumbnailUrl: string | null; thumbnailAlt?: string } | null;
  next: { slug: string; title: string; thumbnailUrl: string | null; thumbnailAlt?: string } | null;
}> {
  const items = await getAllServiceItems(lang).catch(() => []);
  const index = items.findIndex((s) => s.slug === slug);
  if (index === -1) return { previous: null, next: null };

  const prevItem = index > 0 ? items[index - 1] : null;
  const nextItem = index < items.length - 1 && index >= 0 ? items[index + 1] : null;

  const toNavItem = (s: WPServiceItem) => {
    const gallery = s.acf?.services_gallery;
    const wpIconUrl =
      gallery && typeof gallery === 'object' && 'url' in gallery
        ? (gallery as ACFImage).url
        : s._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null;
    const iconAlt =
      gallery && typeof gallery === 'object' && 'alt' in gallery
        ? (gallery as ACFImage).alt
        : s._embedded?.['wp:featuredmedia']?.[0]?.alt_text;
    const title = s.title?.rendered?.replace(/<[^>]*>/g, '').trim() || 'Untitled';
    const thumbnailUrl = getServiceIconUrl(s.slug, wpIconUrl) ?? null;
    return {
      slug: s.slug,
      title,
      thumbnailUrl,
      thumbnailAlt: iconAlt ?? title,
    };
  };

  return {
    previous: prevItem ? toNavItem(prevItem) : null,
    next: nextItem ? toNavItem(nextItem) : null,
  };
}

export async function getServiceAttachments(postId: number): Promise<FeaturedMedia[]> {
  try {
    return await fetchWordPress<FeaturedMedia[]>('/media', {
      parent: postId,
      per_page: 20,
      orderby: 'date',
      order: 'asc',
    });
  } catch (error) {
    console.error(`Error fetching attachments for service item ${postId}:`, error);
    return [];
  }
}
