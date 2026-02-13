import { Metadata } from "next";
import PostList from "@/components/blog/PostList";
import { getPostsByCategory, getCategories } from "@/lib/wordpress";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const categories = await getCategories().catch(() => []);
  const slugs = categories.map((cat) => ({ slug: cat.slug }));
  // Next.js static export requires at least one param when API fails
  if (slugs.length === 0) return [{ slug: '__no-categories__' }];
  return slugs;
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  // Handle fallback slug
  if (slug === '__no-categories__') {
    return {
      title: "Categories Unavailable",
    };
  }
  
  const categories = await getCategories().catch(() => []);
  const category = categories.find((cat) => cat.slug === slug);

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: `${category.name} - Blog`,
    description: `Browse posts in the ${category.name} category`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  
  // Handle fallback slug when API fails
  if (slug === '__no-categories__') {
    return (
      <div className="min-h-screen bg-zinc-50 font-sans dark:bg-background" suppressHydrationWarning>
        <main className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400 text-lg">
              Categories are currently unavailable. Please try again later.
            </p>
          </div>
        </main>
      </div>
    );
  }
  
  // Get the category info
  const categories = await getCategories().catch(() => []);
  const category = categories.find((cat) => cat.slug === slug);

  if (!category) {
    notFound();
  }

  // Get posts in this category
  const posts = await getPostsByCategory(slug);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-background" suppressHydrationWarning>
      <main className="max-w-6xl mx-auto px-4 py-16">
        {/* Category Header */}
        <header className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-black dark:text-white">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-2">
              {category.description}
            </p>
          )}
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            {category.count} {category.count === 1 ? 'post' : 'posts'}
          </p>
        </header>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <PostList posts={posts} />
        ) : (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400 text-lg">
              No posts found in this category.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
