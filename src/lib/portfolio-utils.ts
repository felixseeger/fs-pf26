import { WPPortfolioItem, WPServiceItem } from '@/types/wordpress';
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

/**
 * Return services that have at least one category matching the portfolio item's categories
 * (by slug or name, case-insensitive). Use for "Services used" on portfolio project pages.
 */
export function getServicesMatchingPortfolioCategories(
  services: WPServiceItem[],
  portfolioTerms: WPCategory[]
): WPServiceItem[] {
  if (portfolioTerms.length === 0) return [];
  const matchSet = new Set<string>();
  for (const t of portfolioTerms) {
    if (t.slug) matchSet.add(t.slug.toLowerCase());
    if (t.name) matchSet.add(t.name.toLowerCase().trim());
  }
  return services.filter((service) => {
    const terms = (service._embedded?.['wp:term']?.[0] ?? []) as WPCategory[];
    return terms.some(
      (t) =>
        (t.slug && matchSet.has(t.slug.toLowerCase())) ||
        (t.name && matchSet.has(t.name.toLowerCase().trim()))
    );
  });
}
