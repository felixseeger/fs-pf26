import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { PostCardProps } from "@/types/wordpress";

export default function PostCard({ post }: PostCardProps) {
  const featuredImage = post._embedded?.['wp:featuredmedia']?.[0];
  const author = post._embedded?.author?.[0];
  const categories = post._embedded?.['wp:term']?.[0] || [];

  return (
    <article className="bg-white dark:bg-zinc-900 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {/* Featured Image */}
      {featuredImage?.source_url && (
        <Link href={`/blog/${post.slug}`}>
          <div className="featured-image-write-in relative w-full aspect-video overflow-hidden" suppressHydrationWarning>
            <Image
              src={featuredImage.source_url}
              alt={featuredImage.alt_text || post.title.rendered}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>
      )}

      {/* Content */}
      <div className="p-6 flex flex-col grow" suppressHydrationWarning>
        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3" suppressHydrationWarning>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}

        <Link href={`/blog/${post.slug}`}>
          <h2
            className="text-2xl font-bold mb-3 text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
        </Link>

        <div
          className="text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-3 grow"
          dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
          suppressHydrationWarning
        />

        <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-500 mb-4" suppressHydrationWarning>
          {author && <span>{author.name}</span>}
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </time>
        </div>

        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
        >
          Read more
          <svg
            className="ml-2 w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </article>
  );
}
