import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getCourseBySlug, getCourses, getCourseNeighbors } from '@/lib/wordpress';
import { getCanonicalUrl } from '@/lib/site-config';
import type { ACFImage } from '@/types/wordpress';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';

function getImageUrl(img: ACFImage | number | false | undefined): string | null {
  if (!img) return null;
  if (typeof img === 'object' && 'url' in img && typeof (img as ACFImage).url === 'string') return (img as ACFImage).url;
  return null;
}

function getGalleryImageUrl(item: ACFImage | number): string | null {
  if (typeof item === 'number') return null;
  return typeof item === 'object' && item && 'url' in item && typeof item.url === 'string' ? item.url : null;
}

/** Fallback slugs when API returns no courses (required for output: 'export') */
const FALLBACK_COURSE_SLUGS = ['intro-to-ai-agents'];

export async function generateStaticParams() {
  const items = await getCourses(100, 1).catch(() => []);
  const fromApi = items.length > 0 ? items.map((c) => c.slug) : [];
  const slugs = fromApi.length > 0 ? fromApi : FALLBACK_COURSE_SLUGS;
  return slugs.map((slug) => ({ slug }));
}

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getCourseBySlug(slug);
  if (!item) return { title: 'Course Not Found' };
  const title = item.acf?.hero_headline?.trim() || item.title?.rendered || 'Course';
  const desc = item.acf?.hero_subheadline?.trim() || item.excerpt?.rendered?.replace(/<[^>]*>/g, '')?.slice(0, 160) || '';
  const featured = item._embedded?.['wp:featuredmedia']?.[0];
  return {
    title: title.replace(/<[^>]*>/g, '').trim(),
    description: desc.replace(/<[^>]*>/g, '').trim(),
    alternates: { canonical: getCanonicalUrl(`/courses/${slug}`) },
    openGraph: {
      title: title.replace(/<[^>]*>/g, '').trim(),
      description: desc.replace(/<[^>]*>/g, '').trim(),
      type: 'article',
      images: featured ? [featured.source_url] : [],
    },
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const [item, neighbors] = await Promise.all([
    getCourseBySlug(slug),
    getCourseNeighbors(slug),
  ]);

  if (!item) notFound();

  const acf = item.acf || {};
  const heroImageUrl = getImageUrl(acf.hero_visual);
  const displayTitle = acf.hero_headline?.trim() || item.title?.rendered || 'Course';
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses' },
    { name: displayTitle.replace(/<[^>]*>/g, '').trim(), path: `/courses/${slug}` },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-background" suppressHydrationWarning>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <article className="max-w-4xl mx-auto px-4 py-24">
        <div className="mb-8">
          <Link
            href="/courses"
            className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors gap-2 group"
          >
            <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Courses
          </Link>
        </div>

        {/* Hero */}
        <header className="mb-16">
          {(heroImageUrl || item._embedded?.['wp:featuredmedia']?.[0]?.source_url) && (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-8 bg-zinc-100 dark:bg-zinc-900">
              <Image
                src={(heroImageUrl || item._embedded?.['wp:featuredmedia']?.[0]?.source_url) ?? ''}
                alt=""
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
          <h1 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white mb-6 leading-tight">
            {displayTitle.replace(/<[^>]*>/g, '')}
          </h1>
          {acf.hero_subheadline && (
            <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl">
              {acf.hero_subheadline}
            </p>
          )}
          {acf.hero_cta_text && (
            <div>
              <a
                href="#offer"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-lg transition-colors"
              >
                {acf.hero_cta_text}
              </a>
              {acf.hero_cta_subtext && (
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{acf.hero_cta_subtext}</p>
              )}
            </div>
          )}
        </header>

        {/* Courses Gallery */}
        {acf.courses_gallery && acf.courses_gallery.length > 0 && (
          <section className="mb-16">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {acf.courses_gallery.map((item, i) => {
                const url = getGalleryImageUrl(item);
                if (!url) return null;
                const alt = typeof item === 'object' && item && 'alt' in item ? String((item as ACFImage).alt || '') : '';
                return (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                    <Image src={url} alt={alt || `Course image ${i + 1}`} fill className="object-cover" sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw" />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Trust bar */}
        {acf.trust_bar_text && (
          <section className="py-8 border-y border-zinc-200 dark:border-zinc-800 mb-16">
            <p className="text-center text-zinc-600 dark:text-zinc-400 font-medium">{acf.trust_bar_text}</p>
            {acf.trust_bar_logos && acf.trust_bar_logos.length > 0 && (
              <div className="flex flex-wrap justify-center gap-8 mt-6">
                {acf.trust_bar_logos.map((row, i) => {
                  const logoUrl = row.logo_image && typeof row.logo_image === 'object' && 'url' in row.logo_image ? (row.logo_image as ACFImage).url : null;
                  if (!logoUrl) return null;
                  const content = <Image src={logoUrl} alt="" width={120} height={48} className="object-contain max-h-12 w-auto opacity-80" />;
                  return (
                    <span key={i}>
                      {row.logo_url ? <a href={row.logo_url} target="_blank" rel="noopener noreferrer" className="hover:opacity-100 opacity-80">{content}</a> : content}
                    </span>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Problem */}
        {(acf.problem_headline || acf.problem_body) && (
          <section className="mb-16">
            {acf.problem_headline && <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">{acf.problem_headline}</h2>}
            {acf.problem_body && (
              <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: acf.problem_body }} />
            )}
          </section>
        )}

        {/* Solution */}
        {(acf.solution_headline || acf.solution_body) && (
          <section className="mb-16">
            {acf.solution_headline && <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">{acf.solution_headline}</h2>}
            {acf.solution_body && (
              <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: acf.solution_body }} />
            )}
          </section>
        )}

        {/* Transformation */}
        {(acf.transformation_headline || (acf.transformation_items && acf.transformation_items.length > 0)) && (
          <section className="mb-16">
            {acf.transformation_headline && <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">{acf.transformation_headline}</h2>}
            {acf.transformation_items && acf.transformation_items.length > 0 && (
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {acf.transformation_items.map((t, i) => (
                  <li key={i} className="p-6 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                    {t.title && <h3 className="font-bold text-zinc-900 dark:text-white mb-2">{t.title}</h3>}
                    {t.description && <p className="text-zinc-600 dark:text-zinc-400 text-sm">{t.description}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Curriculum */}
        {acf.curriculum_modules && acf.curriculum_modules.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">Curriculum</h2>
            <ol className="space-y-4">
              {acf.curriculum_modules.map((m, i) => (
                <li key={i} className="flex gap-4">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">{m.module_number || i + 1}</span>
                  <div>
                    {m.title && <span className="font-semibold text-zinc-900 dark:text-white">{m.title}</span>}
                    {m.description && <span className="text-zinc-600 dark:text-zinc-400"> — {m.description}</span>}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* FAQ */}
        {acf.faq_items && acf.faq_items.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">FAQ</h2>
            <dl className="space-y-6">
              {acf.faq_items.map((faq, i) => (
                <div key={i} className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
                  {faq.question && <dt className="font-semibold text-zinc-900 dark:text-white mb-2">{faq.question}</dt>}
                  {faq.answer && <dd className="text-zinc-600 dark:text-zinc-400">{faq.answer}</dd>}
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* Offer */}
        <section id="offer" className="rounded-2xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-8 md:p-12">
          {acf.offer_headline && <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">{acf.offer_headline}</h2>}
          {(acf.price_amount != null || acf.offer_includes?.length) && (
            <div className="mb-8">
              {acf.price_amount != null && (
                <p className="text-4xl font-black text-zinc-900 dark:text-white mb-6">
                  {acf.price_currency || '€'}{acf.price_amount}
                  {acf.price_type === 'subscription' && <span className="text-lg font-normal text-zinc-500">/month</span>}
                </p>
              )}
              {acf.offer_includes && acf.offer_includes.length > 0 && (
                <ul className="space-y-2 mb-6">
                  {acf.offer_includes.map((inc, i) => (
                    <li key={i} className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                      <span className="text-green-600 dark:text-green-400" aria-hidden>✓</span>
                      {inc.item_text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {(acf.offer_guarantee_heading || acf.offer_guarantee_text) && (
            <div className="mb-8 p-4 rounded-lg bg-white/50 dark:bg-zinc-800/50">
              {acf.offer_guarantee_heading && <h3 className="font-bold text-zinc-900 dark:text-white mb-2">{acf.offer_guarantee_heading}</h3>}
              {acf.offer_guarantee_text && <p className="text-zinc-600 dark:text-zinc-400 text-sm">{acf.offer_guarantee_text}</p>}
            </div>
          )}
          {acf.offer_final_cta && (
            <a
              href="#offer"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-lg transition-colors"
            >
              {acf.offer_final_cta}
            </a>
          )}
        </section>

        {/* Neighbors */}
        {(neighbors.previous || neighbors.next) && (
          <nav className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex justify-between gap-4" aria-label="Course navigation">
            {neighbors.previous ? (
              <Link href={`/courses/${neighbors.previous.slug}`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                ← {neighbors.previous.title}
              </Link>
            ) : <span />}
            {neighbors.next ? (
              <Link href={`/courses/${neighbors.next.slug}`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                {neighbors.next.title} →
              </Link>
            ) : <span />}
          </nav>
        )}
      </article>
    </div>
  );
}
