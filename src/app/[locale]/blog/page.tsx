import { Metadata } from 'next';
import { getPosts } from '@/lib/wordpress';
import { getCanonicalUrl } from '@/lib/site-config';
import { getBreadcrumbItems } from '@/lib/breadcrumbs';
import Breadcrumb from '@/components/ui/Breadcrumb';
import PostList from '@/components/blog/PostList';

export const metadata: Metadata = {
    title: 'Blog',
    description: 'Insights on design, development, and digital strategy. Read articles and tutorials — then get in touch for your project.',
    alternates: { canonical: getCanonicalUrl('/blog') },
};

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const perPage = 100;

    const posts = await getPosts(perPage, 1, locale);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-background font-sans" suppressHydrationWarning>
            <main className="max-w-6xl mx-auto px-6 py-20">
                <div className="mb-8">
                    <Breadcrumb items={getBreadcrumbItems('/blog')} />
                </div>
                <header className="max-w-2xl mb-16">
                    <h1 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white mb-6 leading-tight">
                        Latest <span className="text-blue-600 dark:text-blue-500">Insights.</span>
                    </h1>
                    <p className="text-xl text-zinc-600 dark:text-zinc-400">
                        A collection of articles covering design systems, high-performance web development,
                        and the evolution of digital products.
                    </p>
                </header>

                <PostList
                    posts={posts}
                    layout="grid"
                    columns={3}
                    currentPage={1}
                    paginationBaseUrl="/blog"
                />
            </main>
        </div>
    );
}
