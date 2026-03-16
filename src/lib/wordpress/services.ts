/**
 * Services module for WordPress REST API
 * Handles all service-related API functions
 */

import { WPServiceItem, FeaturedMedia, ACFImage } from '@/types/wordpress';
import { fetchWordPress } from './api';
import { getServiceIconUrl } from '@/lib/service-icons';

const SERVICES_PAGE_SIZE = 100;

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
