/**
 * Pure content utilities for WordPress HTML. Safe to use in client components
 * (no dependency on API or env).
 */

/**
 * Extract image URLs from Gutenberg content
 * @param content - The HTML content string
 */
export function extractImagesFromContent(content: string): { url: string; altText: string }[] {
  if (!content) return [];

  const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
  const altRegex = /alt=["']([^"']*)["']/;

  const images: { url: string; altText: string }[] = [];
  let match;

  while ((match = imgRegex.exec(content)) !== null) {
    const url = match[1];
    const cleanUrl = url.replace(/-(\d+)x(\d+)\.(jpg|jpeg|png|webp|gif)/i, '.$3');
    const altMatch = match[0].match(altRegex);
    const altText = altMatch ? altMatch[1] : '';

    if (!images.find((img) => img.url === cleanUrl || img.url === url)) {
      images.push({ url: cleanUrl, altText });
    }
  }

  return images;
}
