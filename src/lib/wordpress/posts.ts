/**
 * Posts module for WordPress REST API
 * Handles all post-related API functions
 */

import { WPPost, WPCategory } from '@/types/wordpress';
import { fetchWordPress } from './api';

export async function getPosts(
  perPage: number = 10,
  page: number = 1,
  lang?: string
): Promise<WPPost[]> {
  try {
    return await fetchWordPress<WPPost[]>('/posts', {
      _embed: true,
      per_page: perPage,
      page,
      orderby: 'date',
      order: 'desc',
      ...(lang ? { lang } : {}),
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export async function getPostBySlug(slug: string, lang?: string): Promise<WPPost | null> {
  try {
    const posts = await fetchWordPress<WPPost[]>('/posts', {
      slug,
      _embed: true,
      ...(lang ? { lang } : {}),
    });
    return posts.length > 0 ? posts[0] : null;
  } catch (error) {
    console.error(`Error fetching post by slug '${slug}':`, error);
    return null;
  }
}

export async function getPostsByCategory(
  categorySlug: string,
  perPage: number = 10,
  page: number = 1,
  lang?: string
): Promise<WPPost[]> {
  try {
    const categories = await fetchWordPress<WPCategory[]>('/categories', {
      slug: categorySlug,
      ...(lang ? { lang } : {}),
    });

    if (categories.length === 0) {
      console.warn(`Category not found: ${categorySlug}`);
      return [];
    }

    const categoryId = categories[0].id;

    const posts = await fetchWordPress<WPPost[]>('/posts', {
      categories: categoryId,
      _embed: true,
      per_page: perPage,
      page,
      orderby: 'date',
      order: 'desc',
      ...(lang ? { lang } : {}),
    });

    return posts;
  } catch (error) {
    console.error(`Error fetching posts for category '${categorySlug}':`, error);
    return [];
  }
}
