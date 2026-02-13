/**
 * Portfolio module for WordPress REST API
 * Handles all portfolio-related API functions
 */

import { WPPortfolioItem, FeaturedMedia } from '@/types/wordpress';
import { fetchWordPress } from './api';
import { extractImagesFromContent } from './content-utils';

export { extractImagesFromContent } from './content-utils';

/**
 * Get all portfolio items with pagination
 * @param perPage - Number of items per page (default: 12)
 * @param page - Page number (default: 1)
 */
export async function getPortfolioItems(
    perPage: number = 12,
    page: number = 1
): Promise<WPPortfolioItem[]> {
    try {
        const portfolio = await fetchWordPress<WPPortfolioItem[]>('/portfolio', {
            _embed: true,
            per_page: perPage,
            page,
            orderby: 'date',
            order: 'desc',
        }, { suppressErrorLogging: true }); // 404 if CPT not registered; live backend may have 0 items until migrated
        return Array.isArray(portfolio) ? portfolio : [];
    } catch (error) {
        console.error('Error fetching portfolio items:', error);
        return [];
    }
}

/**
 * Get previous and next portfolio items by current slug (same order as list: date desc).
 * Returns thumbnails from featured media for use in post navigation.
 */
export async function getPortfolioNeighbors(slug: string): Promise<{
  previous: { slug: string; title: string; thumbnailUrl: string | null; thumbnailAlt?: string } | null;
  next: { slug: string; title: string; thumbnailUrl: string | null; thumbnailAlt?: string } | null;
}> {
  const items = await getPortfolioItems(100, 1).catch(() => []);
  const index = items.findIndex((p) => p.slug === slug);
  if (index === -1)
    return { previous: null, next: null };

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

/**
 * Get a single portfolio item by slug
 * @param slug - Portfolio item slug
 */
export async function getPortfolioItemBySlug(slug: string): Promise<WPPortfolioItem | null> {
    try {
        const portfolio = await fetchWordPress<WPPortfolioItem[]>('/portfolio', {
            slug,
            _embed: true,
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

/**
 * Get all image attachments for a portfolio item
 * @param postId - The portfolio post ID
 */
export async function getPortfolioAttachments(postId: number): Promise<FeaturedMedia[]> {
    try {
        const attachments = await fetchWordPress<FeaturedMedia[]>('/media', {
            parent: postId,
            per_page: 20,
            orderby: 'date',
            order: 'asc',
        });
        return attachments;
    } catch (error) {
        console.error(`Error fetching attachments for portfolio item ${postId}:`, error);
        return [];
    }
}

