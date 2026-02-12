/**
 * Pages module for WordPress REST API
 * Handles all page-related API functions
 */

import { WPPage } from '@/types/wordpress';
import { fetchWordPress } from './api';

/**
 * Get all pages with pagination
 * @param perPage - Number of pages per page (default: 10)
 * @param page - Page number (default: 1)
 */
export async function getPages(
  perPage: number = 10,
  page: number = 1
): Promise<WPPage[]> {
  try {
    const pages = await fetchWordPress<WPPage[]>('/pages', {
      _embed: true,
      per_page: perPage,
      page,
      orderby: 'menu_order',
      order: 'asc',
    });
    return pages;
  } catch (error) {
    console.error('Error fetching pages:', error);
    return [];
  }
}

/**
 * Get a single page by slug
 * @param slug - Page slug
 */
export async function getPageBySlug(slug: string): Promise<WPPage | null> {
  try {
    const pages = await fetchWordPress<WPPage[]>('/pages', {
      slug,
      _embed: true,
    });
    return pages.length > 0 ? pages[0] : null;
  } catch (error) {
    console.error(`Error fetching page by slug '${slug}':`, error);
    return null;
  }
}

/**
 * Get the homepage content for sections (About, Services, FAQ, Contact).
 * Tries, in order: (1) WP static front page via /wp/v2/front-page, (2) slug "homepage", (3) slug "home".
 * Requires WordPress to expose front page ID (see wordpress-front-page-api.php) for (1).
 */
export async function getHomePage(): Promise<WPPage | null> {
  try {
    const res = await fetchWordPress<{ id: number }>('/front-page', undefined, {
      suppressErrorLogging: true,
    });
    if (res?.id) {
      const page = await getPageById(res.id);
      if (page) return page;
    }
  } catch {
    // No front-page endpoint or no static front page set; fall back to slugs
  }
  const byHomepage = await getPageBySlug('homepage');
  if (byHomepage) return byHomepage;
  return getPageBySlug('home');
}

/**
 * Get a page by ID
 * @param id - Page ID
 */
export async function getPageById(id: number): Promise<WPPage | null> {
  try {
    const page = await fetchWordPress<WPPage>(`/pages/${id}`, {
      _embed: true,
    });
    return page;
  } catch (error) {
    console.error(`Error fetching page by ID '${id}':`, error);
    return null;
  }
}
