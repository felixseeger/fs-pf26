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
 * Get the homepage content (page with slug 'home')
 * Returns the page with ACF fields for sections like About, FAQ, Services, etc.
 */
export async function getHomePage(): Promise<WPPage | null> {
  return getPageBySlug('homepage');
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
