import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPostBySlug, getPosts } from '@/lib/wordpress';

export async function generateStaticParams() {
  const posts = await getPosts(100, 1).catch(() => []);
  const slugs = posts.map((p) => ({ slug: p.slug }));
  // Next.js static export requires at least one param when API fails
  if (slugs.length === 0) return [{ slug: '__no-posts__' }];
  return slugs;
}

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  // Handle fallback slug
  if (slug === '__no-posts__') {
    return {
      title: 'Posts Unavailable',
    };
  }
  
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const featuredImage = post._embedded?.['wp:featuredmedia']?.[0];

  return {
    title: post.title.rendered,
    description: post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 160),
    openGraph: {
      title: post.title.rendered,
      description: post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 160),
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.modified,
      images: featuredImage ? [featuredImage.source_url] : [],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  
  // Handle fallback slug when API fails
  if (slug === '__no-posts__') {
    return (
      <div className="min-h-screen bg-zinc-50 font-sans dark:bg-background" suppressHydrationWarning>
        <main className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400 text-lg">
              Blog posts are currently unavailable. Please try again later.
            </p>
          </div>
        </main>
      </div>
    );
  }
  
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const featuredImage = post._embedded?.['wp:featuredmedia']?.[0];
  const author = post._embedded?.author?.[0];
  const categories = post._embedded?.['wp:term']?.[0] || [];

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-background" suppressHydrationWarning>
      <article className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <header className="mb-8">
          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map((category) => (
                <a
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  {category.name}
                </a>
              ))}
            </div>
          )}

          <h1 
            className="text-4xl md:text-5xl font-bold mb-4 text-black dark:text-white"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
          
          <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            {author && (
              <span>By {author.name}</span>
            )}
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>
        </header>

        {/* Featured Image */}
        {featuredImage?.source_url && (
          <div className="featured-image-write-in relative w-full aspect-video mb-8 rounded-lg">
            <Image
              src={featuredImage.source_url}
              alt={featuredImage.alt_text || post.title.rendered}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div 
          className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-p:text-zinc-700 dark:prose-p:text-zinc-300"
          dangerouslySetInnerHTML={{ __html: post.content.rendered }}
        />
      </article>
    </div>
  );
}
