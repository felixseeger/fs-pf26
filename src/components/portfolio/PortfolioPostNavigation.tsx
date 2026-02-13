import Link from 'next/link';
import Image from 'next/image';

export interface PortfolioNavItem {
  slug: string;
  title: string;
  thumbnailUrl: string | null;
  thumbnailAlt?: string;
}

interface PortfolioPostNavigationProps {
  previous?: PortfolioNavItem | null;
  next?: PortfolioNavItem | null;
}

export default function PortfolioPostNavigation({
  previous,
  next,
}: PortfolioPostNavigationProps) {
  if (!previous && !next) return null;

  return (
    <nav
      className="mt-16 pt-12 border-t border-zinc-200 dark:border-zinc-800 w-full"
      aria-label="Portfolio post navigation"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Previous */}
        <div className="flex flex-col w-full">
          {previous ? (
            <Link
              href={`/portfolio/${previous.slug}`}
              className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors w-full"
            >
              <svg
                className="w-5 h-5 text-zinc-400 group-hover:-translate-x-1 transition-transform shrink-0 order-first"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-unbounded font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  Previous
                </span>
                {previous.thumbnailUrl && (
                  <div className="featured-image-write-in relative w-20 h-14 rounded-lg bg-zinc-200 dark:bg-zinc-800 shrink-0">
                    <Image
                      src={previous.thumbnailUrl}
                      alt={previous.thumbnailAlt || previous.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="80px"
                    />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-unbounded font-bold text-zinc-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                  {previous.title}
                </span>
              </div>
            </Link>
          ) : (
            <div className="p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30" aria-hidden />
          )}
        </div>

        {/* Next */}
        <div className="flex flex-col md:items-end w-full">
          {next ? (
            <Link
              href={`/portfolio/${next.slug}`}
              className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors w-full md:flex-row-reverse"
            >
              <div className="flex items-center gap-3 shrink-0 md:flex-row-reverse">
                <span className="text-xs font-unbounded font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  Next
                </span>
                {next.thumbnailUrl && (
                  <div className="featured-image-write-in relative w-20 h-14 rounded-lg bg-zinc-200 dark:bg-zinc-800 shrink-0">
                    <Image
                      src={next.thumbnailUrl}
                      alt={next.thumbnailAlt || next.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="80px"
                    />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 md:text-right">
                <span className="font-unbounded font-bold text-zinc-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                  {next.title}
                </span>
              </div>
              <svg
                className="w-5 h-5 text-zinc-400 group-hover:translate-x-1 transition-transform shrink-0 order-first sm:order-0 md:order-first"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <div className="p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 w-full md:w-auto md:min-w-[50%]" aria-hidden />
          )}
        </div>
      </div>
    </nav>
  );
}
