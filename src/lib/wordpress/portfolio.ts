/**
 * Portfolio module for WordPress REST API
 * Handles all portfolio-related API functions
 */

import { WPPortfolioItem, FeaturedMedia } from '@/types/wordpress';
import { fetchWordPress } from './api';
import { extractImagesFromContent } from './content-utils';

export { extractImagesFromContent } from './content-utils';

export async function getPortfolioItems(
  perPage: number = 12,
  page: number = 1,
  lang?: string
): Promise<WPPortfolioItem[]> {
  try {
    const portfolio = await fetchWordPress<WPPortfolioItem[]>('/portfolio', {
      _embed: true,
      per_page: perPage,
      page,
      orderby: 'date',
      order: 'desc',
      ...(lang ? { lang } : {}),
    }, { suppressErrorLogging: true });
    return Array.isArray(portfolio) ? portfolio : [];
  } catch (error) {
    console.error('Error fetching portfolio items:', error);
    return [];
  }
}

export async function getPortfolioNeighbors(slug: string, lang?: string): Promise<{
  previous: { slug: string; title: string; thumbnailUrl: string | null; thumbnailAlt?: string } | null;
  next: { slug: string; title: string; thumbnailUrl: string | null; thumbnailAlt?: string } | null;
}> {
  const items = await getPortfolioItems(100, 1, lang).catch(() => []);
  const index = items.findIndex((p) => p.slug === slug);
  if (index === -1) return { previous: null, next: null };

  const prevItem = index > 0 ? items[index - 1] : null;
  const nextItem = index < items.length - 1 && index >= 0 ? items[index + 1] : null;

  const toNavItem = (p: WPPortfolioItem) => {
    const featured = p._embedded?.['wp:featuredmedia']?.[0];
    const title = p.title?.rendered?.replace(/<[^>]*>/g, '').trim() || 'Untitled';
    return {
      slug: p.slug,
      title,
      thumbnailUrl: featured?.source_url ?? null,
      thumbnailAlt: featured?.alt_text ?? title,
    };
  };

  return {
    previous: prevItem ? toNavItem(prevItem) : null,
    next: nextItem ? toNavItem(nextItem) : null,
  };
}

export async function getPortfolioItemBySlug(slug: string, lang?: string): Promise<WPPortfolioItem | null> {
  try {
    const portfolio = await fetchWordPress<WPPortfolioItem[]>('/portfolio', {
      slug,
      _embed: true,
      ...(lang ? { lang } : {}),
    });
    if (portfolio.length > 1) {
      console.warn(`Multiple portfolio items found for slug '${slug}':`, portfolio.map(p => p.id));
    }
    return portfolio.length > 0 ? portfolio[0] : null;
  } catch (error) {
    console.error(`Error fetching portfolio item by slug '${slug}':`, error);
    return null;
  }
}

export async function getPortfolioAttachments(postId: number): Promise<FeaturedMedia[]> {
  try {
    return await fetchWordPress<FeaturedMedia[]>('/media', {
      parent: postId,
      per_page: 20,
      orderby: 'date',
      order: 'asc',
    });
  } catch (error) {
    console.error(`Error fetching attachments for portfolio item ${postId}:`, error);
    return [];
  }
}
