import { Metadata } from 'next';
import { getPosts } from '@/lib/wordpress';
import PostList from '@/components/blog/PostList';

export const metadata: Metadata = {
    title: 'Blog | Felix Seeger',
    description: 'Sharing insights, tutorials, and thoughts on design and development.',
};

interface BlogPageProps {
    searchParams: Promise<{
        page?: string;
    }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
    const params = await searchParams;
    const currentPage = Number(params.page) || 1;
    const perPage = 9;

    // Fetch posts from WordPress
    const posts = await getPosts(perPage, currentPage);

    // For total pages, WordPress API usually returns headers like 'X-WP-TotalPages'
    // But here we'll simplify or assume we can fetch it if needed.
    // For now, let's keep it simple as per user request to "list all"

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans" suppressHydrationWarning>
            <main className="max-w-6xl mx-auto px-6 py-20">
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
                    currentPage={currentPage}
                    paginationBaseUrl="/blog"
                />
            </main>
        </div>
    );
}
