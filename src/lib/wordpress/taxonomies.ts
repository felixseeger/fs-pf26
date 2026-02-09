/**
 * Taxonomies module for WordPress REST API
 * Handles categories and tags API functions
 */

import { WPCategory } from '@/types/wordpress';
import { fetchWordPress } from './api';

// =============================================================================
// Tag Type (not in main types file yet)
// =============================================================================

export interface WPTag {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  link: string;
}

// =============================================================================
// Categories
// =============================================================================

/**
 * Get all categories
 * @param perPage - Number of categories per page (default: 100)
 */
export async function getCategories(perPage: number = 100): Promise<WPCategory[]> {
  try {
    const categories = await fetchWordPress<WPCategory[]>('/categories', {
      per_page: perPage,
    });
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Get a single category by slug
 * @param slug - Category slug
 */
export async function getCategoryBySlug(slug: string): Promise<WPCategory | null> {
  try {
    const categories = await fetchWordPress<WPCategory[]>('/categories', {
      slug,
    });
    return categories.length > 0 ? categories[0] : null;
  } catch (error) {
    console.error(`Error fetching category by slug '${slug}':`, error);
    return null;
  }
}

/**
 * Get a single category by ID
 * @param id - Category ID
 */
export async function getCategoryById(id: number): Promise<WPCategory | null> {
  try {
    const category = await fetchWordPress<WPCategory>(`/categories/${id}`);
    return category;
  } catch (error) {
    console.error(`Error fetching category by ID '${id}':`, error);
    return null;
  }
}

// =============================================================================
// Tags
// =============================================================================

/**
 * Get all tags
 * @param perPage - Number of tags per page (default: 100)
 */
export async function getTags(perPage: number = 100): Promise<WPTag[]> {
  try {
    const tags = await fetchWordPress<WPTag[]>('/tags', {
      per_page: perPage,
    });
    return tags;
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}

/**
 * Get a single tag by slug
 * @param slug - Tag slug
 */
export async function getTagBySlug(slug: string): Promise<WPTag | null> {
  try {
    const tags = await fetchWordPress<WPTag[]>('/tags', {
      slug,
    });
    return tags.length > 0 ? tags[0] : null;
  } catch (error) {
    console.error(`Error fetching tag by slug '${slug}':`, error);
    return null;
  }
}

/**
 * Get a single tag by ID
 * @param id - Tag ID
 */
export async function getTagById(id: number): Promise<WPTag | null> {
  try {
    const tag = await fetchWordPress<WPTag>(`/tags/${id}`);
    return tag;
  } catch (error) {
    console.error(`Error fetching tag by ID '${id}':`, error);
    return null;
  }
}
