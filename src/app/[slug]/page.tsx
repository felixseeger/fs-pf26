import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPageBySlug } from '@/lib/wordpress';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    return {
      title: 'Page Not Found',
    };
  }

  const featuredImage = page._embedded?.['wp:featuredmedia']?.[0];

  return {
    title: page.title.rendered,
    description: page.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 160),
    openGraph: {
      title: page.title.rendered,
      description: page.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 160),
      images: featuredImage ? [featuredImage.source_url] : [],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const featuredImage = page._embedded?.['wp:featuredmedia']?.[0];

  return (
    <article className="max-w-4xl mx-auto px-4 py-16">
      {/* Header */}
      <header className="mb-8">
        <h1 
          className="text-4xl md:text-5xl font-bold mb-4 text-black dark:text-white"
          dangerouslySetInnerHTML={{ __html: page.title.rendered }}
        />
      </header>

      {/* Featured Image */}
      {featuredImage?.source_url && (
        <div className="relative w-full aspect-video mb-8 rounded-lg overflow-hidden">
          <Image
            src={featuredImage.source_url}
            alt={featuredImage.alt_text || page.title.rendered}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Content */}
      <div 
        className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400"
        dangerouslySetInnerHTML={{ __html: page.content.rendered }}
      />
    </article>
  );
}
