import Image from 'next/image';
import Link from 'next/link';
import type { WPCourseItem } from '@/types/wordpress';

interface CourseCardProps {
  item: WPCourseItem;
}

export default function CourseCard({ item }: CourseCardProps) {
  const featuredImage = item._embedded?.['wp:featuredmedia']?.[0];
  const headline = item.acf?.hero_headline?.trim() || item.title?.rendered || 'Course';
  const subheadline = item.acf?.hero_subheadline?.trim() || item.excerpt?.rendered || '';
  const price = item.acf?.price_amount != null ? item.acf.price_amount : null;
  const currency = item.acf?.price_currency?.trim() || '€';
  const ctaText = item.acf?.primary_cta_text?.trim() || 'View Course';

  return (
    <article className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col border border-zinc-200 dark:border-zinc-800">
      {featuredImage?.source_url && (
        <Link href={`/courses/${item.slug}`}>
          <div className="relative w-full aspect-video overflow-hidden">
            <Image
              src={featuredImage.source_url}
              alt={featuredImage.alt_text || headline}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>
      )}
      <div className="p-6 flex flex-col grow">
        <Link href={`/courses/${item.slug}`}>
          <h2 className="text-xl font-bold mb-2 text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
            {headline.replace(/<[^>]*>/g, '')}
          </h2>
        </Link>
        {subheadline && (
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4 line-clamp-3 grow">
            {subheadline.replace(/<[^>]*>/g, '').trim().slice(0, 180)}
            {(subheadline.replace(/<[^>]*>/g, '').trim().length > 180) ? '…' : ''}
          </p>
        )}
        <div className="flex items-center justify-between gap-4 mt-auto">
          {price != null && (
            <span className="text-lg font-bold text-zinc-900 dark:text-white">
              {currency}{price}
              {item.acf?.price_type === 'subscription' && <span className="text-sm font-normal text-zinc-500">/mo</span>}
            </span>
          )}
          <Link
            href={`/courses/${item.slug}`}
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-sm transition-colors"
          >
            {ctaText}
            <svg className="ml-1.5 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
