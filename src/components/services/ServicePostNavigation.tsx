import Link from 'next/link';
import Image from 'next/image';

export interface ServiceNavItem {
    slug: string;
    title: string;
    thumbnailUrl: string | null;
    thumbnailAlt?: string;
}

interface ServicePostNavigationProps {
    previous?: ServiceNavItem | null;
    next?: ServiceNavItem | null;
}

export default function ServicePostNavigation({
    previous,
    next,
}: ServicePostNavigationProps) {
    if (!previous && !next) return null;

    return (
        <nav
            className="mt-16 pt-12 border-t border-zinc-200 dark:border-zinc-800"
            aria-label="Service post navigation"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Previous – arrow outer left */}
                <div className="flex flex-col">
                    {previous ? (
                        <Link
                            href={`/services/${previous.slug}`}
                            className="group flex flex-row items-center gap-4 transition-colors"
                            aria-label={`Previous: ${previous.title}`}
                        >
                            <svg
                                className="w-5 h-5 text-zinc-400 group-hover:-translate-x-1 transition-transform shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            {previous.thumbnailUrl && (
                                <div className="featured-image-write-in relative w-12 h-12 shrink-0 flex items-center justify-center">
                                    <Image
                                        src={previous.thumbnailUrl}
                                        alt={previous.thumbnailAlt || previous.title}
                                        fill
                                        className="object-contain group-hover:scale-105 transition-transform duration-300"
                                        sizes="48px"
                                    />
                                </div>
                            )}
                            <span className="font-unbounded font-bold text-zinc-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                                {previous.title}
                            </span>
                        </Link>
                    ) : (
                        <div aria-hidden />
                    )}
                </div>

                {/* Next – arrow outer right */}
                <div className="flex flex-col md:items-end">
                    {next ? (
                        <Link
                            href={`/services/${next.slug}`}
                            className="group flex flex-row items-center gap-4 transition-colors w-full md:justify-end"
                            aria-label={`Next: ${next.title}`}
                        >
                            <span className="font-unbounded font-bold text-zinc-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 min-w-0">
                                {next.title}
                            </span>
                            {next.thumbnailUrl && (
                                <div className="featured-image-write-in relative w-12 h-12 shrink-0 flex items-center justify-center">
                                    <Image
                                        src={next.thumbnailUrl}
                                        alt={next.thumbnailAlt || next.title}
                                        fill
                                        className="object-contain group-hover:scale-105 transition-transform duration-300"
                                        sizes="48px"
                                    />
                                </div>
                            )}
                            <svg
                                className="w-5 h-5 text-zinc-400 group-hover:translate-x-1 transition-transform shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    ) : (
                        <div className="w-full md:w-auto md:min-w-[50%]" aria-hidden />
                    )}
                </div>
            </div>
        </nav>
    );
}
