import Image from "next/image";
import Link from "next/link";
import { WPPortfolioItem } from "@/types/wordpress";
import { extractImagesFromContent } from "@/lib/wordpress/content-utils";

interface PortfolioCardProps {
    item: WPPortfolioItem;
}

export default function PortfolioCard({ item }: PortfolioCardProps) {
    const featuredImage = item._embedded?.['wp:featuredmedia']?.[0];
    const contentImages = extractImagesFromContent(item.content?.rendered || '');
    const fallbackImage = contentImages[0];
    const displayImageUrl = featuredImage?.source_url ?? fallbackImage?.url;
    const displayImageAlt = featuredImage?.alt_text || fallbackImage?.altText || item.title?.rendered || 'Project Image';
    const categories = item._embedded?.['wp:term']?.[0] || [];

    return (
        <article className="bg-white dark:bg-zinc-900 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
            {/* Featured Image (or first image from content as fallback) */}
            {displayImageUrl && (
                <Link href={`/portfolio/${item.slug}`}>
                    <div className="featured-image-write-in relative w-full aspect-video overflow-hidden">
                        <Image
                            src={displayImageUrl}
                            alt={displayImageAlt}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                </Link>
            )}

            {/* Content */}
            <div className="p-6 flex flex-col grow">
                {/* Categories */}
                {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {categories.map((category) => (
                            <span
                                key={category.id}
                                className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded"
                            >
                                {category.name}
                            </span>
                        ))}
                    </div>
                )}

                <Link href={`/portfolio/${item.slug}`}>
                    <h2
                        className="text-2xl font-bold mb-3 text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        dangerouslySetInnerHTML={{ __html: item.title?.rendered || 'Untitled Project' }}
                    />
                </Link>

                {/* Excerpt */}
                <div
                    className="text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-3 grow"
                    dangerouslySetInnerHTML={{ __html: item.excerpt?.rendered || '' }}
                />

                <Link
                    href={`/portfolio/${item.slug}`}
                    className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                >
                    View Project
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
