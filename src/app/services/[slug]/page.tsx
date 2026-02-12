import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getServiceItems, getServiceItemBySlug } from '@/lib/wordpress';
import { ACFImage } from '@/types/wordpress';

export async function generateStaticParams() {
    const services = await getServiceItems(100).catch(() => []);
    // Return at least one param for static export, even if empty
    if (services.length === 0) return [{ slug: '__no-services__' }];
    return services.map((service) => ({
        slug: service.slug,
    }));
}

interface ServicePageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
    const { slug } = await params;
    const service = await getServiceItemBySlug(slug);

    if (!service) {
        return {
            title: 'Service Not Found',
        };
    }

    const featuredImage = service._embedded?.['wp:featuredmedia']?.[0];
    const servicesGallery = service.acf?.services_gallery;
    const iconImageUrl = servicesGallery && typeof servicesGallery === 'object' && 'url' in servicesGallery
        ? (servicesGallery as ACFImage).url
        : featuredImage?.source_url;

    return {
        title: `${service.title.rendered} | Services | Felix Seeger`,
        description: service.excerpt?.rendered?.replace(/<[^>]*>/g, '').substring(0, 160),
        openGraph: {
            title: service.title.rendered,
            description: service.excerpt?.rendered?.replace(/<[^>]*>/g, '').substring(0, 160),
            images: iconImageUrl ? [iconImageUrl] : [],
        },
    };
}

export default async function ServicePage({ params }: ServicePageProps) {
    const { slug } = await params;
    
    // Handle fallback slug when no services exist
    if (slug === '__no-services__') {
        return (
            <div className="min-h-screen bg-white dark:bg-black">
                <div className="max-w-4xl mx-auto px-6 py-20 text-center">
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-6">Services</h1>
                    <p className="text-xl text-zinc-600 dark:text-zinc-400">
                        Services coming soon. Please check back later.
                    </p>
                </div>
            </div>
        );
    }
    
    const service = await getServiceItemBySlug(slug);

    if (!service) {
        notFound();
    }

    const featuredImage = service._embedded?.['wp:featuredmedia']?.[0];
    const servicesGallery = service.acf?.services_gallery;
    // Use services_gallery icon if available, otherwise fallback to featured image
    const iconImageUrl = servicesGallery && typeof servicesGallery === 'object' && 'url' in servicesGallery
        ? (servicesGallery as ACFImage).url
        : featuredImage?.source_url;
    const iconImageAlt = servicesGallery && typeof servicesGallery === 'object' && 'alt' in servicesGallery
        ? (servicesGallery as ACFImage).alt
        : featuredImage?.alt_text;
    const acf = service.acf;

    return (
        <div className="min-h-screen bg-white dark:bg-black" suppressHydrationWarning>
            <article className="max-w-4xl mx-auto px-6 py-20">
                {/* Header */}
                <header className="mb-12">
                    <h1 
                        className="text-5xl md:text-6xl font-black text-zinc-900 dark:text-white mb-6 leading-tight"
                        dangerouslySetInnerHTML={{ __html: service.title.rendered }}
                    />
                    {acf?.service_short_description && (
                        <p className="text-xl text-zinc-600 dark:text-zinc-400">
                            {acf.service_short_description}
                        </p>
                    )}
                </header>

                {/* Icon/Featured Image */}
                {iconImageUrl ? (
                    <div className="relative w-full aspect-video mb-12 rounded-2xl overflow-hidden">
                        <Image
                            src={iconImageUrl}
                            alt={iconImageAlt || service.title.rendered}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                ) : null}

                {/* Service Meta */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {acf?.service_duration && (
                        <div className="bg-zinc-100 dark:bg-zinc-900 p-6 rounded-xl">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                                Duration
                            </h3>
                            <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                                {acf.service_duration}
                            </p>
                        </div>
                    )}
                    {acf?.service_pricing && (
                        <div className="bg-zinc-100 dark:bg-zinc-900 p-6 rounded-xl">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                                Starting Price
                            </h3>
                            <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                                {acf.service_pricing}
                            </p>
                        </div>
                    )}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl flex items-center justify-center">
                        <a 
                            href="/contact"
                            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold hover:gap-3 transition-all"
                        >
                            Get a Quote
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Content */}
                <div 
                    className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400"
                    dangerouslySetInnerHTML={{ __html: service.content.rendered }}
                />

                {/* Features List */}
                {acf?.service_features && acf.service_features.length > 0 && (
                    <div className="mt-12 pt-12 border-t border-zinc-200 dark:border-zinc-800">
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
                            What's Included
                        </h2>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {acf.service_features.map((feature, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-zinc-700 dark:text-zinc-300">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </article>
        </div>
    );
}
