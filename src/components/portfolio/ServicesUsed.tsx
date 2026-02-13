import Link from 'next/link';
import Image from 'next/image';
import { WPServiceItem, ACFImage } from '@/types/wordpress';

interface ServicesUsedProps {
  services: WPServiceItem[];
  title?: string;
}

export default function ServicesUsed({ services, title = 'Services used' }: ServicesUsedProps) {
  if (!services || services.length === 0) return null;

  return (
    <section
      className="mt-16 pt-12 border-t border-zinc-200 dark:border-zinc-800"
      aria-label="Services used in this project"
    >
      <h2 className="text-sm font-unbounded font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-6">
        {title}
      </h2>
      <ul className="flex flex-wrap gap-4">
        {services.map((service) => {
          const featuredImage = service._embedded?.['wp:featuredmedia']?.[0];
          const gallery = service.acf?.services_gallery;
          const iconUrl =
            gallery && typeof gallery === 'object' && 'url' in gallery
              ? (gallery as ACFImage).url
              : featuredImage?.source_url;
          const iconAlt =
            gallery && typeof gallery === 'object' && 'alt' in gallery
              ? (gallery as ACFImage).alt
              : featuredImage?.alt_text;
          const serviceTitle = service.title?.rendered?.replace(/<[^>]*>/g, '').trim() || 'Service';

          return (
            <li key={service.id}>
              <Link
                href={`/services/${service.slug}`}
                className="group flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
              >
                {iconUrl ? (
                  <span className="relative w-10 h-10 rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0">
                    <Image
                      src={iconUrl}
                      alt={iconAlt || serviceTitle}
                      fill
                      className="object-contain p-1.5"
                      sizes="40px"
                    />
                  </span>
                ) : (
                  <span className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 shrink-0 flex items-center justify-center">
                    <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                )}
                <span className="font-unbounded font-bold text-sm text-zinc-900 dark:text-white group-hover:text-primary transition-colors">
                  {serviceTitle}
                </span>
                <svg className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
