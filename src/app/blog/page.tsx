import { Metadata } from 'next';
import { getPosts } from '@/lib/wordpress';
import PostList from '@/components/blog/PostList';

export const metadata: Metadata = {
    title: 'Blog | Felix Seeger',
    description: 'Sharing insights, tutorials, and thoughts on design and development.',
};

export default async function BlogPage() {
    const perPage = 100; // Show all posts for static export

    // Fetch posts from WordPress
    const posts = await getPosts(perPage, 1);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-background font-sans" suppressHydrationWarning>
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
                    currentPage={1}
                    paginationBaseUrl="/blog"
                />
            </main>
        </div>
    );
}
