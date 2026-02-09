import Link from 'next/link';
import { WPCategory } from '@/types/wordpress';

interface CategoryListProps {
  /** Array of categories to display */
  categories: WPCategory[];
  /** Layout variant */
  layout?: 'list' | 'grid' | 'cloud' | 'inline';
  /** Show post count */
  showCount?: boolean;
  /** Show category description */
  showDescription?: boolean;
  /** Number of columns for grid layout */
  columns?: 2 | 3 | 4;
  /** Limit number of categories shown */
  limit?: number;
  /** Base URL for category links */
  baseUrl?: string;
  /** Highlight active category */
  activeSlug?: string;
  /** Additional CSS classes */
  className?: string;
  /** Title for the category list */
  title?: string;
}

export default function CategoryList({
  categories,
  layout = 'list',
  showCount = true,
  showDescription = false,
  columns = 3,
  limit,
  baseUrl = '/category',
  activeSlug,
  className = '',
  title,
}: CategoryListProps) {
  // Limit categories if specified
  const displayCategories = limit ? categories.slice(0, limit) : categories;

  if (displayCategories.length === 0) {
    return null;
  }

  // Column classes for grid layout
  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  // Cloud layout - variable sizes based on post count
  if (layout === 'cloud') {
    const maxCount = Math.max(...displayCategories.map((c) => c.count));
    const minCount = Math.min(...displayCategories.map((c) => c.count));

    const getSize = (count: number): string => {
      if (maxCount === minCount) return 'text-base';
      const ratio = (count - minCount) / (maxCount - minCount);
      if (ratio > 0.75) return 'text-xl font-semibold';
      if (ratio > 0.5) return 'text-lg font-medium';
      if (ratio > 0.25) return 'text-base';
      return 'text-sm';
    };

    return (
      <div className={className}>
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {title}
          </h3>
        )}
        <div className="flex flex-wrap gap-3">
          {displayCategories.map((category) => (
            <Link
              key={category.id}
              href={`${baseUrl}/${category.slug}`}
              className={`${getSize(category.count)} px-3 py-1.5 rounded-full transition-colors ${
                activeSlug === category.slug
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {category.name}
              {showCount && (
                <span className="ml-1 opacity-60">({category.count})</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Inline layout - horizontal list
  if (layout === 'inline') {
    return (
      <div className={className}>
        {title && (
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-2">
            {title}
          </span>
        )}
        <div className="inline-flex flex-wrap gap-2">
          {displayCategories.map((category, index) => (
            <span key={category.id} className="inline-flex items-center">
              <Link
                href={`${baseUrl}/${category.slug}`}
                className={`text-sm transition-colors ${
                  activeSlug === category.slug
                    ? 'text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                {category.name}
                {showCount && (
                  <span className="ml-1 text-gray-400 dark:text-gray-500">
                    ({category.count})
                  </span>
                )}
              </Link>
              {index < displayCategories.length - 1 && (
                <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
              )}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // Grid layout
  if (layout === 'grid') {
    return (
      <div className={className}>
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {title}
          </h3>
        )}
        <div className={`grid ${columnClasses[columns]} gap-4`}>
          {displayCategories.map((category) => (
            <Link
              key={category.id}
              href={`${baseUrl}/${category.slug}`}
              className={`p-4 rounded-lg border transition-all ${
                activeSlug === category.slug
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm'
              }`}
            >
              <h4 className="font-medium text-gray-900 dark:text-white">
                {category.name}
              </h4>
              {showDescription && category.description && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {category.description}
                </p>
              )}
              {showCount && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                  {category.count} {category.count === 1 ? 'post' : 'posts'}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // List layout (default)
  return (
    <div className={className}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
      )}
      <ul className="space-y-2">
        {displayCategories.map((category) => (
          <li key={category.id}>
            <Link
              href={`${baseUrl}/${category.slug}`}
              className={`flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${
                activeSlug === category.slug
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <span className="font-medium">{category.name}</span>
              {showCount && (
                <span className="text-sm text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                  {category.count}
                </span>
              )}
            </Link>
            {showDescription && category.description && (
              <p className="mt-1 ml-3 text-sm text-gray-500 dark:text-gray-500">
                {category.description}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
