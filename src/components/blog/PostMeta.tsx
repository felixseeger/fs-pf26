import Link from 'next/link';
import Image from 'next/image';
import { WPPost } from '@/types/wordpress';

interface PostMetaProps {
  /** WordPress post with _embedded data */
  post: WPPost;
  /** Show author info */
  showAuthor?: boolean;
  /** Show author avatar */
  showAvatar?: boolean;
  /** Show publish date */
  showDate?: boolean;
  /** Show categories */
  showCategories?: boolean;
  /** Show reading time */
  showReadingTime?: boolean;
  /** Date format: 'short' | 'long' | 'relative' */
  dateFormat?: 'short' | 'long' | 'relative';
  /** Layout: 'inline' | 'stacked' */
  layout?: 'inline' | 'stacked';
  /** Size: 'sm' | 'md' | 'lg' */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Separator character for inline layout */
  separator?: string;
}

// Helper functions
function formatDate(dateString: string, format: 'short' | 'long' | 'relative'): string {
  const date = new Date(dateString);

  if (format === 'relative') {
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
  }

  const options: Intl.DateTimeFormatOptions = format === 'long'
    ? { year: 'numeric', month: 'long', day: 'numeric' }
    : { year: 'numeric', month: 'short', day: 'numeric' };

  return date.toLocaleDateString('en-US', options);
}

function getReadingTime(content: string): number {
  const plainText = content.replace(/<[^>]*>/g, '');
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  return Math.ceil(wordCount / 200);
}

export default function PostMeta({
  post,
  showAuthor = true,
  showAvatar = false,
  showDate = true,
  showCategories = false,
  showReadingTime = false,
  dateFormat = 'short',
  layout = 'inline',
  size = 'md',
  className = '',
  separator = '·',
}: PostMetaProps) {
  const author = post._embedded?.author?.[0];
  const categories = post._embedded?.['wp:term']?.[0] || [];
  const readingTime = getReadingTime(post.content.rendered);

  // Size classes
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const avatarSizes = {
    sm: 20,
    md: 24,
    lg: 32,
  };

  const baseClasses = `text-gray-600 dark:text-gray-400 ${sizeClasses[size]} ${className}`;

  // Inline layout
  if (layout === 'inline') {
    const items: React.ReactNode[] = [];

    // Author
    if (showAuthor && author) {
      items.push(
        <span key="author" className="inline-flex items-center gap-1.5">
          {showAvatar && author.avatar_urls?.['48'] && (
            <Image
              src={author.avatar_urls['48']}
              alt={author.name}
              width={avatarSizes[size]}
              height={avatarSizes[size]}
              className="rounded-full"
            />
          )}
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {author.name}
          </span>
        </span>
      );
    }

    // Date
    if (showDate) {
      items.push(
        <time key="date" dateTime={post.date}>
          {formatDate(post.date, dateFormat)}
        </time>
      );
    }

    // Reading time
    if (showReadingTime) {
      items.push(
        <span key="reading">{readingTime} min read</span>
      );
    }

    return (
      <div className={`flex flex-wrap items-center gap-2 ${baseClasses}`}>
        {items.map((item, index) => (
          <span key={index} className="inline-flex items-center">
            {index > 0 && (
              <span className="mx-2 text-gray-400 dark:text-gray-600">
                {separator}
              </span>
            )}
            {item}
          </span>
        ))}

        {/* Categories shown separately */}
        {showCategories && categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 ml-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Stacked layout
  return (
    <div className={`flex flex-col gap-3 ${baseClasses}`}>
      {/* Author row */}
      {showAuthor && author && (
        <div className="flex items-center gap-3">
          {showAvatar && author.avatar_urls?.['48'] && (
            <Image
              src={author.avatar_urls['48']}
              alt={author.name}
              width={avatarSizes[size] * 1.5}
              height={avatarSizes[size] * 1.5}
              className="rounded-full"
            />
          )}
          <div>
            <span className="font-medium text-gray-900 dark:text-gray-100 block">
              {author.name}
            </span>
            {showDate && (
              <time dateTime={post.date} className="text-gray-500 dark:text-gray-500">
                {formatDate(post.date, dateFormat)}
                {showReadingTime && ` · ${readingTime} min read`}
              </time>
            )}
          </div>
        </div>
      )}

      {/* Date row (if no author shown) */}
      {!showAuthor && showDate && (
        <div className="flex items-center gap-2">
          <time dateTime={post.date}>
            {formatDate(post.date, dateFormat)}
          </time>
          {showReadingTime && (
            <>
              <span className="text-gray-400 dark:text-gray-600">{separator}</span>
              <span>{readingTime} min read</span>
            </>
          )}
        </div>
      )}

      {/* Categories row */}
      {showCategories && categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              {category.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
