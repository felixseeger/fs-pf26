import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getProductBySlug, getProductVariations, getProducts } from '@/lib/woocommerce';
import { getCanonicalUrl } from '@/lib/site-config';
import DotMatrixStatic from '@/components/DotMatrix/DotMatrixStatic';
import Breadcrumb from '@/components/ui/Breadcrumb';
import ProductImageCarousel from '@/components/shop/ProductImageCarousel';
import ProductVariantSelector from '@/components/shop/ProductVariantSelector';

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await getProducts(100).catch(() => []);
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product Not Found' };
  const description = product.short_description.replace(/<[^>]*>/g, '').trim().slice(0, 160);
  return {
    title: `${product.name} | Shop`,
    description,
    alternates: { canonical: getCanonicalUrl(`/shop/${slug}`) },
    openGraph: {
      title: product.name,
      description,
      images: product.images[0] ? [product.images[0].src] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  // Fetch variations in parallel only for variable products
  const variations = product.type === 'variable'
    ? await getProductVariations(product.id)
    : [];

  const typeBadge = product.downloadable
    ? 'Digital Download'
    : product.virtual
    ? 'Service'
    : 'Physical Product';

  const cleanDesc = product.short_description.replace(/<[^>]*>/g, '').trim();

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: product.name, path: `/shop/${slug}` },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-background" suppressHydrationWarning>
      <section className="relative overflow-hidden">
        <DotMatrixStatic color="#4ade80" dotSize={2} spacing={20} opacity={0.18} className="-z-10" />

        <div className="max-w-6xl mx-auto px-6 pt-28 pb-24">
          {/* Breadcrumb */}
          <div className="mb-12">
            <Breadcrumb items={breadcrumbs} />
          </div>

          {/* Split layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-12 lg:gap-16 items-start">

            {/* ── Image panel (sticky) ── */}
            <div className="lg:sticky lg:top-28">
              {product.images.length > 0 ? (
                <ProductImageCarousel images={product.images} productName={product.name} />
              ) : (
                <div className="relative w-full aspect-4/5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                  <span className="text-zinc-300 dark:text-zinc-700 text-7xl font-black font-unbounded select-none">
                    {product.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* ── Info panel ── */}
            <div className="flex flex-col">

              {/* Categories */}
              {product.categories.length > 0 && (
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-4">
                  {product.categories.map((c) => c.name).join(' · ')}
                </p>
              )}

              {/* Product name */}
              <h1
                className="font-unbounded font-black text-zinc-900 dark:text-white leading-[1.05] mb-8"
                style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
              >
                {product.name}
              </h1>

              {/* Description */}
              {cleanDesc && (
                <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed mb-8 max-w-prose">
                  {cleanDesc}
                </p>
              )}

              {/* Type badge */}
              <div className="mb-8">
                <span className="text-sm font-semibold px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {typeBadge}
                </span>
              </div>

              {/* Interactive: price + variant selector + buy button */}
              <ProductVariantSelector product={product} variations={variations} />

              {/* Back link */}
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors group w-fit"
              >
                <svg
                  className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Shop
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
