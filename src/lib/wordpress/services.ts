/**
 * Services module for WordPress REST API
 * Handles all service-related API functions
 */

import { WPServiceItem, FeaturedMedia, ACFImage } from '@/types/wordpress';
import { fetchWordPress } from './api';

/**
 * Get all service items with pagination
 * @param perPage - Number of items per page (default: 12)
 * @param page - Page number (default: 1)
 */
export async function getServiceItems(
    perPage: number = 100,
    page: number = 1
): Promise<WPServiceItem[]> {
    try {
        const services = await fetchWordPress<WPServiceItem[]>('/services', {
            _embed: true,
            per_page: perPage,
            page,
            orderby: 'menu_order',
            order: 'asc',
        }, { suppressErrorLogging: true });
        return Array.isArray(services) ? services : [];
    } catch (error) {
        console.error('Error fetching service items:', error);
        return [];
    }
}

/**
 * Get a single service item by slug
 * @param slug - Service item slug
 */
export async function getServiceItemBySlug(slug: string): Promise<WPServiceItem | null> {
    try {
        const services = await fetchWordPress<WPServiceItem[]>('/services', {
            slug,
            _embed: true,
        });
        if (services.length > 1) {
            console.warn(`Multiple service items found for slug '${slug}':`, services.map(s => s.id));
        }
        return services.length > 0 ? services[0] : null;
    } catch (error) {
        console.error(`Error fetching service item by slug '${slug}':`, error);
        return null;
    }
}

/**
 * Get previous and next service items by current slug (same order as list: menu_order asc).
 * Returns thumbnails from services_gallery or featured media for use in post navigation.
 */
export async function getServiceNeighbors(slug: string): Promise<{
    previous: { slug: string; title: string; thumbnailUrl: string | null; thumbnailAlt?: string } | null;
    next: { slug: string; title: string; thumbnailUrl: string | null; thumbnailAlt?: string } | null;
}> {
    const items = await getServiceItems(100, 1).catch(() => []);
    const index = items.findIndex((s) => s.slug === slug);
    if (index === -1) return { previous: null, next: null };

    const prevItem = index > 0 ? items[index - 1] : null;
    const nextItem = index < items.length - 1 && index >= 0 ? items[index + 1] : null;

    const toNavItem = (s: WPServiceItem) => {
        const gallery = s.acf?.services_gallery;
        const iconUrl =
            gallery && typeof gallery === 'object' && 'url' in gallery
                ? (gallery as ACFImage).url
                : s._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null;
        const iconAlt =
            gallery && typeof gallery === 'object' && 'alt' in gallery
                ? (gallery as ACFImage).alt
                : s._embedded?.['wp:featuredmedia']?.[0]?.alt_text;
        const title = s.title?.rendered?.replace(/<[^>]*>/g, '').trim() || 'Untitled';
        return {
            slug: s.slug,
            title,
            thumbnailUrl: iconUrl ?? null,
            thumbnailAlt: iconAlt ?? title,
        };
    };

    return {
        previous: prevItem ? toNavItem(prevItem) : null,
        next: nextItem ? toNavItem(nextItem) : null,
    };
}

/**
 * Get all image attachments for a service item
 * @param postId - The service post ID
 */
export async function getServiceAttachments(postId: number): Promise<FeaturedMedia[]> {
    try {
        const attachments = await fetchWordPress<FeaturedMedia[]>('/media', {
            parent: postId,
            per_page: 20,
            orderby: 'date',
            order: 'asc',
        });
        return attachments;
    } catch (error) {
        console.error(`Error fetching attachments for service item ${postId}:`, error);
        return [];
    }
}
