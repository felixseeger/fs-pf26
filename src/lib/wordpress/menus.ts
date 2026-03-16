/**
 * Functions for fetching menu data from WordPress.
 * Supports Polylang language-aware menus via the `lang` parameter.
 *
 * With Polylang installed, WordPress creates separate navigation blocks per
 * language. We pass `?lang=de` / `?lang=en` to filter navigations, then fall
 * back to the generic slug search if no language-specific match is found.
 */
import { fetchWordPress } from './api';

// =============================================================================
// Types
// =============================================================================

export interface WPMenuItem {
  ID: number;
  title: string;
  url: string;
  target: string;
  classes: string[];
  menu_order: number;
  parent: number;
  object: string;
  object_id: number;
  type: string;
  type_label: string;
}

interface WPNavigation {
  id: number;
  title: {
    rendered: string;
  };
  slug: string;
  content: {
    rendered: string;
    protected: boolean;
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

function parseNavigationHTML(html: string): WPMenuItem[] {
  const items: WPMenuItem[] = [];
  const linkRegex = /<a[^>]*href="([^"]*)"[^>]*>(?:<span[^>]*>)?([^<]+)(?:<\/span>)?<\/a>/g;
  let match;
  let order = 0;

  while ((match = linkRegex.exec(html)) !== null) {
    const url = match[1];
    const title = match[2].trim();

    items.push({
      ID: order + 1,
      title,
      url,
      target: '',
      classes: [],
      menu_order: order,
      parent: 0,
      object: 'custom',
      object_id: 0,
      type: 'custom',
      type_label: 'Custom Link',
    });

    order++;
  }

  return items;
}

// =============================================================================
// Functions
// =============================================================================

/**
 * Fetches menu items for a given location slug, optionally filtered by Polylang language.
 *
 * With Polylang, WordPress registers language-specific navigation slugs, e.g.:
 *   primary-navigation (default / de)
 *   primary-navigation-en
 *
 * @param locationSlug - Navigation slug (e.g. 'primary-navigation')
 * @param lang         - Optional Polylang language code ('de' | 'en')
 */
export async function getMenuItems(locationSlug: string, lang?: string): Promise<WPMenuItem[]> {
  if (!locationSlug) return [];

  try {
    const navigations = await fetchWordPress<WPNavigation[]>(
      '/navigation',
      {
        per_page: 100,
        ...(lang ? { lang } : {}),
      },
      { suppressErrorLogging: true }
    );

    if (!navigations || navigations.length === 0) return [];

    // With Polylang, a language suffix might be appended to the slug:
    //   primary-navigation-en  /  primary-navigation-de  /  primary-navigation
    const langSuffix = lang && lang !== 'de' ? `-${lang}` : '';
    const searchTerms = [
      `${locationSlug}${langSuffix}`,       // e.g. primary-navigation-en (exact lang match)
      locationSlug,                          // e.g. primary-navigation    (default/fallback)
      locationSlug.replace(/-/g, '_'),       // e.g. primary_navigation
      locationSlug.replace(/-/g, ' '),       // e.g. primary navigation
      locationSlug.replace(/_/g, '-'),       // e.g. quick-links
      // Also match when the slug word-order or hyphens vary
      ...locationSlug.split(/[-_]/).filter(Boolean), // individual words: "primary", "navigation", "quick", "links"
    ];

    const navigation = navigations.find(nav => {
      const slug = nav.slug.toLowerCase();
      const title = (nav.title?.rendered ?? '').toLowerCase();
      return searchTerms.some(term => {
        const t = term.toLowerCase();
        return slug === t || title === t || slug.includes(t) || title.includes(t);
      });
    });

    if (!navigation) {
      // No slug/title match — fall back to the navigation with the most parsed links
      // (avoids accidentally returning a sparse footer-legal menu as primary nav).
      const withCounts = navigations
        .filter(n => n.content?.rendered)
        .map(n => ({ nav: n, count: parseNavigationHTML(n.content.rendered).length }))
        .sort((a, b) => b.count - a.count);

      const fallbackNav = withCounts[0]?.nav;
      if (fallbackNav?.content?.rendered) {
        return parseNavigationHTML(fallbackNav.content.rendered);
      }
      return [];
    }

    if (navigation.content?.rendered) {
      return parseNavigationHTML(navigation.content.rendered);
    }

    return [];
  } catch {
    return [];
  }
}

export async function getNavigations(lang?: string): Promise<WPNavigation[]> {
  try {
    return await fetchWordPress<WPNavigation[]>(
      '/navigation',
      {
        per_page: 100,
        ...(lang ? { lang } : {}),
      },
      { suppressErrorLogging: true }
    );
  } catch {
    return [];
  }
}
