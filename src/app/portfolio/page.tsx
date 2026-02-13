import { Metadata } from 'next';
import { getPortfolioItems } from '@/lib/wordpress';
import PortfolioGridWithFilter from '@/components/portfolio/PortfolioGridWithFilter';

export const metadata: Metadata = {
    title: 'Portfolio | Felix Seeger',
    description: 'A collection of my recent projects, design work, and development case studies.',
};

export default async function PortfolioPage() {
    const items = await getPortfolioItems(100);

    return (
        <div className="min-h-screen bg-white dark:bg-background" suppressHydrationWarning>
            <main className="max-w-6xl mx-auto px-6 py-20">
                <header className="max-w-3xl mb-16">
                    <h1 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white mb-6 leading-tight">
                        Selected <span className="text-blue-600 dark:text-blue-500">Works.</span>
                    </h1>
                    <p className="text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Exploring the intersection of design, technology, and user experience.
                        A curation of projects ranging from brand identities to complex web applications.
                    </p>
                </header>

                <PortfolioGridWithFilter items={items} />
            </main>
        </div>
    );
}
