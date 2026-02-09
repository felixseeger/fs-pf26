/**
 * Posts module for WordPress REST API
 * Handles all post-related API functions
 */

import { WPPost, WPCategory } from '@/types/wordpress';
import { fetchWordPress, QueryParams } from './api';

/**
 * Get all posts with pagination
 * @param perPage - Number of posts per page (default: 10)
 * @param page - Page number (default: 1)
 */
export async function getPosts(
  perPage: number = 10,
  page: number = 1
): Promise<WPPost[]> {
  try {
    const posts = await fetchWordPress<WPPost[]>('/posts', {
      _embed: true,
      per_page: perPage,
      page,
      orderby: 'date',
      order: 'desc',
    });
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

/**
 * Get a single post by slug
 * @param slug - Post slug
 */
export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  try {
    const posts = await fetchWordPress<WPPost[]>('/posts', {
      slug,
      _embed: true,
    });
    return posts.length > 0 ? posts[0] : null;
  } catch (error) {
    console.error(`Error fetching post by slug '${slug}':`, error);
    return null;
  }
}

/**
 * Get posts by category
 * @param categorySlug - The slug of the category
 * @param perPage - Number of posts per page (default: 10)
 * @param page - Page number (default: 1)
 */
export async function getPostsByCategory(
  categorySlug: string,
  perPage: number = 10,
  page: number = 1
): Promise<WPPost[]> {
  try {
    // First, get the category ID from slug
    const categories = await fetchWordPress<WPCategory[]>('/categories', {
      slug: categorySlug,
    });

    if (categories.length === 0) {
      console.warn(`Category not found: ${categorySlug}`);
      return [];
    }

    const categoryId = categories[0].id;

    // Fetch posts for this category
    const posts = await fetchWordPress<WPPost[]>('/posts', {
      categories: categoryId,
      _embed: true,
      per_page: perPage,
      page,
      orderby: 'date',
      order: 'desc',
    });

    console.log(`Fetched ${posts.length} posts for category '${categorySlug}'`);
    return posts;
  } catch (error) {
    console.error(`Error fetching posts for category '${categorySlug}':`, error);
    return [];
  }
}
