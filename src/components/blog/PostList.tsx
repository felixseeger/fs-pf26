import Link from 'next/link';
import { WPPost } from '@/types/wordpress';
import PostCard from './PostCard';
import EmptyState from './EmptyState';
import PostListSkeleton from './PostListSkeleton';

interface PostListProps {
  /** Array of posts to display */
  posts: WPPost[];
  /** Layout variant */
  layout?: 'grid' | 'list' | 'featured';
  /** Number of columns for grid layout */
  columns?: 1 | 2 | 3 | 4;
  /** Show loading skeleton */
  loading?: boolean;
  /** Number of skeleton items to show when loading */
  skeletonCount?: number;
  /** Custom empty state message */
  emptyMessage?: string;
  /** Show pagination */
  showPagination?: boolean;
  /** Current page (for pagination) */
  currentPage?: number;
  /** Total pages (for pagination) */
  totalPages?: number;
  /** Base URL for pagination links */
  paginationBaseUrl?: string;
  /** Additional CSS classes */
  className?: string;
}

// Pagination component
function Pagination({
  currentPage,
  totalPages,
  baseUrl,
}: {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const getPageUrl = (page: number) => {
    return page === 1 ? baseUrl : `${baseUrl}?page=${page}`;
  };

  return (
    <nav className="flex justify-center items-center gap-2 mt-12" aria-label="Pagination">
      {/* Previous */}
      {currentPage > 1 ? (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Previous
        </Link>
      ) : (
        <span className="px-3 py-2 text-sm font-medium text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-not-allowed">
          Previous
        </span>
      )}

      {/* Page numbers */}
      <div className="flex items-center gap-1" suppressHydrationWarning>
        {startPage > 1 && (
          <>
            <Link
              href={getPageUrl(1)}
              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              1
            </Link>
            {startPage > 2 && (
              <span className="px-2 text-gray-400 dark:text-gray-600">...</span>
            )}
          </>
        )}

        {pages.map((page) => (
          <Link
            key={page}
            href={getPageUrl(page)}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${page === currentPage
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
          >
            {page}
          </Link>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="px-2 text-gray-400 dark:text-gray-600">...</span>
            )}
            <Link
              href={getPageUrl(totalPages)}
              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {totalPages}
            </Link>
          </>
        )}
      </div>

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Next
        </Link>
      ) : (
        <span className="px-3 py-2 text-sm font-medium text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-not-allowed">
          Next
        </span>
      )}
    </nav>
  );
}

// List layout item
function PostListItem({ post }: { post: WPPost }) {
  const featuredImage = post._embedded?.['wp:featuredmedia']?.[0];
  const author = post._embedded?.author?.[0];

  return (
    <article className="flex flex-col sm:flex-row gap-6 p-4 bg-white dark:bg-gray-900 rounded-lg hover:shadow-md transition-shadow">
      {featuredImage?.source_url && (
        <Link href={`/blog/${post.slug}`} className="flex-shrink-0">
          <div className="relative w-full sm:w-48 h-32 rounded-lg overflow-hidden" suppressHydrationWarning>
            <img
              src={featuredImage.source_url}
              alt={featuredImage.alt_text || post.title.rendered}
              className="w-full h-full object-cover"
            />
          </div>
        </Link>
      )}
      <div className="flex-1 min-w-0" suppressHydrationWarning>
        <Link href={`/blog/${post.slug}`}>
          <h3
            className="text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
        </Link>
        <div
          className="mt-2 text-gray-600 dark:text-gray-400 text-sm line-clamp-2"
          dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
        />
        <div className="mt-3 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
          {author && <span>{author.name}</span>}
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </time>
        </div>
      </div>
    </article>
  );
}

export default function PostList({
  posts,
  layout = 'grid',
  columns = 3,
  loading = false,
  skeletonCount = 6,
  emptyMessage,
  showPagination = false,
  currentPage = 1,
  totalPages = 1,
  paginationBaseUrl = '/blog',
  className = '',
}: PostListProps) {
  // Safety check for posts array
  if (!posts || !Array.isArray(posts)) {
    return null;
  }

  // Loading state
  if (loading) {
    return <PostListSkeleton count={skeletonCount} />;
  }

  // Empty state
  if (posts.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  // Column classes for grid layout
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  // Featured layout: first post large, rest in grid
  if (layout === 'featured' && posts.length > 0) {
    const [featuredPost, ...restPosts] = posts;
    const featuredImage = featuredPost._embedded?.['wp:featuredmedia']?.[0];
    const author = featuredPost._embedded?.author?.[0];

    return (
      <div className={className} suppressHydrationWarning>
        {/* Featured post */}
        <article className="mb-12">
          <Link href={`/blog/${featuredPost.slug}`} className="group">
            {featuredImage?.source_url && (
              <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden mb-6" suppressHydrationWarning>
                <img
                  src={featuredImage.source_url}
                  alt={featuredImage.alt_text || featuredPost.title.rendered}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <h2
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-4"
              dangerouslySetInnerHTML={{ __html: featuredPost.title.rendered }}
            />
          </Link>
          <div
            className="text-lg text-gray-600 dark:text-gray-400 mb-4 line-clamp-3"
            dangerouslySetInnerHTML={{ __html: featuredPost.excerpt.rendered }}
          />
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
            {author && <span className="font-medium">{author.name}</span>}
            <time dateTime={featuredPost.date}>
              {new Date(featuredPost.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
          </div>
        </article>

        {/* Rest of posts in grid */}
        {restPosts.length > 0 && (
          <div className={`grid ${columnClasses[columns]} gap-8`} suppressHydrationWarning>
            {restPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {showPagination && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl={paginationBaseUrl}
          />
        )}
      </div>
    );
  }

  // List layout
  if (layout === 'list') {
    return (
      <div className={className} suppressHydrationWarning>
        <div className="flex flex-col gap-4" suppressHydrationWarning>
          {posts.map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </div>

        {showPagination && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl={paginationBaseUrl}
          />
        )}
      </div>
    );
  }

  // Grid layout (default)
  return (
    <div className={className} suppressHydrationWarning>
      <div className={`grid ${columnClasses[columns]} gap-8`} suppressHydrationWarning>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {showPagination && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          baseUrl={paginationBaseUrl}
        />
      )}
    </div>
  );
}
