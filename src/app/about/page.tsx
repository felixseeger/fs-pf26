import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPageBySlug } from '@/lib/wordpress';
import TrustSection from '@/components/sections/TrustSection';

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata(): Promise<Metadata> {
    const page = await getPageBySlug('about');
    if (!page) return { title: 'About' };
    return {
        title: page.title.rendered,
        description: page.excerpt?.rendered?.replace(/<[^>]*>/g, '').substring(0, 160),
    };
}

export default async function AboutPage() {
    const page = await getPageBySlug('about');

    if (!page) {
        notFound();
    }

    const acf = page.meta_box ?? page.acf;
    const trustTitle = acf?.trust_section_title;
    const trustClients = acf?.trust_clients ?? [];

    return (
        <div className="min-h-screen bg-white dark:bg-black" suppressHydrationWarning>
            <article className="max-w-4xl mx-auto py-24 px-6 lg:px-10" suppressHydrationWarning>
                <header className="mb-16">
                    <h1 className="text-5xl md:text-7xl font-unbounded font-black text-zinc-900 dark:text-white mb-8"
                        dangerouslySetInnerHTML={{ __html: page.title.rendered }}
                    />
                </header>

                <div
                    className="prose prose-zinc lg:prose-xl dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: page.content.rendered }}
                />
            </article>

            {trustClients.length > 0 && (
                <TrustSection title={trustTitle} clients={trustClients} />
            )}
        </div>
    );
}
