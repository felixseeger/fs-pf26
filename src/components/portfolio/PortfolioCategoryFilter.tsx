'use client';

import { WPCategory } from '@/types/wordpress';

interface PortfolioCategoryFilterProps {
  categories: WPCategory[];
  selectedId: number | null;
  onSelect: (categoryId: number | null) => void;
  className?: string;
}

export default function PortfolioCategoryFilter({
  categories,
  selectedId,
  onSelect,
  className = '',
}: PortfolioCategoryFilterProps) {
  if (categories.length === 0) return null;

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${className}`}
      role="group"
      aria-label="Filter by category"
    >
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
          selectedId === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700'
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelect(cat.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
            selectedId === cat.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
