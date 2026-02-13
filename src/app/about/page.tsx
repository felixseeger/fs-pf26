import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPageBySlug } from '@/lib/wordpress';
import TrustSection from '@/components/sections/TrustSection';
import type { TrustClientItem } from '@/types/wordpress';

export async function generateMetadata(): Promise<Metadata> {
    const page = await getPageBySlug('about');
    if (!page) return { title: 'About' };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const acf = (page as any).acf as Record<string, unknown> | undefined;
    const description = (acf?.about_text as string) || page.excerpt?.rendered?.replace(/<[^>]*>/g, '').substring(0, 160);
    return {
        title: page.title.rendered,
        description,
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

export default async function AboutPage() {
    const page = await getPageBySlug('about');

    if (!page) {
        notFound();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const acf = (page as any).acf as Record<string, unknown> | undefined;
    const aboutTitle = (acf?.about_title as string) || page.title.rendered;
    const aboutText = acf?.about_text as string | undefined;
    const aboutImage = acf?.about_image as string | undefined;
    const socialMedia = acf?.social_media as string | undefined;
    const trustTitle = (acf?.trust_section_title as string) || undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawClients = (acf?.client as any[]) ?? (acf?.trust_clients as any[]) ?? [];
    const trustClients = mapClients(rawClients);

    const hasContent = page.content.rendered && page.content.rendered.trim().length > 0;

    return (
        <div className="min-h-screen bg-white dark:bg-background" suppressHydrationWarning>
            <article className="max-w-4xl mx-auto py-24 px-6 lg:px-10" suppressHydrationWarning>
                <header className="mb-16">
                    <h1
                        className="text-5xl md:text-7xl font-unbounded font-black text-zinc-900 dark:text-white mb-8"
                        dangerouslySetInnerHTML={{ __html: aboutTitle }}
                    />
                </header>

                {aboutImage && (
                    <div className="relative w-full aspect-video mb-12 rounded-lg overflow-hidden">
                        <Image
                            src={aboutImage}
                            alt={aboutTitle.replace(/<[^>]*>/g, '')}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                )}

                {aboutText && (
                    <div className="prose prose-zinc lg:prose-xl dark:prose-invert max-w-none mb-12">
                        <p>{aboutText}</p>
                    </div>
                )}

                {hasContent && (
                    <div
                        className="prose prose-zinc lg:prose-xl dark:prose-invert max-w-none mb-12"
                        dangerouslySetInnerHTML={{ __html: page.content.rendered }}
                    />
                )}

                {socialMedia && (
                    <div className="mt-8">
                        <a
                            href={socialMedia}
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
            </article>

            {trustClients.length > 0 && (
                <TrustSection title={trustTitle} clients={trustClients} />
            )}
        </div>
    );
}
