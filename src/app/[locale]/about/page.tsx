import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPageBySlug } from '@/lib/wordpress';
import { getCanonicalUrl } from '@/lib/site-config';
import { getBreadcrumbItems } from '@/lib/breadcrumbs';
import Breadcrumb from '@/components/ui/Breadcrumb';
import TrustSection from '@/components/sections/TrustSection';
import CreativeClutter from '@/components/sections/CreativeClutter';
import type { TrustClientItem } from '@/types/wordpress';

async function getAboutPageForLocale(locale?: string) {
    const lang = locale || 'de';

    const localeCandidates = lang === 'de'
        ? [
            await getPageBySlug('about', lang),
            await getPageBySlug('ueber-mich', lang),
        ]
        : [
            await getPageBySlug('about', lang),
            await getPageBySlug('ueber-mich', lang),
        ];

    for (const candidate of localeCandidates) {
        if (candidate) return candidate;
    }

    const fallbackCandidates = [
        await getPageBySlug('about'),
        await getPageBySlug('ueber-mich'),
    ];

    for (const candidate of fallbackCandidates) {
        if (candidate) return candidate;
    }

    return null;
}

function getLocalizedAboutTitle(locale: string, rawTitle?: string) {
    const isDe = locale === 'de';
    const title = rawTitle?.replace(/<[^>]*>/g, '').trim();

    if (!title) return isDe ? 'Über mich' : 'About';
    const normalized = title.toLowerCase();

    if (isDe && (normalized === 'about' || normalized === 'about me')) return 'Über mich';
    if (!isDe && (normalized === 'über mich' || normalized === 'ueber mich' || normalized === 'ueber-mich')) return 'About';
    if (!isDe && normalized === 'about') return 'About';

    return title;
}

/** ACF image field can be a URL string or an object with url */
function getImageUrl(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'object' && value !== null && 'url' in value && typeof (value as { url: string }).url === 'string') {
    return (value as { url: string }).url;
  }
  return undefined;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const page = await getAboutPageForLocale(locale);
    if (!page) {
        return {
            title: locale === 'de' ? 'Über mich' : 'About',
            alternates: { canonical: getCanonicalUrl('/about') },
        };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const acf = (page as any).acf as Record<string, unknown> | undefined;
    const rawDesc = (acf?.about_text as string) || (acf?.about_content as string) || page.excerpt?.rendered || '';
    const description = rawDesc.replace(/<[^>]*>/g, '').trim().substring(0, 160);
    return {
        title: getLocalizedAboutTitle(locale, page.title.rendered),
        description,
        alternates: { canonical: getCanonicalUrl('/about') },
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapClients(raw: any[]): TrustClientItem[] {
    return raw
        .filter((c) => c?.client_name)
        .map((c) => ({
            name: c.client_name,
            image: c.client_logo
                ? {
                      id: c.client_logo.ID ?? c.client_logo.id ?? 0,
                      url: c.client_logo.url ?? '',
                      alt: c.client_logo.alt ?? c.client_name ?? '',
                  }
                : null,
        }));
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const page = await getAboutPageForLocale(locale);

    if (!page) {
        notFound();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const acf = (page as any).acf as Record<string, unknown> | undefined;
    const aboutTitle = getLocalizedAboutTitle(locale, (acf?.about_title as string) || page.title.rendered);
    const aboutText = acf?.about_text as string | undefined;
    const aboutContent = acf?.about_content as string | undefined;
    const aboutImage = getImageUrl(acf?.about_image);
    const socialMedia = acf?.social_media as string | undefined;
    const trustTitle = (acf?.trust_section_title as string) || undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawClients = (acf?.client as any[]) ?? (acf?.trust_clients as any[]) ?? [];
    const trustClients = mapClients(rawClients);

    const hasContent = page.content.rendered && page.content.rendered.trim().length > 0;

    // Validate URL to prevent javascript: injection
    const safeSocialMedia = socialMedia && /^https?:\/\//i.test(socialMedia.trim())
        ? socialMedia.trim()
        : undefined;

    return (
        <div className="min-h-screen bg-white dark:bg-background" suppressHydrationWarning>
            {/* Creative Clutter Hero – full width */}
            <div className="relative w-full">
                {/* Breadcrumb – boxed width */}
                <div className="absolute top-36 inset-x-0 z-20">
                    <div className="max-w-6xl mx-auto px-6 lg:px-10">
                        <Breadcrumb items={getBreadcrumbItems('/about')} />
                    </div>
                </div>
                <CreativeClutter
                    title={aboutTitle.replace(/<[^>]*>/g, '')}
                    subtitle={locale === 'de'
                        ? 'Kreative Unordnung, klare Strategie – so entstehen digitale Erlebnisse.'
                        : 'Creative clutter, clear strategy – that\'s how digital experiences are born.'
                    }
                />
            </div>

            <article className="max-w-6xl mx-auto pb-24 px-6 lg:px-10" suppressHydrationWarning>
                {aboutImage && (
                    <div className="relative w-full aspect-video mb-12 rounded-lg overflow-hidden">
                        <Image
                            src={aboutImage}
                            alt={aboutTitle.replace(/<[^>]*>/g, '').trim() || (locale === 'de' ? 'Über mich' : 'About')}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                )}

                {(() => {
                    const wysiwygContent = aboutContent || aboutText || (hasContent ? page.content.rendered : '');
                    if (!wysiwygContent?.trim()) return null;
                    const hasHtml = /<[a-z][\s\S]*>/i.test(wysiwygContent);
                    return (
                        <div className="prose prose-zinc lg:prose-xl dark:prose-invert max-w-none mb-12 [&_a]:text-zinc-600 [&_a]:dark:text-zinc-400 [&_a:hover]:text-zinc-900 [&_a:hover]:dark:text-white [&_a]:underline [&_img]:rounded-lg">
                            {hasHtml ? (
                                <div dangerouslySetInnerHTML={{ __html: wysiwygContent }} />
                            ) : (
                                <p>{wysiwygContent}</p>
                            )}
                        </div>
                    );
                })()}

                {safeSocialMedia && (
                    <div className="mt-8">
                        <a
                            href={safeSocialMedia}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                        >
                            LinkedIn
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </a>
                    </div>
                )}

                {trustClients.length > 0 && (
                    <TrustSection title={trustTitle} clients={trustClients} />
                )}
            </article>
        </div>
    );
}
