import { WPPortfolioItem } from '@/types/wordpress';
import type { WPCategory } from '@/types/wordpress';

/**
 * Extract unique categories from portfolio items (from _embedded wp:term).
 * Preserves order of first occurrence.
 */
export function getCategoriesFromPortfolioItems(
  items: WPPortfolioItem[]
): WPCategory[] {
  const seen = new Set<number>();
  const categories: WPCategory[] = [];
  const termList = items.flatMap(
    (item) => item._embedded?.['wp:term']?.[0] ?? []
  ) as WPCategory[];
  for (const term of termList) {
    if (term?.id != null && !seen.has(term.id)) {
      seen.add(term.id);
      categories.push(term);
    }
  }
  return categories.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Filter portfolio items by category id (null = all).
 */
export function filterPortfolioItemsByCategory(
  items: WPPortfolioItem[],
  categoryId: number | null
): WPPortfolioItem[] {
  if (categoryId == null) return items;
  return items.filter((item) => {
    const terms = (item._embedded?.['wp:term']?.[0] ?? []) as WPCategory[];
    return terms.some((t) => t.id === categoryId);
  });
}
