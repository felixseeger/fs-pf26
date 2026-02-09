/**
 * WordPress utilities module
 * Common helper functions for date formatting, content processing, and image handling
 */

import { WPPost, WPPage, FeaturedMedia, RenderedContent } from '@/types/wordpress';

// =============================================================================
// Date Formatting
// =============================================================================

/**
 * Format a WordPress date string for display
 * @param dateString - ISO date string from WordPress (e.g., "2025-01-30T10:00:00")
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  } catch {
    return dateString;
  }
}

/**
 * Format date as relative time (e.g., "2 days ago")
 * @param dateString - ISO date string from WordPress
 * @returns Relative time string
 */
export function formatRelativeDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'week', seconds: 604800 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
    ];

    for (const interval of intervals) {
      const count = Math.floor(diffInSeconds / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
      }
    }

    return 'Just now';
  } catch {
    return dateString;
  }
}

/**
 * Format date in short format (e.g., "Jan 30, 2025")
 * @param dateString - ISO date string from WordPress
 * @returns Short formatted date string
 */
export function formatShortDate(dateString: string): string {
  return formatDate(dateString, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// =============================================================================
// Content Processing
// =============================================================================

/**
 * Strip HTML tags from a string
 * @param html - HTML string to strip
 * @returns Plain text string
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Get plain text from WordPress rendered content
 * @param content - RenderedContent object from WordPress
 * @returns Plain text string
 */
export function getPlainText(content: RenderedContent): string {
  return stripHtml(content.rendered).trim();
}

/**
 * Truncate text to a specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length (default: 150)
 * @param suffix - Suffix to add when truncated (default: "...")
 * @returns Truncated text
 */
export function truncateText(
  text: string,
  maxLength: number = 150,
  suffix: string = '...'
): string {
  const plainText = stripHtml(text).trim();
  if (plainText.length <= maxLength) {
    return plainText;
  }
  return plainText.slice(0, maxLength).trim() + suffix;
}

/**
 * Get excerpt from post, with fallback to truncated content
 * @param post - WordPress post or page
 * @param maxLength - Maximum length for fallback truncation
 * @returns Excerpt text
 */
export function getExcerpt(
  post: WPPost | WPPage,
  maxLength: number = 150
): string {
  // Try excerpt first
  const excerptText = getPlainText(post.excerpt);
  if (excerptText && excerptText !== '') {
    return truncateText(excerptText, maxLength);
  }

  // Fall back to content
  return truncateText(post.content.rendered, maxLength);
}

/**
 * Calculate reading time for content
 * @param content - HTML content or RenderedContent object
 * @param wordsPerMinute - Reading speed (default: 200)
 * @returns Reading time in minutes
 */
export function getReadingTime(
  content: string | RenderedContent,
  wordsPerMinute: number = 200
): number {
  const text = typeof content === 'string' ? content : content.rendered;
  const plainText = stripHtml(text);
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Format reading time as string
 * @param content - HTML content or RenderedContent object
 * @returns Formatted reading time string (e.g., "5 min read")
 */
export function formatReadingTime(content: string | RenderedContent): string {
  const minutes = getReadingTime(content);
  return `${minutes} min read`;
}

// =============================================================================
// Image Handling
// =============================================================================

/**
 * Default placeholder image URL
 */
export const DEFAULT_PLACEHOLDER_IMAGE = '/images/placeholder.jpg';

/**
 * Get featured image from a post or page
 * @param item - WordPress post or page with _embedded data
 * @returns FeaturedMedia object or null
 */
export function getFeaturedImage(
  item: WPPost | WPPage
): FeaturedMedia | null {
  return item._embedded?.['wp:featuredmedia']?.[0] ?? null;
}

/**
 * Get featured image URL from a post or page
 * @param item - WordPress post or page with _embedded data
 * @param fallback - Fallback URL if no image (default: placeholder)
 * @returns Image URL string
 */
export function getFeaturedImageUrl(
  item: WPPost | WPPage,
  fallback: string = DEFAULT_PLACEHOLDER_IMAGE
): string {
  const featuredImage = getFeaturedImage(item);
  return featuredImage?.source_url ?? fallback;
}

/**
 * Get featured image URL at a specific size
 * @param item - WordPress post or page with _embedded data
 * @param size - WordPress image size (e.g., 'thumbnail', 'medium', 'large', 'full')
 * @param fallback - Fallback URL if no image
 * @returns Image URL string
 */
export function getFeaturedImageUrlBySize(
  item: WPPost | WPPage,
  size: string = 'large',
  fallback: string = DEFAULT_PLACEHOLDER_IMAGE
): string {
  const featuredImage = getFeaturedImage(item);

  if (!featuredImage) {
    return fallback;
  }

  // Try to get the requested size
  const sizeUrl = featuredImage.media_details?.sizes?.[size]?.source_url;
  if (sizeUrl) {
    return sizeUrl;
  }

  // Fall back to full size
  return featuredImage.source_url ?? fallback;
}

/**
 * Get featured image alt text
 * @param item - WordPress post or page with _embedded data
 * @param fallback - Fallback alt text
 * @returns Alt text string
 */
export function getFeaturedImageAlt(
  item: WPPost | WPPage,
  fallback?: string
): string {
  const featuredImage = getFeaturedImage(item);

  if (featuredImage?.alt_text) {
    return featuredImage.alt_text;
  }

  // Fall back to post title if no alt text
  return fallback ?? stripHtml(item.title.rendered);
}

/**
 * Get featured image dimensions
 * @param item - WordPress post or page with _embedded data
 * @returns Object with width and height, or null
 */
export function getFeaturedImageDimensions(
  item: WPPost | WPPage
): { width: number; height: number } | null {
  const featuredImage = getFeaturedImage(item);
  const details = featuredImage?.media_details;

  if (details?.width && details?.height) {
    return {
      width: details.width,
      height: details.height,
    };
  }

  return null;
}

/**
 * Check if post/page has a featured image
 * @param item - WordPress post or page
 * @returns Boolean
 */
export function hasFeaturedImage(item: WPPost | WPPage): boolean {
  return getFeaturedImage(item) !== null;
}

// =============================================================================
// Author Utilities
// =============================================================================

/**
 * Get author from a post
 * @param post - WordPress post with _embedded data
 * @returns Author object or null
 */
export function getAuthor(post: WPPost): import('@/types/wordpress').Author | null {
  return post._embedded?.author?.[0] ?? null;
}

/**
 * Get author name from a post
 * @param post - WordPress post with _embedded data
 * @param fallback - Fallback name
 * @returns Author name string
 */
export function getAuthorName(post: WPPost, fallback: string = 'Unknown'): string {
  return getAuthor(post)?.name ?? fallback;
}

/**
 * Get author avatar URL
 * @param post - WordPress post with _embedded data
 * @param size - Avatar size (default: '96')
 * @returns Avatar URL or null
 */
export function getAuthorAvatar(
  post: WPPost,
  size: string = '96'
): string | null {
  const author = getAuthor(post);
  return author?.avatar_urls?.[size] ?? null;
}
