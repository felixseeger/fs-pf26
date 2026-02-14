import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPortfolioItemBySlug, getPortfolioAttachments, getPortfolioItems, getPortfolioNeighbors, extractImagesFromContent } from '@/lib/wordpress/portfolio';
import { getServiceItems } from '@/lib/wordpress/services';
import { getCanonicalUrl } from '@/lib/site-config';
import { getServicesMatchingPortfolioCategories } from '@/lib/portfolio-utils';
import { getPortfolioSliderMedia, getPortfolioFallbackImages, getPortfolioContentVideoUrl } from '@/lib/wordpress/portfolio-media';
import Link from 'next/link';
import PortfolioCarousel from '@/components/portfolio/PortfolioCarousel';
import PortfolioPostNavigation from '@/components/portfolio/PortfolioPostNavigation';
import ServicesUsed from '@/components/portfolio/ServicesUsed';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';

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
    const displayTitle = item.acf?.portfolio_title?.trim() || item.title?.rendered || 'Project Detail';

    return {
        title: displayTitle.replace(/<[^>]*>/g, '').trim() || 'Project',
        description: item.excerpt?.rendered
            ? item.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 160)
            : 'Portfolio project: ' + (item.title?.rendered?.replace(/<[^>]*>/g, '') || 'Felix Seeger'),
        alternates: { canonical: getCanonicalUrl(`/portfolio/${slug}`) },
        openGraph: {
            title: displayTitle,
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
    const [item, neighbors, allServices] = await Promise.all([
        getPortfolioItemBySlug(slug),
        getPortfolioNeighbors(slug),
        getServiceItems(100, 1),
    ]);

    if (!item) {
        notFound();
    }

    const featuredImage = item._embedded?.['wp:featuredmedia']?.[0];
    const terms = item._embedded?.['wp:term']?.[0] || [];
    
    // Priority 1: Get slider media from ACF portfolio_slider_media field
    const sliderMedia = getPortfolioSliderMedia(item);
    
    // Priority 2: Fallback to existing sources if slider media is empty
    let carouselMedia = sliderMedia;
    if (carouselMedia.length === 0) {
      // 1. Get images from Gutenberg content
      const contentImages = extractImagesFromContent(item.content?.rendered || '');
      
      // 2. Get standard attachments (fallback)
      const attachments = await getPortfolioAttachments(item.id);
      const attachmentImages = attachments.map(a => ({ 
          url: a.source_url, 
          altText: a.alt_text || item.title.rendered 
      }));

      // 3. Combine: Featured -> Content Images -> Attachments
      carouselMedia = getPortfolioFallbackImages(item, featuredImage || null, contentImages, attachmentImages);
    }

    const displayTitle = item.acf?.portfolio_title?.trim() || item.title?.rendered || 'Untitled Project';
    const portfolioText = item.acf?.portfolio_text?.trim();
    const contentVideoUrl = getPortfolioContentVideoUrl(item);

    const matchingServices = getServicesMatchingPortfolioCategories(allServices, terms);

    const breadcrumbs = [
        { name: 'Home', path: '/' },
        { name: 'Portfolio', path: '/portfolio' },
        { name: displayTitle.replace(/<[^>]*>/g, '').trim() || 'Project', path: `/portfolio/${slug}` },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-background" suppressHydrationWarning>
            <BreadcrumbJsonLd items={breadcrumbs} />
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
                        dangerouslySetInnerHTML={{ __html: displayTitle }}
                    />
                </header>

                {/* Hero Carousel */}
                {carouselMedia.length > 0 && (
                    <div className="mb-16">
                        <PortfolioCarousel slides={carouselMedia} />
                    </div>
                )}

                {/* Content video (ACF portfolio_video) */}
                {contentVideoUrl && (
                    <div className="mb-16 rounded-2xl overflow-hidden shadow-2xl bg-zinc-900 aspect-video">
                        <video
                            src={contentVideoUrl}
                            className="w-full h-full object-contain"
                            controls
                            playsInline
                            preload="metadata"
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                )}

                {/* Optional intro text (ACF portfolio_text) */}
                {portfolioText && (
                    <div className="mb-10 prose prose-zinc lg:prose-lg dark:prose-invert max-w-none">
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                            {portfolioText}
                        </p>
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

                {/* Services matching this project's categories */}
                <ServicesUsed services={matchingServices} />
            </article>
        </div>
    );
}
