'use client';

import { useState, useMemo } from 'react';
import { WPPortfolioItem } from '@/types/wordpress';
import { getCategoriesFromPortfolioItems, filterPortfolioItemsByCategory } from '@/lib/portfolio-utils';
import PortfolioCategoryFilter from './PortfolioCategoryFilter';
import PortfolioGrid from './PortfolioGrid';

interface PortfolioGridWithFilterProps {
  items: WPPortfolioItem[];
  title?: string;
}

export default function PortfolioGridWithFilter({ items, title }: PortfolioGridWithFilterProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const categories = useMemo(() => getCategoriesFromPortfolioItems(items), [items]);
  const filteredItems = useMemo(
    () => filterPortfolioItemsByCategory(items, selectedCategoryId),
    [items, selectedCategoryId]
  );

  return (
    <section className="w-full">
      {categories.length > 0 && (
        <div className="mb-8">
          <PortfolioCategoryFilter
            categories={categories}
            selectedId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
          />
        </div>
      )}
      <PortfolioGrid items={filteredItems} title={title} />
    </section>
  );
}
