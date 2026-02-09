export function PostCardSkeleton() {
  return (
    <article className="bg-white dark:bg-zinc-900 rounded-lg overflow-hidden shadow-sm">
      {/* Featured Image Skeleton */}
      <div className="relative w-full aspect-video bg-zinc-200 dark:bg-zinc-800 animate-pulse" />

      {/* Content Skeleton */}
      <div className="p-6 flex flex-col gap-4">
        {/* Category Badge Skeleton */}
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        </div>

        {/* Title Skeleton */}
        <div className="space-y-2">
          <div className="h-7 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-7 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        </div>

        {/* Excerpt Skeleton */}
        <div className="space-y-2 flex-grow">
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        </div>

        {/* Meta Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        </div>

        {/* Read More Skeleton */}
        <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
      </div>
    </article>
  );
}

export function PostListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PostContentSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black" suppressHydrationWarning>
      <article className="max-w-4xl mx-auto px-4 py-16">
        {/* Header Skeleton */}
        <header className="mb-8">
          {/* Category Skeleton */}
          <div className="flex gap-2 mb-4">
            <div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
          </div>

          {/* Title Skeleton */}
          <div className="space-y-3 mb-4">
            <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-10 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          </div>

          {/* Meta Skeleton */}
          <div className="flex items-center gap-4">
            <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          </div>
        </header>

        {/* Featured Image Skeleton */}
        <div className="relative w-full aspect-video mb-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />

        {/* Content Skeleton */}
        <div className="space-y-4">
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 w-4/5 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-6 mt-8 mb-4 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        </div>
      </article>
    </div>
  );
}

export function CategoryHeaderSkeleton() {
  return (
    <header className="mb-16 text-center">
      <div className="h-12 w-48 mx-auto bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-4" />
      <div className="h-5 w-32 mx-auto bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
    </header>
  );
}
