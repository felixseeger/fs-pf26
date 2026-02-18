import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllServiceItems, getServiceItemBySlug, getServiceNeighbors } from '@/lib/wordpress';
import { getCanonicalUrl } from '@/lib/site-config';
import { getServiceIconUrl } from '@/lib/service-icons';
import { ACFImage } from '@/types/wordpress';
import { getBreadcrumbItems } from '@/lib/breadcrumbs';
import Breadcrumb from '@/components/ui/Breadcrumb';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import ServicePostNavigation from '@/components/services/ServicePostNavigation';

/** Ensure ACF repeater is always an array (WP can return object with numeric keys). */
function toRepeaterArray<T>(value: T[] | Record<string, T> | null | undefined): T[] {
    if (value == null) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'object' && !Array.isArray(value)) {
        const entries = Object.entries(value).filter(([k]) => /^\d+$/.test(k));
        if (entries.length === 0) return [];
        entries.sort(([a], [b]) => Number(a) - Number(b));
        return entries.map(([, v]) => v);
    }
    return [];
}

export async function generateStaticParams() {
    const services = await getAllServiceItems().catch(() => []);
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
    const wpIconUrl = servicesGallery && typeof servicesGallery === 'object' && 'url' in servicesGallery
        ? (servicesGallery as ACFImage).url
        : featuredImage?.source_url;
    const iconImageUrl = getServiceIconUrl(service.slug, wpIconUrl);

    const title = service.acf?.hero_headline?.trim()
        || service.acf?.service_title
        || service.title.rendered?.replace(/<[^>]*>/g, '').trim();
    const description = service.acf?.hero_subheadline?.replace(/<[^>]*>/g, '').trim().substring(0, 160)
        || service.acf?.service_text?.replace(/<[^>]*>/g, '').trim().substring(0, 160)
        || service.excerpt?.rendered?.replace(/<[^>]*>/g, '').substring(0, 160);
    return {
        title: title,
        description: description || undefined,
        alternates: { canonical: getCanonicalUrl(`/services/${slug}`) },
        openGraph: {
            title,
            description: description || undefined,
            images: iconImageUrl ? [iconImageUrl] : [],
        },
    };
}

