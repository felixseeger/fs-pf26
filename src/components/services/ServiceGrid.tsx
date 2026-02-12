'use client';

import Image from 'next/image';
import Link from 'next/link';
import { WPServiceItem, ACFImage } from '@/types/wordpress';

interface ServiceGridProps {
    services: WPServiceItem[];
}

export default function ServiceGrid({ services }: ServiceGridProps) {
    if (!services || services.length === 0) {
        return (
            <div className="text-center py-20">
                <p className="text-xl text-zinc-600 dark:text-zinc-400">
                    No services available at the moment.
                </p>
            </div>
        );
    }

    return (
        <section className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service) => {
                    const featuredImage = service._embedded?.['wp:featuredmedia']?.[0];
                    const servicesGallery = service.acf?.services_gallery;
                    // Use services_gallery if available, otherwise fallback to featured image
                    const iconImageUrl = servicesGallery && typeof servicesGallery === 'object' && 'url' in servicesGallery 
                        ? (servicesGallery as ACFImage).url 
                        : featuredImage?.source_url;
                    const iconImageAlt = servicesGallery && typeof servicesGallery === 'object' && 'alt' in servicesGallery
                        ? (servicesGallery as ACFImage).alt
                        : featuredImage?.alt_text;
                    const acf = service.acf;
                    
                    return (
                        <article 
                            key={service.id}
                            className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group"
                        >
                            {/* Image - Use services_gallery icon or fallback to featured image */}
                            {iconImageUrl ? (
                                <Link href={`/services/${service.slug}`} className="relative w-full h-24 overflow-hidden flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-800">
                                    <Image
                                        src={iconImageUrl}
                                        alt={iconImageAlt || service.title.rendered}
                                        fill
                                        className="object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    />
                                </Link>
                            ) : (
                                <div className="w-full h-24 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                            
                            {/* Content */}
                            <div className="p-6 flex flex-col grow">
                                <Link href={`/services/${service.slug}`}>
                                    <h2 
                                        className="text-2xl font-bold mb-3 text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                                        dangerouslySetInnerHTML={{ __html: service.title.rendered }}
                                    />
                                </Link>
                                
                                {acf?.service_short_description ? (
                                    <p className="text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-3 grow">
                                        {acf.service_short_description}
                                    </p>
                                ) : service.excerpt?.rendered ? (
                                    <div 
                                        className="text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-3 grow prose prose-sm dark:prose-invert"
                                        dangerouslySetInnerHTML={{ __html: service.excerpt.rendered }}
                                    />
                                ) : null}
                                
                                {/* Meta */}
                                <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-500 mb-4">
                                    {acf?.service_duration && (
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {acf.service_duration}
                                        </span>
                                    )}
                                </div>
                                
                                {/* CTA */}
                                <Link
                                    href={`/services/${service.slug}`}
                                    className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
                                >
                                    Learn More
                                    <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
