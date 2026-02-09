import Link from 'next/link';

interface CategoryPageHeroProps {
  name: string;
  description?: string;
  postCount?: number;
  parentCategory?: {
    name: string;
    slug: string;
  };
}

export default function CategoryPageHero({
  name,
  description,
  postCount,
  parentCategory,
}: CategoryPageHeroProps) {
  return (
    <section className="bg-gradient-to-br from-emerald-600 to-teal-700 dark:from-emerald-800 dark:to-teal-900 text-white py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center">
          {/* Breadcrumb */}
          <nav className="mb-4">
            <ol className="flex items-center justify-center gap-2 text-sm text-emerald-100 dark:text-emerald-200">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              {parentCategory && (
                <>
                  <li>
                    <span className="mx-2">/</span>
                  </li>
                  <li>
                    <Link
                      href={`/category/${parentCategory.slug}`}
                      className="hover:text-white transition-colors"
                    >
                      {parentCategory.name}
                    </Link>
                  </li>
                </>
              )}
              <li>
                <span className="mx-2">/</span>
              </li>
              <li className="text-white font-medium">{name}</li>
            </ol>
          </nav>

          {/* Category Label */}
          <span className="inline-block text-sm font-semibold uppercase tracking-wider text-emerald-200 dark:text-emerald-300 mb-3">
            Category
          </span>

          {/* Category Name */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {name}
          </h1>

          {/* Description */}
          {description && (
            <p className="text-lg md:text-xl text-emerald-100 dark:text-emerald-200 max-w-2xl mx-auto mb-4">
              {description}
            </p>
          )}

          {/* Post Count */}
          {postCount !== undefined && (
            <p className="text-sm text-emerald-200 dark:text-emerald-300">
              {postCount} {postCount === 1 ? 'post' : 'posts'}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