export default async function ServicePage({ params }: ServicePageProps) {
    const { slug } = await params;
    
    // Handle fallback slug when no services exist
    if (slug === '__no-services__') {
        return (
            <div className="min-h-screen bg-white dark:bg-background">
                <div className="max-w-4xl mx-auto px-6 py-20 text-center">
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-6">Services</h1>
                    <p className="text-xl text-zinc-600 dark:text-zinc-400">
                        Services coming soon. Please check back later.
                    </p>
                </div>
            </div>
        );
    }
    
    const [service, neighbors] = await Promise.all([
        getServiceItemBySlug(slug),
        getServiceNeighbors(slug),
    ]);

    if (!service) {
        notFound();
    }

    const featuredImage = service._embedded?.['wp:featuredmedia']?.[0];
    const servicesGallery = service.acf?.services_gallery;
    const wpIconUrl = servicesGallery && typeof servicesGallery === 'object' && 'url' in servicesGallery
        ? (servicesGallery as ACFImage).url
        : featuredImage?.source_url;
    const iconImageUrl = getServiceIconUrl(service.slug, wpIconUrl);
    const iconImageAlt = servicesGallery && typeof servicesGallery === 'object' && 'alt' in servicesGallery
        ? (servicesGallery as ACFImage).alt
        : featuredImage?.alt_text;
    const acf = service.acf;
    // Support both naming conventions: process_section_title, features_section_title / features_items, use_cases_title / use_cases_items
    const processSectionTitle = acf?.process_section_title?.trim() ?? '';
    const processItems = toRepeaterArray(acf?.process_items);
    const featuresSectionTitle = (acf?.features_section_title ?? acf?.key_features_title ?? acf?.feature_lists_title)?.trim() ?? '';
    const featuresItems = toRepeaterArray(acf?.features_items ?? acf?.key_features ?? acf?.feature_lists);
    const useCasesSectionTitle = (acf?.use_cases_title)?.trim() ?? '';
    const useCasesItems = toRepeaterArray(acf?.use_cases_items ?? acf?.use_cases);

    const useSalesLayout = Boolean(
        acf?.hero_headline
        || acf?.problem_body
        || acf?.solution_body
        || processItems.length > 0
        || featuresItems.length > 0
        || useCasesItems.length > 0
        || (acf?.deliverables?.length ?? 0) > 0
    );

    const serviceTitle = (acf?.hero_headline?.trim() || acf?.service_title?.trim() || '').replace(/<[^>]*>/g, '')
        || service.title?.rendered?.replace(/<[^>]*>/g, '').trim() || 'Service';
    const mainContent = (acf?.service_text?.trim() || '') || service.content.rendered || '';
    const ctaHref = (acf?.cta_button_link?.trim() || '') || '/contact';
    const ctaText = acf?.cta_button_text?.trim() || 'Get a Quote';

    const proseClass = 'prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-p:text-zinc-600 dark:prose-p:text-zinc-400';
    const breadcrumbs = getBreadcrumbItems(`/services/${slug}`, serviceTitle);

    return (
        <div className="min-h-screen bg-white dark:bg-background" suppressHydrationWarning>
            <BreadcrumbJsonLd items={breadcrumbs} />
            <article className="max-w-4xl mx-auto px-6 pt-36 pb-20">
                <div className="mb-8 flex flex-col gap-3">
                    <Link
                        href="/services"
                        className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors gap-2 group w-fit"
                    >
                        <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Services
                    </Link>
                    <Breadcrumb items={breadcrumbs} />
                </div>
                {/* Featured / service icon image */}
                {iconImageUrl ? (
                    <div className="featured-image-write-in relative w-full max-w-2xl mx-auto min-h-[200px] aspect-2/1 mb-12 rounded-2xl flex items-center justify-center">
                        <Image
                            src={iconImageUrl}
                            alt={iconImageAlt || service.title.rendered}
                            fill
                            className="object-contain service-icon-blue"
                            priority
                        />
                    </div>
                ) : null}

                {/* Hero: headline + subheadline (sales) or legacy title */}
                {useSalesLayout && (acf?.hero_headline ?? acf?.hero_subheadline) ? (
                    <header className="mb-12">
                        {acf?.hero_headline && (
                            <h1 className="text-5xl md:text-6xl font-black text-zinc-900 dark:text-white mb-4 leading-tight">
                                {acf.hero_headline.replace(/<[^>]*>/g, '')}
                            </h1>
                        )}
                        {acf?.hero_subheadline && (
                            <p className="text-xl text-zinc-600 dark:text-zinc-400 whitespace-pre-line">
                                {acf.hero_subheadline.replace(/<[^>]*>/g, '')}
                            </p>
                        )}
                    </header>
                ) : (
                    serviceTitle && (
                        <header className="mb-12">
                            <h1 className="text-5xl md:text-6xl font-black text-zinc-900 dark:text-white mb-4 leading-tight">
                                {serviceTitle}
                            </h1>
                        </header>
                    )
                )}

                {/* Legacy meta cards (only when not using sales layout) */}
                {!useSalesLayout && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {acf?.service_duration && (
                            <div className="bg-zinc-100 dark:bg-zinc-900 p-6 rounded-xl">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">Duration</h3>
                                <p className="text-lg font-semibold text-zinc-900 dark:text-white">{acf.service_duration}</p>
                            </div>
                        )}
                        {acf?.service_pricing && (
                            <div className="bg-zinc-100 dark:bg-zinc-900 p-6 rounded-xl">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">Starting Price</h3>
                                <p className="text-lg font-semibold text-zinc-900 dark:text-white">{acf.service_pricing}</p>
                            </div>
                        )}
                        {acf?.service_features && acf.service_features.length > 0 && (
                            <div className="bg-zinc-100 dark:bg-zinc-900 p-6 rounded-xl">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">Included</h3>
                                <p className="text-lg font-semibold text-zinc-900 dark:text-white">{acf.service_features.length} {acf.service_features.length === 1 ? 'item' : 'items'}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* The Problem (sales layout) */}
                {useSalesLayout && (acf?.problem_headline || acf?.problem_body) && (
                    <section className="mb-12">
                        {acf?.problem_headline && (
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">{acf.problem_headline.replace(/<[^>]*>/g, '')}</h2>
                        )}
                        {acf?.problem_body && (
                            <div className={proseClass} dangerouslySetInnerHTML={{ __html: acf.problem_body }} />
                        )}
                    </section>
                )}

                {/* The Solution (sales layout) */}
                {useSalesLayout && (acf?.solution_headline || acf?.solution_body) && (
                    <section className="mb-12">
                        {acf?.solution_headline && (
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">{acf.solution_headline.replace(/<[^>]*>/g, '')}</h2>
                        )}
                        {acf?.solution_body && (
                            <div className={proseClass} dangerouslySetInnerHTML={{ __html: acf.solution_body }} />
                        )}
                    </section>
                )}

                {/* Process (sales layout): process_section_title + process_items */}
                {useSalesLayout && (processSectionTitle || processItems.length > 0) && (
                    <section className="mb-12">
                        {processSectionTitle && (
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">{processSectionTitle.replace(/<[^>]*>/g, '')}</h2>
                        )}
                        {processItems.length > 0 && (
                            <ol className="space-y-4 text-zinc-700 dark:text-zinc-300 list-none pl-0">
                                {processItems.map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lime-500/15 text-lime-600 dark:text-lime-400" aria-hidden>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </span>
                                        <span>
                                            {item.title && <span className="font-semibold text-zinc-900 dark:text-white">{item.title.replace(/<[^>]*>/g, '')}</span>}
                                            {item.description && <span className="block mt-1">{item.description.replace(/<[^>]*>/g, '')}</span>}
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </section>
                )}

                {/* Key Features (sales layout): features_section_title / key_features_title + features_items / key_features */}
                {useSalesLayout && (featuresSectionTitle || featuresItems.length > 0) && (
                    <section className="mb-12">
                        {featuresSectionTitle && (
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">{featuresSectionTitle.replace(/<[^>]*>/g, '')}</h2>
                        )}
                        {featuresItems.length > 0 && (
                            <ul className="space-y-2 text-zinc-700 dark:text-zinc-300">
                                {featuresItems.map((item, index) => {
                                    const label = item.features_title ?? item.item_text ?? item.text ?? item.feature ?? item.title ?? '';
                                    const description = item.features_description;
                                    return label ? (
                                        <li key={index} className="flex items-start gap-3">
                                            <span className="shrink-0 mt-0.5 text-blue-500 dark:text-blue-400" aria-hidden>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </span>
                                            <span>
                                                <span dangerouslySetInnerHTML={{ __html: label }} />
                                                {description && (
                                                    <span className="block text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{description.replace(/<[^>]*>/g, '')}</span>
                                                )}
                                            </span>
                                        </li>
                                    ) : null;
                                })}
                            </ul>
                        )}
                    </section>
                )}

                {/* Use Cases (sales layout): use_cases_title + use_cases_items / use_cases */}
                {useSalesLayout && (useCasesSectionTitle || useCasesItems.length > 0) && (
                    <section className="mb-12">
                        {useCasesSectionTitle && (
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">{useCasesSectionTitle.replace(/<[^>]*>/g, '')}</h2>
                        )}
                        {useCasesItems.length > 0 && (
                            <ul className="space-y-2 text-zinc-700 dark:text-zinc-300">
                                {useCasesItems.map((item, index) => (
                                    item.item_text ? (
                                        <li key={index} className="flex items-start gap-3">
                                            <span className="shrink-0 mt-0.5 text-blue-500 dark:text-blue-400" aria-hidden>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </span>
                                            <span>{item.item_text.replace(/<[^>]*>/g, '')}</span>
                                        </li>
                                    ) : null
                                ))}
                            </ul>
                        )}
                    </section>
                )}

                {/* Main content (legacy) or when no sales body sections */}
                {!useSalesLayout && mainContent && (
                    <div className={`${proseClass} mb-12`} dangerouslySetInnerHTML={{ __html: mainContent }} />
                )}

                {/* Deliverables (sales layout) */}
                {useSalesLayout && acf?.deliverables && acf.deliverables.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Deliverables</h2>
                        <ul className="space-y-2 text-zinc-700 dark:text-zinc-300">
                            {acf.deliverables.map((item, index) => (
                                item.item_text ? (
                                    <li key={index} className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                        <span>{item.item_text.replace(/<[^>]*>/g, '')}</span>
                                    </li>
                                ) : null
                            ))}
                        </ul>
                    </section>
                )}

                {/* CTA (sales layout uses acf; legacy uses fixed Get a Quote) */}
                <div className="mb-12">
                    <a
                        href={useSalesLayout ? ctaHref : '/contact'}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-lime-500 hover:bg-lime-600 dark:bg-lime-500 dark:hover:bg-lime-600 text-zinc-900 font-bold rounded-xl transition-colors hover:gap-3"
                    >
                        {useSalesLayout ? ctaText : 'Get a Quote'}
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </a>
                </div>

                {/* Legacy Features List */}
                {!useSalesLayout && acf?.service_features && acf.service_features.length > 0 && (
                    <div className="mt-12 pt-12 border-t border-zinc-200 dark:border-zinc-800">
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">What&apos;s Included</h2>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {acf.service_features.map((feature, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-zinc-700 dark:text-zinc-300">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <ServicePostNavigation previous={neighbors.previous} next={neighbors.next} />
            </article>
        </div>
    );
}
