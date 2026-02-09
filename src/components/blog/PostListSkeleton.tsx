export default function PostListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(count)].map((_, index) => (
        <article
          key={index}
          className="bg-white dark:bg-zinc-900 rounded-lg overflow-hidden shadow-sm animate-pulse flex flex-col"
        >
          {/* Skeleton Image */}
          <div className="relative w-full aspect-video bg-zinc-200 dark:bg-zinc-800" />

          {/* Skeleton Content */}
          <div className="p-6 flex flex-col flex-grow">
            {/* Skeleton Title */}
            <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded mb-3" />
            <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4 mb-4" />

            {/* Skeleton Excerpt */}
            <div className="space-y-2 mb-4 flex-grow">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6" />
            </div>

            {/* Skeleton Meta */}
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-24" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-20" />
            </div>

            {/* Skeleton Read More */}
            <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-28" />
          </div>
        </article>
      ))}
    </div>
  );
}
