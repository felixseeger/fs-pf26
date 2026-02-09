/**
 * Content utilities module
 * General-purpose content processing functions for use across the application
 */

// =============================================================================
// HTML Processing
// =============================================================================

/**
 * Strip all HTML tags from a string
 * @param html - HTML string to strip
 * @returns Plain text string
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Strip HTML tags but preserve line breaks
 * @param html - HTML string to process
 * @returns Text with line breaks preserved
 */
export function stripHtmlPreserveBreaks(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .trim();
}

/**
 * Decode HTML entities (e.g., &amp; -> &)
 * @param html - String with HTML entities
 * @returns Decoded string
 */
export function decodeHtmlEntities(html: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&mdash;': '—',
    '&ndash;': '–',
    '&hellip;': '…',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
  };

  let result = html;
  for (const [entity, char] of Object.entries(entities)) {
    result = result.replace(new RegExp(entity, 'g'), char);
  }

  // Handle numeric entities
  result = result.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));

  return result;
}

/**
 * Sanitize HTML by removing script tags and event handlers
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/\s*on\w+="[^"]*"/gi, '')
    .replace(/\s*on\w+='[^']*'/gi, '');
}

// =============================================================================
// Text Truncation
// =============================================================================

/**
 * Truncate text to a specified length with suffix
 * @param text - Text to truncate
 * @param maxLength - Maximum length (default: 150)
 * @param suffix - Suffix to add when truncated (default: "...")
 * @returns Truncated text
 */
export function truncate(
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
 * Truncate text at word boundary
 * @param text - Text to truncate
 * @param maxLength - Maximum length (default: 150)
 * @param suffix - Suffix to add when truncated (default: "...")
 * @returns Truncated text at word boundary
 */
export function truncateAtWord(
  text: string,
  maxLength: number = 150,
  suffix: string = '...'
): string {
  const plainText = stripHtml(text).trim();
  if (plainText.length <= maxLength) {
    return plainText;
  }

  const truncated = plainText.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.5) {
    return truncated.slice(0, lastSpace).trim() + suffix;
  }

  return truncated.trim() + suffix;
}

/**
 * Truncate text to a specified number of words
 * @param text - Text to truncate
 * @param wordCount - Maximum number of words (default: 30)
 * @param suffix - Suffix to add when truncated (default: "...")
 * @returns Truncated text
 */
export function truncateWords(
  text: string,
  wordCount: number = 30,
  suffix: string = '...'
): string {
  const plainText = stripHtml(text).trim();
  const words = plainText.split(/\s+/);

  if (words.length <= wordCount) {
    return plainText;
  }

  return words.slice(0, wordCount).join(' ') + suffix;
}

// =============================================================================
// Reading Time
// =============================================================================

/**
 * Calculate reading time for content
 * @param content - Text or HTML content
 * @param wordsPerMinute - Reading speed (default: 200)
 * @returns Reading time in minutes
 */
export function getReadingTime(
  content: string,
  wordsPerMinute: number = 200
): number {
  const plainText = stripHtml(content);
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Format reading time as string
 * @param content - Text or HTML content
 * @param wordsPerMinute - Reading speed (default: 200)
 * @returns Formatted reading time string (e.g., "5 min read")
 */
export function formatReadingTime(
  content: string,
  wordsPerMinute: number = 200
): string {
  const minutes = getReadingTime(content, wordsPerMinute);
  return `${minutes} min read`;
}

/**
 * Get word count from content
 * @param content - Text or HTML content
 * @returns Word count
 */
export function getWordCount(content: string): number {
  const plainText = stripHtml(content);
  return plainText.split(/\s+/).filter(Boolean).length;
}

/**
 * Get character count from content
 * @param content - Text or HTML content
 * @param includeSpaces - Include spaces in count (default: true)
 * @returns Character count
 */
export function getCharacterCount(content: string, includeSpaces: boolean = true): number {
  const plainText = stripHtml(content);
  return includeSpaces ? plainText.length : plainText.replace(/\s/g, '').length;
}

// =============================================================================
// String Manipulation
// =============================================================================

/**
 * Convert string to slug (URL-friendly format)
 * @param text - Text to convert
 * @returns Slug string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Convert slug to title case
 * @param slug - Slug string
 * @returns Title case string
 */
export function unslugify(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Capitalize first letter of a string
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Convert string to title case
 * @param text - Text to convert
 * @returns Title case string
 */
export function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Convert string to sentence case
 * @param text - Text to convert
 * @returns Sentence case string
 */
export function toSentenceCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// =============================================================================
// Excerpt & Summary
// =============================================================================

/**
 * Extract first paragraph from HTML content
 * @param html - HTML content
 * @returns First paragraph text
 */
export function getFirstParagraph(html: string): string {
  const match = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  return match ? stripHtml(match[1]).trim() : truncateAtWord(html, 200);
}

/**
 * Generate excerpt from content
 * @param content - HTML or text content
 * @param maxLength - Maximum length (default: 150)
 * @returns Excerpt text
 */
export function generateExcerpt(content: string, maxLength: number = 150): string {
  const plainText = stripHtml(content).trim();
  return truncateAtWord(plainText, maxLength);
}

// =============================================================================
// Validation
// =============================================================================

/**
 * Check if string is empty or only whitespace
 * @param text - Text to check
 * @returns Boolean
 */
export function isEmpty(text: string | null | undefined): boolean {
  return !text || text.trim().length === 0;
}

/**
 * Check if string contains only HTML (no visible text)
 * @param html - HTML string to check
 * @returns Boolean
 */
export function isEmptyHtml(html: string): boolean {
  return isEmpty(stripHtml(html));
}
