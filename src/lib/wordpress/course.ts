/**
 * Course module for WordPress REST API
 * Handles course CPT and sales page ACF data.
 * Tries both /courses and /course so it works regardless of WordPress rest_base.
 */

import { WPCourseItem } from '@/types/wordpress';
import { fetchWordPress } from './api';

const COURSE_ENDPOINTS = ['/courses', '/course'] as const;
const opts404 = { suppressErrorLogging: true, returnUndefinedOn404: true };

async function fetchCourseEndpoint<T>(
  endpoint: string,
  params: Record<string, string | number | boolean | undefined>
): Promise<T | undefined> {
  return fetchWordPress<T | undefined>(endpoint, params, opts404);
}

/**
 * Get all course items with pagination.
 * Tries /courses then /course so it works with either WordPress rest_base.
 */
export async function getCourses(perPage: number = 12, page: number = 1): Promise<WPCourseItem[]> {
  const params = {
    _embed: true,
    per_page: perPage,
    page,
    orderby: 'date',
    order: 'desc',
  };
  for (const endpoint of COURSE_ENDPOINTS) {
    const courses = await fetchCourseEndpoint<WPCourseItem[]>(endpoint, params);
    if (Array.isArray(courses)) return courses;
  }
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '[Courses] Both /courses and /course returned no data. Run: node scripts/diagnose-courses.mjs — see WORDPRESS_CONTENT_CHECKLIST.md §6.'
    );
  }
  return [];
}

/**
 * Get a single course by slug.
 * Tries /courses then /course to match the endpoint used by getCourses.
 */
export async function getCourseBySlug(slug: string): Promise<WPCourseItem | null> {
  const params = { slug, _embed: true };
  for (const endpoint of COURSE_ENDPOINTS) {
    const courses = await fetchCourseEndpoint<WPCourseItem[]>(endpoint, params);
    if (Array.isArray(courses)) {
      if (courses.length > 1) {
        console.warn(`Multiple courses found for slug '${slug}':`, courses.map((c) => c.id));
      }
      return courses.length > 0 ? courses[0] : null;
    }
  }
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      `[Courses] No course for slug '${slug}' (both endpoints failed). Run: node scripts/diagnose-courses.mjs — see WORDPRESS_CONTENT_CHECKLIST.md §6.`
    );
  }
  return null;
}

/**
 * Get previous and next courses by current slug (date desc order).
 */
export async function getCourseNeighbors(slug: string): Promise<{
  previous: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}> {
  const items = await getCourses(100, 1).catch(() => []);
  const index = items.findIndex((c) => c.slug === slug);
  if (index === -1) return { previous: null, next: null };

  const prevItem = index > 0 ? items[index - 1] : null;
  const nextItem = index < items.length - 1 && index >= 0 ? items[index + 1] : null;
  const toTitle = (c: WPCourseItem) => c.title?.rendered?.replace(/<[^>]*>/g, '').trim() || 'Course';

  return {
    previous: prevItem ? { slug: prevItem.slug, title: toTitle(prevItem) } : null,
    next: nextItem ? { slug: nextItem.slug, title: toTitle(nextItem) } : null,
  };
}
