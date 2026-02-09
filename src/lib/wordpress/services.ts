import { fetchWordPress } from './api';

export interface WPService {
  id: number;
  slug: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt?: {
    rendered: string;
  };
  menu_order?: number;
  acf?: {
    icon?: string; // Icon name or class (e.g., 'Code2', 'Palette')
    description?: string;
    short_description?: string;
  };
}

/**
 * Fetch all services from WordPress
 * @param perPage - Number of services to fetch (default: 100)
 * @returns Array of WPService objects
 */
export async function getServices(perPage = 100): Promise<WPService[]> {
  try {
    const services = await fetchWordPress<WPService[]>('/services', {
      per_page: perPage,
      orderby: 'menu_order',
      order: 'asc',
      _embed: false,
    });

    return services || [];
  } catch (error) {
    console.error('Failed to fetch services from WordPress:', error);
    return [];
  }
}

/**
 * Fetch a single service by slug
 * @param slug - Service slug
 * @returns WPService object or null if not found
 */
export async function getServiceBySlug(slug: string): Promise<WPService | null> {
  try {
    const services = await fetchWordPress<WPService[]>('/services', {
      slug,
      _embed: false,
    });

    return services.length > 0 ? services[0] : null;
  } catch (error) {
    console.error(`Failed to fetch service with slug "${slug}":`, error);
    return null;
  }
}
