import Image from 'next/image';
import Link from 'next/link';
import type { WCProduct } from '@/types/woocommerce';

interface ProductCardProps {
  product: WCProduct;
}

function getTypeBadge(product: WCProduct): string | null {
  if (product.downloadable) return 'Digital';
  if (product.virtual) return 'Service';
  if (product.type === 'simple' || product.type === 'variable') return 'Physical';
  return null;
}

export default function ProductCard({ product }: ProductCardProps) {
  const image = product.images[0];
  const typeBadge = getTypeBadge(product);
  const isOutOfStock =
    !product.downloadable &&
    !product.virtual &&
    product.stock_status !== 'instock';
  const categoryNames = product.categories.map((c) => c.name);
  const href = `/shop/${product.slug}`;

  return (
    <article className="bg-white/15 dark:bg-zinc-900/80 backdrop-blur-md rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col border border-zinc-200/60 dark:border-zinc-800">
      {/* Image */}
      <Link href={href}>
        <div className="relative w-full aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {image?.src ? (
            <Image
              src={image.src}
              alt={image.alt || product.name}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-600">
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
      </Link>

      <div className="p-6 flex flex-col grow">
        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {typeBadge && (
            <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
              {typeBadge}
            </span>
          )}
          {categoryNames.map((cat, index) => (
            <span key={`${cat}-${index}`} className="inline-block text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              {cat}
            </span>
          ))}
          {isOutOfStock && (
            <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 ml-auto">
              Out of Stock
            </span>
          )}
        </div>

        {/* Name */}
        <Link href={href}>
          <h2 className="text-lg font-bold mb-2 text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
            {product.name}
          </h2>
        </Link>

        {/* Short description */}
        {product.short_description && (
          <p
            className="text-zinc-600 dark:text-zinc-400 text-sm mb-4 line-clamp-3 grow"
            dangerouslySetInnerHTML={{ __html: product.short_description }}
          />
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-4 mt-auto">
          {product.price && (
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-zinc-900 dark:text-white">
                {product.on_sale ? product.sale_price : product.price} €
              </span>
              {product.on_sale && product.regular_price && (
                <span className="text-sm text-zinc-400 line-through">
                  {product.regular_price} €
                </span>
              )}
            </div>
          )}
          <Link
            href={href}
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-sm transition-colors ml-auto"
          >
            View Product
            <svg className="ml-1.5 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
