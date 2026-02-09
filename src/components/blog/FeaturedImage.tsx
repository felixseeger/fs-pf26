import Image from 'next/image';
import { WPPost, WPPage, FeaturedMedia } from '@/types/wordpress';

interface FeaturedImageProps {
  /** WordPress post or page with _embedded data */
  post?: WPPost | WPPage;
  /** Direct FeaturedMedia object (alternative to post) */
  media?: FeaturedMedia;
  /** Custom alt text (overrides media alt_text) */
  alt?: string;
  /** Aspect ratio: 'video' (16:9), 'square' (1:1), 'wide' (21:9), 'auto' */
  aspectRatio?: 'video' | 'square' | 'wide' | 'auto';
  /** Fill container (for use with aspect ratio containers) */
  fill?: boolean;
  /** Fixed width (when not using fill) */
  width?: number;
  /** Fixed height (when not using fill) */
  height?: number;
  /** Image priority loading */
  priority?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
  /** Additional CSS classes for the image */
  imageClassName?: string;
  /** Show caption if available */
  showCaption?: boolean;
  /** Custom caption text */
  caption?: string;
  /** Placeholder to show when no image */
  placeholder?: 'blur' | 'empty' | 'none';
  /** Fallback image URL when no featured image */
  fallbackSrc?: string;
  /** Rounded corners */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const DEFAULT_PLACEHOLDER = '/images/placeholder.jpg';

export default function FeaturedImage({
  post,
  media,
  alt,
  aspectRatio = 'video',
  fill = true,
  width,
  height,
  priority = false,
  className = '',
  imageClassName = '',
  showCaption = false,
  caption,
  placeholder = 'empty',
  fallbackSrc = DEFAULT_PLACEHOLDER,
  rounded = 'none',
}: FeaturedImageProps) {
  // Get featured media from post or use direct media prop
  const featuredMedia = media || post?._embedded?.['wp:featuredmedia']?.[0];

  // Determine image source
  const src = featuredMedia?.source_url || fallbackSrc;
  const hasImage = !!featuredMedia?.source_url;

  // Determine alt text
  const altText = alt || featuredMedia?.alt_text || (post && 'title' in post ? post.title.rendered.replace(/<[^>]*>/g, '') : 'Featured image');

  // Get dimensions from media details
  const naturalWidth = featuredMedia?.media_details?.width;
  const naturalHeight = featuredMedia?.media_details?.height;

  // Aspect ratio classes
  const aspectRatioClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    wide: 'aspect-[21/9]',
    auto: naturalWidth && naturalHeight ? '' : 'aspect-video',
  };

  // Rounded corner classes
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  // Caption text
  const captionText = caption || (featuredMedia as any)?.caption?.rendered?.replace(/<[^>]*>/g, '');

  // If no image and placeholder is none, render nothing
  if (!hasImage && placeholder === 'none') {
    return null;
  }

  // Container for aspect ratio mode
  if (fill) {
    return (
      <figure className={className}>
        <div
          className={`relative w-full overflow-hidden ${aspectRatioClasses[aspectRatio]} ${roundedClasses[rounded]}`}
          style={
            aspectRatio === 'auto' && naturalWidth && naturalHeight
              ? { aspectRatio: `${naturalWidth}/${naturalHeight}` }
              : undefined
          }
        >
          {hasImage ? (
            <Image
              src={src}
              alt={altText}
              fill
              priority={priority}
              className={`object-cover ${imageClassName}`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
          ) : (
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
              <svg
                className="w-16 h-16 text-gray-400 dark:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {showCaption && captionText && (
          <figcaption className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
            {captionText}
          </figcaption>
        )}
      </figure>
    );
  }

  // Fixed dimensions mode
  const imgWidth = width || naturalWidth || 800;
  const imgHeight = height || naturalHeight || 450;

  return (
    <figure className={className}>
      <div className={`overflow-hidden ${roundedClasses[rounded]}`}>
        {hasImage ? (
          <Image
            src={src}
            alt={altText}
            width={imgWidth}
            height={imgHeight}
            priority={priority}
            className={imageClassName}
          />
        ) : (
          <div
            className="bg-gray-200 dark:bg-gray-800 flex items-center justify-center"
            style={{ width: imgWidth, height: imgHeight }}
          >
            <svg
              className="w-16 h-16 text-gray-400 dark:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {showCaption && captionText && (
        <figcaption className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
          {captionText}
        </figcaption>
      )}
    </figure>
  );
}
