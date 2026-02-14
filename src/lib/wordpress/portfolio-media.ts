/**
 * Portfolio slider media utilities
 * Extracts and normalizes slider media from ACF portfolio_slider_media field
 */

import { WPPortfolioItem, PortfolioSliderMediaItem, ACFImage, ACFFile, FeaturedMedia } from '@/types/wordpress';

export interface SliderMediaItem {
  type: 'image' | 'video';
  url: string;
  altText?: string;
  caption?: string;
  /** For video: poster image URL */
  posterUrl?: string;
}

function getUrlFromImage(image: ACFImage | number | string | false | undefined): string | null {
  if (!image) return null;
  if (typeof image === 'string') return image;
  if (typeof image === 'number') return null;
  const obj = image as unknown as Record<string, unknown>;
  if ('url' in obj && typeof obj.url === 'string') return obj.url;
  if ('source_url' in obj && typeof obj.source_url === 'string') return obj.source_url;
  return null;
}

function getUrlFromFile(file: ACFFile | string | number | false | undefined): string | null {
  if (!file) return null;
  if (typeof file === 'string') return file;
  if (typeof file === 'number') return null;
  const obj = file as unknown as Record<string, unknown>;
  if ('url' in obj && typeof obj.url === 'string') return obj.url;
  return null;
}

/**
 * Extract slider media from portfolio item ACF field.
 * Supports both: acf.portfolio_slider_media and acf.portfolio_slider.portfolio_slider_media (group).
 */
export function getPortfolioSliderMedia(item: WPPortfolioItem): SliderMediaItem[] {
  const sliderMedia =
    item.acf?.portfolio_slider_media ??
    item.acf?.portfolio_slider?.portfolio_slider_media;
  if (!sliderMedia || !Array.isArray(sliderMedia) || sliderMedia.length === 0) {
    return [];
  }

  return sliderMedia
    .map((media): SliderMediaItem | null => {
      const isVideo = media.media_type === true || media.media_type === 'video' || media.media_type === '1';
      const mediaType: 'image' | 'video' = isVideo ? 'video' : 'image';
      const caption = media.media_caption?.trim() || undefined;

      if (mediaType === 'video') {
        const videoUrl = getUrlFromFile(media.media_video);
        if (!videoUrl) return null;
        const posterUrl = getUrlFromImage(media.media_video_poster) ?? undefined;
        return { type: 'video', url: videoUrl, caption, posterUrl };
      }

      const image = media.media_image;
      if (!image) return null;
      const url = getUrlFromImage(image);
      if (!url) return null;
      let altText: string | undefined;
      if (typeof image === 'object' && image !== null) {
        const imgObj = image as unknown as Record<string, unknown>;
        if ('alt' in imgObj && typeof imgObj.alt === 'string') altText = imgObj.alt;
        else if ('alt_text' in imgObj && typeof imgObj.alt_text === 'string') altText = imgObj.alt_text;
      }
      return { type: 'image', url, altText, caption };
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

/**
 * Content video URL from ACF portfolio_video (URL or file).
 * Use for the optional project/content video block below the carousel.
 */
export function getPortfolioContentVideoUrl(item: WPPortfolioItem): string | null {
  const pv = item.acf?.portfolio_video;
  if (!pv) return null;
  if (typeof pv === 'string') return pv.trim() || null;
  return getUrlFromFile(pv as ACFFile);
}
