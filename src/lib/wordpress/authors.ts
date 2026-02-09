/**
 * Authors module for WordPress REST API
 * Handles all author-related API functions
 */

import { Author } from '@/types/wordpress';
import { fetchWordPress } from './api';

/**
 * Get all authors with pagination
 * @param perPage - Number of authors per page (default: 10)
 * @param page - Page number (default: 1)
 */
export async function getAuthors(
  perPage: number = 10,
  page: number = 1
): Promise<Author[]> {
  try {
    const authors = await fetchWordPress<Author[]>('/users', {
      per_page: perPage,
      page,
    });
    return authors;
  } catch (error) {
    console.error('Error fetching authors:', error);
    return [];
  }
}

/**
 * Get a single author by ID
 * @param id - Author ID
 */
export async function getAuthorById(id: number): Promise<Author | null> {
  try {
    const author = await fetchWordPress<Author>(`/users/${id}`);
    return author;
  } catch (error) {
    console.error(`Error fetching author by ID '${id}':`, error);
    return null;
  }
}

/**
 * Get a single author by slug
 * @param slug - Author slug
 */
export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  try {
    const authors = await fetchWordPress<Author[]>('/users', {
      slug,
    });
    return authors.length > 0 ? authors[0] : null;
  } catch (error) {
    console.error(`Error fetching author by slug '${slug}':`, error);
    return null;
  }
}

/**
 * Get posts by a specific author
 * @param authorId - Author ID
 * @param perPage - Number of posts per page (default: 10)
 * @param page - Page number (default: 1)
 */
export async function getPostsByAuthor(
  authorId: number,
  perPage: number = 10,
  page: number = 1
): Promise<import('@/types/wordpress').WPPost[]> {
  try {
    const posts = await fetchWordPress<import('@/types/wordpress').WPPost[]>('/posts', {
      author: authorId,
      _embed: true,
      per_page: perPage,
      page,
      orderby: 'date',
      order: 'desc',
    });
    return posts;
  } catch (error) {
    console.error(`Error fetching posts by author '${authorId}':`, error);
    return [];
  }
}
