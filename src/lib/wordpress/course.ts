/**
 * Course module for WordPress REST API
 * Handles course CPT and sales page ACF data.
 * Tries both /courses and /course so it works regardless of WordPress rest_base.
 */

import { WPCourseItem, ACFImage, FeaturedMedia } from '@/types/wordpress';
import { fetchWordPress } from './api';

const COURSE_ENDPOINTS = ['/courses', '/course'] as const;
const opts404 = { suppressErrorLogging: true, returnUndefinedOn404: true };

/**
 * Extract full ACFImage objects from gallery IDs using _embedded media.
 * WordPress ACF Gallery field may return IDs instead of objects even when configured as "Image Array".
 * This function resolves IDs to full media objects from the _embedded response.
 */
export function resolveGalleryImages(
  galleryField: (ACFImage | number)[] | undefined,
  embeddedMedia?: FeaturedMedia[]
): ACFImage[] {
  if (!galleryField || !Array.isArray(galleryField) || galleryField.length === 0) {
    return [];
  }

  // Filter out any objects that are already ACFImage
  const alreadyObjects = galleryField.filter(
    (item): item is ACFImage => typeof item === 'object' && item !== null && 'url' in item
  );
  if (alreadyObjects.length > 0) {
    return alreadyObjects; // Already have objects, use them
  }

  // All items are IDs, need to resolve from _embedded
  const ids = galleryField.filter((item): item is number => typeof item === 'number');
  if (ids.length === 0 || !embeddedMedia || embeddedMedia.length === 0) {
    return [];
  }

  // Map IDs to ACFImage objects from _embedded media
  return ids
    .map((id) => {
      const media = embeddedMedia.find((m) => m.id === id);
      if (!media) return null;

      // Convert FeaturedMedia to ACFImage format
      const acfImage: ACFImage = {
        ID: media.id,
        id: media.id,
        url: media.source_url,
        alt: media.alt_text || '',
        title: '', // FeaturedMedia doesn't have title
        width: media.media_details?.width || 0,
        height: media.media_details?.height || 0,
        sizes: {
          thumbnail: media.media_details?.sizes?.thumbnail?.source_url || media.source_url,
          medium: media.media_details?.sizes?.medium?.source_url || media.source_url,
          large: media.media_details?.sizes?.large?.source_url || media.source_url,
          full: media.source_url,
        },
      };
      return acfImage;
    })
    .filter((img): img is ACFImage => img !== null);
}

/**
 * Fetch media objects for gallery IDs from WordPress REST API.
 * Use this when ACF returns IDs instead of objects and _embedded doesn't contain the attachments.
 */
export async function fetchGalleryMediaByIds(ids: number[]): Promise<ACFImage[]> {
  if (ids.length === 0) return [];

  try {
    // Fetch all media items in parallel
    const mediaPromises = ids.map((id) =>
      fetchWordPress<FeaturedMedia>(`/media/${id}`, {}, { suppressErrorLogging: true })
    );
    const mediaResults = await Promise.all(mediaPromises);

    return mediaResults
      .filter((media): media is FeaturedMedia => media !== null && media !== undefined)
      .map((media) => ({
        ID: media.id,
        id: media.id,
        url: media.source_url,
        alt: media.alt_text || '',
        title: '', // FeaturedMedia doesn't typically have title in this context
        width: media.media_details?.width || 0,
        height: media.media_details?.height || 0,
        sizes: {
          thumbnail: media.media_details?.sizes?.thumbnail?.source_url || media.source_url,
          medium: media.media_details?.sizes?.medium?.source_url || media.source_url,
          large: media.media_details?.sizes?.large?.source_url || media.source_url,
          full: media.source_url,
        },
      }));
  } catch (error) {
    console.error('[fetchGalleryMediaByIds] Error fetching media:', error);
    return [];
  }
}

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
