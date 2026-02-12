import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPortfolioItemBySlug, getPortfolioAttachments, getPortfolioItems, getPortfolioNeighbors, extractImagesFromContent } from '@/lib/wordpress/portfolio';
import Link from 'next/link';
import PortfolioCarousel from '@/components/portfolio/PortfolioCarousel';
import PortfolioPostNavigation from '@/components/portfolio/PortfolioPostNavigation';

export async function generateStaticParams() {
  const items = await getPortfolioItems(100, 1).catch(() => []);
  const slugs = items.map((p) => ({ slug: p.slug }));
  // Next.js static export requires at least one param when API fails
  if (slugs.length === 0) return [{ slug: '__no-items__' }];
  return slugs;
}

interface PortfolioItemPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: PortfolioItemPageProps): Promise<Metadata> {
    const { slug } = await params;
    const item = await getPortfolioItemBySlug(slug);

    if (!item) {
        return {
            title: 'Project Not Found',
        };
    }

    const featuredImage = item._embedded?.['wp:featuredmedia']?.[0];

    return {
        title: item.title?.rendered || 'Project Detail',
        description: item.excerpt?.rendered
            ? item.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 160)
            : 'Portfolio project detail for ' + (item.title?.rendered || 'Felix Seeger'),
        openGraph: {
            title: item.title?.rendered || 'Project Detail',
            description: item.excerpt?.rendered
                ? item.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 160)
                : 'Portfolio project detail for ' + (item.title?.rendered || 'Felix Seeger'),
            type: 'article',
            images: featuredImage ? [featuredImage.source_url] : [],
        },
    };
}

export default async function PortfolioItemPage({ params }: PortfolioItemPageProps) {
    const { slug } = await params;
    const [item, neighbors] = await Promise.all([
        getPortfolioItemBySlug(slug),
        getPortfolioNeighbors(slug),
    ]);

    if (!item) {
        notFound();
    }

    const featuredImage = item._embedded?.['wp:featuredmedia']?.[0];
    const terms = item._embedded?.['wp:term']?.[0] || [];
    
    // 1. Get images from Gutenberg content
    const contentImages = extractImagesFromContent(item.content?.rendered || '');
    
    // 2. Get standard attachments (fallback)
    const attachments = await getPortfolioAttachments(item.id);
    const attachmentImages = attachments.map(a => ({ 
        url: a.source_url, 
        altText: a.alt_text || item.title.rendered 
    }));

    // 3. Combine: Featured -> Content Images -> Attachments
    const allImages = [
        ...(featuredImage ? [{ url: featuredImage.source_url, altText: featuredImage.alt_text || item.title.rendered }] : []),
        ...contentImages,
        ...attachmentImages
    ];

    // Improved deduplication: Normalize URLs by removing size suffixes and protocol
    const getBaseUrl = (url: string) => url.replace(/-(\d+)x(\d+)\.(jpg|jpeg|png|webp|gif)/i, '.$3').replace(/^https?:\/\//, '');
    
    const carouselImages = allImages
        .filter(img => img.url)
        .filter((v, i, a) =>
            a.findIndex(t => getBaseUrl(t.url) === getBaseUrl(v.url)) === i
        );

    return (
        <div className="min-h-screen bg-white dark:bg-black" suppressHydrationWarning>
            <article className="max-w-6xl mx-auto px-4 py-24">
                {/* Back Link */}
                <div className="mb-8">
                    <Link
                        href="/portfolio"
                        className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors gap-2 group"
                    >
                        <svg
                            className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Portfolio
                    </Link>
                </div>

                {/* Project Header */}
                <header className="mb-12">
                    {terms.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {terms.map((term) => (
                                <span
                                    key={term.id}
                                    className="text-xs uppercase tracking-widest font-bold px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full"
                                >
                                    {term.name}
                                </span>
                            ))}
                        </div>
                    )}

                    <h1
                        className="text-4xl md:text-6xl font-black mb-6 text-zinc-900 dark:text-white leading-tight"
                        dangerouslySetInnerHTML={{ __html: item.title?.rendered || 'Untitled Project' }}
                    />
                </header>

                {/* Hero Carousel */}
                {carouselImages.length > 0 && (
                    <div className="mb-16">
                        <PortfolioCarousel images={carouselImages} />
                    </div>
                )}

                {/* Project Content */}
                <div className="max-w-none">
                    <div
                        className="prose prose-zinc lg:prose-xl dark:prose-invert max-w-none 
                prose-headings:font-bold prose-headings:text-zinc-900 dark:prose-headings:text-white
                prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-p:leading-relaxed
                prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:underline
                [&_img]:hidden shadow-img shadow-zinc-200 dark:shadow-none"
                        dangerouslySetInnerHTML={{ __html: item.content?.rendered || '<p>No content available.</p>' }}
                    />
                </div>

                {/* Previous / Next portfolio posts */}
                <PortfolioPostNavigation
                    previous={neighbors.previous}
                    next={neighbors.next}
                />
            </article>
        </div>
    );
}
