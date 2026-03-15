'use client';

import { useState } from 'react';
import type { WCProduct, WCProductCategory } from '@/types/woocommerce';
import ProductCard from './ProductCard';

interface ShopGridProps {
  products: WCProduct[];
  categories: WCProductCategory[];
}

function getCategoryKey(category: WCProductCategory, index: number): string {
  if (category.id > 0) return `category-${category.id}`;
  if (category.slug) return `category-${category.slug}`;
  return `category-${category.name}-${index}`;
}

function getProductKey(product: WCProduct, index: number): string {
  if (product.id > 0) return `product-${product.id}`;
  if (product.slug) return `product-${product.slug}`;
  return `product-${product.name}-${index}`;
}

export default function ShopGrid({ products, categories }: ShopGridProps) {
  const [activeSlug, setActiveSlug] = useState<string>('all');

  const filtered =
    activeSlug === 'all'
      ? products
      : products.filter((p) =>
          p.categories.some((c) => c.slug === activeSlug)
        );

  return (
    <div>
      {/* Category filter tabs */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            onClick={() => setActiveSlug('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors border ${
              activeSlug === 'all'
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent'
                : 'bg-transparent text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:border-zinc-500 dark:hover:border-zinc-500'
            }`}
          >
            All
          </button>
          {categories.map((cat, index) => (
            <button
              key={getCategoryKey(cat, index)}
              onClick={() => setActiveSlug(cat.slug)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors border ${
                activeSlug === cat.slug
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent'
                  : 'bg-transparent text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:border-zinc-500 dark:hover:border-zinc-500'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-12 text-center">
          <p className="text-zinc-600 dark:text-zinc-400">
            No products found in this category.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product, index) => (
            <li key={getProductKey(product, index)}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
