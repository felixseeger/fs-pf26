/**
 * Functions for fetching menu data from WordPress.
 * Uses WordPress v2 navigation endpoints (Block-based navigation).
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

/**
 * Parse HTML navigation content to extract menu items
 */
function parseNavigationHTML(html: string): WPMenuItem[] {
  const items: WPMenuItem[] = [];

  // Match all navigation links in the HTML
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
 * Fetches the items for a specific menu location.
 * Uses WordPress v2 navigation endpoint.
 *
 * @param {string} locationSlug - The slug of the menu location (e.g., 'primary-navigation', 'secondary-navigation')
 * @returns {Promise<WPMenuItem[]>} A promise that resolves to an array of menu item objects
 */
export async function getMenuItems(locationSlug: string): Promise<WPMenuItem[]> {
  if (!locationSlug) {
    return [];
  }

  try {
    // Fetch all navigation menus
    const navigations = await fetchWordPress<WPNavigation[]>(
      '/navigation',
      { per_page: 100 },
      { suppressErrorLogging: true }
    );

    if (!navigations || navigations.length === 0) {
      return [];
    }

    // Try to find navigation by matching slug or title
    // Common patterns: 'primary-navigation', 'quick-links', 'footer_legal'
    const searchTerms = [
      locationSlug,
      locationSlug.replace(/-/g, '_'),
      locationSlug.replace(/-/g, ' '),
      locationSlug.replace(/_/g, '-'),
      locationSlug.replace('-navigation', ''),
      locationSlug.replace('navigation-', ''),
    ];

    const navigation = navigations.find(nav => {
      const slug = nav.slug.toLowerCase();
      const title = (nav.title?.rendered ?? '').toLowerCase();
      return searchTerms.some(term => {
        const t = term.toLowerCase();
        return slug.includes(t) || title.includes(t);
      });
    });

    if (!navigation) {
      // If no match found, use first navigation for primary, last for secondary
      const fallbackNav = locationSlug.includes('primary')
        ? navigations[0]
        : navigations[navigations.length - 1];

      if (fallbackNav && fallbackNav.content?.rendered) {
        return parseNavigationHTML(fallbackNav.content.rendered);
      }

      return [];
    }

    // Parse the HTML content to extract menu items
    if (navigation.content?.rendered) {
      return parseNavigationHTML(navigation.content.rendered);
    }

    return [];
  } catch (error) {
    // Silently fail - menus are optional, components will use fallback
    return [];
  }
}

/**
 * Fetches all available navigation menus.
 *
 * @returns {Promise<WPNavigation[]>} A promise that resolves to navigation menus
 */
export async function getNavigations(): Promise<WPNavigation[]> {
  try {
    return await fetchWordPress<WPNavigation[]>(
      '/navigation',
      { per_page: 100 },
      { suppressErrorLogging: true }
    );
  } catch (error) {
    return [];
  }
}
