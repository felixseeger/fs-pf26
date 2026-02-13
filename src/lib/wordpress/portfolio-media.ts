/**
 * Portfolio slider media utilities
 * Extracts and normalizes slider media from ACF portfolio_slider_media field
 */

import { WPPortfolioItem, PortfolioSliderMediaItem, ACFImage, FeaturedMedia } from '@/types/wordpress';

export interface SliderMediaItem {
  type: 'image' | 'video';
  url: string;
  altText?: string;
  caption?: string;
}

/**
 * Extract slider media from portfolio item ACF field.
 * Returns normalized array of images (and videos if media_type indicates video).
 */
export function getPortfolioSliderMedia(item: WPPortfolioItem): SliderMediaItem[] {
  const sliderMedia = item.acf?.portfolio_slider_media;
  if (!sliderMedia || !Array.isArray(sliderMedia) || sliderMedia.length === 0) {
    return [];
  }

  return sliderMedia
    .map((media): SliderMediaItem | null => {
      // Handle media_type: checkbox (boolean) or select (string)
      const isVideo = media.media_type === true || media.media_type === 'video' || media.media_type === '1';
      const mediaType: 'image' | 'video' = isVideo ? 'video' : 'image';

      // Extract image data
      const image = media.media_image;
      if (!image) return null;

      let url: string | null = null;
      let altText: string | undefined;

      // Handle different image field return formats
      if (typeof image === 'string') {
        url = image;
      } else if (typeof image === 'number') {
        // Image ID - would need to fetch, but ACF usually returns object
        return null;
      } else if (typeof image === 'object' && image !== null) {
        if ('url' in image) {
          url = image.url;
          if ('alt' in image) altText = image.alt;
        } else if ('source_url' in image) {
          // WordPress media object format
          url = image.source_url;
          if ('alt_text' in image) altText = image.alt_text;
        }
      }

      if (!url) return null;

      return {
        type: mediaType,
        url,
        altText,
      };
    })
    .filter((item): item is SliderMediaItem => item !== null);
}

/**
 * Fallback: Get images from existing sources (featured, content, attachments).
 * Used when portfolio_slider_media is empty.
 */
export function getPortfolioFallbackImages(
  item: WPPortfolioItem,
  featuredImage: FeaturedMedia | null,
  contentImages: { url: string; altText: string }[],
  attachmentImages: { url: string; altText: string }[]
): SliderMediaItem[] {
  const allImages: SliderMediaItem[] = [];

  if (featuredImage?.source_url) {
    allImages.push({
      type: 'image',
      url: featuredImage.source_url,
      altText: featuredImage.alt_text,
    });
  }

  allImages.push(...contentImages.map(img => ({
    type: 'image' as const,
    url: img.url,
    altText: img.altText,
  })));

  allImages.push(...attachmentImages.map(img => ({
    type: 'image' as const,
    url: img.url,
    altText: img.altText,
  })));

  // Deduplicate by URL (normalize size suffixes)
  const getBaseUrl = (url: string) => url.replace(/-(\d+)x(\d+)\.(jpg|jpeg|png|webp|gif)/i, '.$3').replace(/^https?:\/\//, '');
  const seen = new Set<string>();
  
  return allImages.filter(img => {
    const baseUrl = getBaseUrl(img.url);
    if (seen.has(baseUrl)) return false;
    seen.add(baseUrl);
    return true;
  });
}
