import { Metadata } from 'next';
import { getPortfolioItems } from '@/lib/wordpress';
import { getCanonicalUrl } from '@/lib/site-config';
import { getBreadcrumbItems } from '@/lib/breadcrumbs';
import Breadcrumb from '@/components/ui/Breadcrumb';
import PortfolioGridFightForSpace from '@/components/portfolio/PortfolioGridFightForSpace';

export const metadata: Metadata = {
    title: 'Portfolio',
    description: 'Selected works: web design, development, and digital projects. Explore case studies and get inspiration for your next project.',
    alternates: { canonical: getCanonicalUrl('/portfolio') },
};

export default async function PortfolioPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const items = await getPortfolioItems(100, 1, locale).catch(() => []);

    return (
        <div className="min-h-screen bg-white dark:bg-background" suppressHydrationWarning>
            <main className="max-w-6xl mx-auto px-6 pt-36 pb-20">
                <div className="mb-8">
                    <Breadcrumb items={getBreadcrumbItems('/portfolio')} />
                </div>
                <header className="max-w-3xl mb-16">
                    <h1 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white mb-6 leading-tight">
                        Selected <span className="text-blue-600 dark:text-blue-500">Works.</span>
                    </h1>
                    <p className="text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Exploring the intersection of design, technology, and user experience.
                        A curation of projects ranging from brand identities to complex web applications.
                    </p>
                </header>

                <PortfolioGridFightForSpace items={items} />
            </main>
        </div>
    );
}
