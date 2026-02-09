/**
 * Image utilities module
 * General-purpose image handling functions for use across the application
 */

// =============================================================================
// Types
// =============================================================================

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ResponsiveImageSrc {
  src: string;
  width: number;
}

export interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  placeholder?: string;
}

// =============================================================================
// Constants
// =============================================================================

/** Default placeholder image path */
export const DEFAULT_PLACEHOLDER = '/images/placeholder.jpg';

/** Default blur placeholder data URL (1x1 gray pixel) */
export const BLUR_PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

/** Common aspect ratios */
export const ASPECT_RATIOS = {
  '1:1': 1,
  '4:3': 4 / 3,
  '3:2': 3 / 2,
  '16:9': 16 / 9,
  '21:9': 21 / 9,
  '2:3': 2 / 3,
  '3:4': 3 / 4,
  '9:16': 9 / 16,
} as const;

/** Common responsive breakpoints */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// =============================================================================
// URL Handling
// =============================================================================

/**
 * Get image URL with fallback
 * @param url - Image URL (can be null/undefined)
 * @param fallback - Fallback URL (default: placeholder)
 * @returns Valid image URL
 */
export function getImageUrl(
  url: string | null | undefined,
  fallback: string = DEFAULT_PLACEHOLDER
): string {
  return url && url.trim() !== '' ? url : fallback;
}

/**
 * Check if URL is a valid image URL
 * @param url - URL to check
 * @returns Boolean
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || url.trim() === '') return false;

  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|avif|svg|bmp|ico)$/i;
  const dataUrl = /^data:image\//i;
  const httpUrl = /^https?:\/\//i;

  return imageExtensions.test(url) || dataUrl.test(url) || httpUrl.test(url);
}

/**
 * Convert relative URL to absolute URL
 * @param url - Relative or absolute URL
 * @param baseUrl - Base URL for relative paths
 * @returns Absolute URL
 */
export function toAbsoluteUrl(url: string, baseUrl: string): string {
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }

  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const path = url.startsWith('/') ? url : `/${url}`;

  return `${base}${path}`;
}

/**
 * Get file extension from image URL
 * @param url - Image URL
 * @returns File extension (lowercase) or null
 */
export function getImageExtension(url: string): string | null {
  const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  return match ? match[1].toLowerCase() : null;
}

// =============================================================================
// Dimensions & Aspect Ratio
// =============================================================================

/**
 * Calculate dimensions maintaining aspect ratio
 * @param original - Original dimensions
 * @param maxWidth - Maximum width
 * @param maxHeight - Maximum height (optional)
 * @returns Calculated dimensions
 */
export function calculateDimensions(
  original: ImageDimensions,
  maxWidth: number,
  maxHeight?: number
): ImageDimensions {
  const aspectRatio = original.width / original.height;

  let width = Math.min(original.width, maxWidth);
  let height = width / aspectRatio;

  if (maxHeight && height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}

/**
 * Calculate height from width and aspect ratio
 * @param width - Target width
 * @param aspectRatio - Aspect ratio (width/height) or preset name
 * @returns Calculated height
 */
export function calculateHeight(
  width: number,
  aspectRatio: number | keyof typeof ASPECT_RATIOS
): number {
  const ratio = typeof aspectRatio === 'number'
    ? aspectRatio
    : ASPECT_RATIOS[aspectRatio];
  return Math.round(width / ratio);
}

/**
 * Calculate width from height and aspect ratio
 * @param height - Target height
 * @param aspectRatio - Aspect ratio (width/height) or preset name
 * @returns Calculated width
 */
export function calculateWidth(
  height: number,
  aspectRatio: number | keyof typeof ASPECT_RATIOS
): number {
  const ratio = typeof aspectRatio === 'number'
    ? aspectRatio
    : ASPECT_RATIOS[aspectRatio];
  return Math.round(height * ratio);
}

/**
 * Get aspect ratio from dimensions
 * @param dimensions - Image dimensions
 * @returns Aspect ratio (width/height)
 */
export function getAspectRatio(dimensions: ImageDimensions): number {
  return dimensions.width / dimensions.height;
}

// =============================================================================
// Placeholder Generation
// =============================================================================

/**
 * Generate a colored placeholder data URL
 * @param color - Hex color (default: #e5e7eb - gray-200)
 * @param width - Width (default: 1)
 * @param height - Height (default: 1)
 * @returns Data URL
 */
export function generateColorPlaceholder(
  color: string = '#e5e7eb',
  width: number = 1,
  height: number = 1
): string {
  // Create SVG placeholder
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect fill="${color}" width="100%" height="100%"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Generate placeholder with dimensions text
 * @param width - Width
 * @param height - Height
 * @param bgColor - Background color (default: #e5e7eb)
 * @param textColor - Text color (default: #9ca3af)
 * @returns Data URL
 */
export function generateDimensionPlaceholder(
  width: number,
  height: number,
  bgColor: string = '#e5e7eb',
  textColor: string = '#9ca3af'
): string {
  const fontSize = Math.min(width, height) / 8;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect fill="${bgColor}" width="100%" height="100%"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${textColor}" font-family="sans-serif" font-size="${fontSize}">${width}×${height}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// =============================================================================
// Responsive Images
// =============================================================================

/**
 * Generate srcset string for responsive images
 * @param baseSrc - Base image URL
 * @param widths - Array of widths to generate
 * @param urlGenerator - Function to generate URL for each width
 * @returns srcset string
 */
export function generateSrcSet(
  baseSrc: string,
  widths: number[],
  urlGenerator?: (src: string, width: number) => string
): string {
  const generator = urlGenerator || ((src, w) => `${src}?w=${w}`);

  return widths
    .map((width) => `${generator(baseSrc, width)} ${width}w`)
    .join(', ');
}

/**
 * Generate sizes attribute for responsive images
 * @param sizes - Object mapping breakpoints to sizes
 * @param defaultSize - Default size (default: 100vw)
 * @returns sizes string
 */
export function generateSizes(
  sizes: Partial<Record<keyof typeof BREAKPOINTS, string>>,
  defaultSize: string = '100vw'
): string {
  const breakpointEntries = Object.entries(sizes)
    .filter(([key]) => key in BREAKPOINTS)
    .map(([key, value]) => {
      const breakpoint = BREAKPOINTS[key as keyof typeof BREAKPOINTS];
      return `(min-width: ${breakpoint}px) ${value}`;
    })
    .reverse(); // Larger breakpoints first

  return [...breakpointEntries, defaultSize].join(', ');
}

/**
 * Get common responsive image widths
 * @returns Array of common widths
 */
export function getResponsiveWidths(): number[] {
  return [320, 640, 768, 1024, 1280, 1536, 1920];
}

// =============================================================================
// Image Loading
// =============================================================================

/**
 * Preload an image
 * @param src - Image source URL
 * @returns Promise that resolves when image loads
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Get natural dimensions of an image
 * @param src - Image source URL
 * @returns Promise resolving to dimensions
 */
export async function getImageDimensions(src: string): Promise<ImageDimensions> {
  const img = await preloadImage(src);
  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
  };
}
